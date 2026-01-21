import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, Reply, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { MessageReactions } from './MessageReactions';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  reply_to_id: string | null;
  profiles: {
    full_name: string | null;
  };
  replyToMessage?: {
    message: string;
    profiles: { full_name: string | null };
  };
  reactions: Reaction[];
}

interface TaskChatProps {
  taskId: string;
  phase: string;
}

const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export const TaskChat = ({ taskId, phase }: TaskChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const { user, supabase: authSupabase } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch existing messages
    fetchMessages();

    // Set up realtime subscription
    const channel = authSupabase
      .channel(`task-chat-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_messages',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      authSupabase.removeChannel(channel);
    };
  }, [taskId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await authSupabase
      .from('task_messages')
      .select('*')
      .eq('task_id', taskId)
      .eq('phase', phase)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    if (!data) {
      setMessages([]);
      return;
    }

    // Fetch profile display info securely using the SECURITY DEFINER function
    const userIds = [...new Set((data as any[]).map((m: any) => m.user_id as string))];
    const profileMap = new Map<string, { full_name: string | null }>();

    // Fetch profile info for each user using the secure function
    await Promise.all(
      userIds.map(async (userId) => {
        const { data: profileDataRaw } = await authSupabase
          .rpc('get_profile_display_info', { profile_user_id: userId });

        const profileData = profileDataRaw as
          | Array<{ full_name: string | null; avatar_url: string | null }>
          | null;

        if (profileData && profileData.length > 0) {
          profileMap.set(userId, { full_name: profileData[0].full_name });
        } else {
          profileMap.set(userId, { full_name: null });
        }
      })
    );

    // Fetch reactions for all messages
    const messageIds = (data as any[]).map((m: any) => m.id);
    const { data: reactionsData } = await authSupabase
      .from('message_reactions')
      .select('message_id, emoji, user_id')
      .in('message_id', messageIds);

    // Group reactions by message
    const reactionsMap = new Map<string, Map<string, { count: number; userReacted: boolean }>>();
    
    if (reactionsData) {
      (reactionsData as any[]).forEach((reaction: any) => {
        if (!reactionsMap.has(reaction.message_id)) {
          reactionsMap.set(reaction.message_id, new Map());
        }
        const messageReactions = reactionsMap.get(reaction.message_id)!;
        
        if (!messageReactions.has(reaction.emoji)) {
          messageReactions.set(reaction.emoji, { count: 0, userReacted: false });
        }
        const emojiData = messageReactions.get(reaction.emoji)!;
        emojiData.count++;
        if (reaction.user_id === user?.id) {
          emojiData.userReacted = true;
        }
      });
    }

    // Create a map of messages for quick lookup of replies
    const messageMap = new Map<string, any>();
    (data as any[]).forEach((msg: any) => {
      messageMap.set(msg.id, msg);
    });

    const messagesWithProfiles = (data as any[]).map((msg: any) => {
      // Build reactions array for this message
      const messageReactionsMap = reactionsMap.get(msg.id);
      const reactions: Reaction[] = ALLOWED_EMOJIS.map(emoji => {
        const data = messageReactionsMap?.get(emoji);
        return {
          emoji,
          count: data?.count || 0,
          userReacted: data?.userReacted || false,
        };
      });

      const baseMessage = {
        ...msg,
        profiles: profileMap.get(msg.user_id) || { full_name: null },
        reactions,
      };

      // Add reply context if this message is a reply
      if (msg.reply_to_id) {
        const replyToMsg = messageMap.get(msg.reply_to_id);
        if (replyToMsg) {
          baseMessage.replyToMessage = {
            message: replyToMsg.message,
            profiles: profileMap.get(replyToMsg.user_id) || { full_name: null },
          };
        }
      }

      return baseMessage;
    });

    setMessages(messagesWithProfiles as Message[]);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReactionToggle = async (messageId: string, emoji: string) => {
    if (!user) return;

    const { error } = await authSupabase.functions.invoke('toggle-reaction', {
      body: { message_id: messageId, emoji },
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
        variant: 'destructive',
      });
      return;
    }

    // Optimistically update UI
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      
      const updatedReactions = msg.reactions.map(r => {
        if (r.emoji !== emoji) return r;
        
        if (r.userReacted) {
          return { ...r, count: r.count - 1, userReacted: false };
        } else {
          return { ...r, count: r.count + 1, userReacted: true };
        }
      });
      
      return { ...msg, reactions: updatedReactions };
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    
    if (!trimmedMessage || !user) return;

    // Client-side validation for instant UX feedback
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: 'Message too long',
        description: `Messages must be ${MAX_MESSAGE_LENGTH} characters or less.`,
        variant: 'destructive',
      });
      return;
    }

    if (trimmedMessage.length < 1) {
      return;
    }

    setLoading(true);

    // Call backend function for server-side validation and rate limiting
    const { data, error } = await authSupabase.functions.invoke('send-chat-message', {
      body: {
        task_id: taskId,
        phase: phase,
        message: trimmedMessage,
        reply_to_id: replyingTo?.id || null,
      },
    });

    setLoading(false);

    if (error) {
      console.error('Edge function error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return;
    }

    // Handle rate limit or validation errors from the backend
    if (data?.error) {
      const isRateLimit = data.error === 'Rate limit exceeded';
      toast({
        title: isRateLimit ? 'Rate limit exceeded' : 'Error',
        description: data.message || data.error,
        variant: 'destructive',
      });
      return;
    }

    setNewMessage('');
    setReplyingTo(null);
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Sign in to join the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[60vh] min-h-[300px] max-h-[500px] border rounded-lg bg-card">
      <div className="p-3 sm:p-4 border-b bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Community Chat
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Ask questions and share experiences</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3 group">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {message.profiles.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {message.profiles.full_name || 'Anonymous User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setReplyingTo(message)}
                    >
                      <Reply className="w-3 h-3" />
                    </Button>
                  </div>
                  {message.replyToMessage && (
                    <div className="text-xs bg-muted/50 rounded px-2 py-1 border-l-2 border-primary/50">
                      <span className="font-medium text-muted-foreground">
                        {message.replyToMessage.profiles.full_name || 'Anonymous User'}
                      </span>
                      <p className="text-muted-foreground truncate">
                        {message.replyToMessage.message}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-foreground/90">{message.message}</p>
                  <MessageReactions
                    messageId={message.id}
                    reactions={message.reactions}
                    onReactionToggle={handleReactionToggle}
                  />
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {replyingTo && (
        <div className="px-3 sm:px-4 py-2 bg-muted/50 border-t flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
            <Reply className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground flex-shrink-0">Replying to</span>
            <span className="font-medium truncate">
              {replyingTo.profiles.full_name || 'Anonymous User'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={() => setReplyingTo(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
              className="min-h-[60px] resize-none text-sm"
              disabled={loading}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <div className="text-xs text-muted-foreground text-right">
              {newMessage.length}/{MAX_MESSAGE_LENGTH}
            </div>
          </div>
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()} className="min-h-[44px] min-w-[44px] h-11 w-11 sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
