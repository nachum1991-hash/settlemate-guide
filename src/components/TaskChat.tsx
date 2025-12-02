import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
  };
}

interface TaskChatProps {
  taskId: string;
  phase: string;
}

export const TaskChat = ({ taskId, phase }: TaskChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch existing messages
    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`task-chat-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_messages',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
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
    const userIds = [...new Set(data.map(m => m.user_id))];
    const profileMap = new Map<string, { full_name: string | null }>();
    
    // Fetch profile info for each user using the secure function
    await Promise.all(
      userIds.map(async (userId) => {
        const { data: profileData } = await supabase
          .rpc('get_profile_display_info', { profile_user_id: userId });
        
        if (profileData && profileData.length > 0) {
          profileMap.set(userId, { full_name: profileData[0].full_name });
        } else {
          profileMap.set(userId, { full_name: null });
        }
      })
    );
    
    const messagesWithProfiles = data.map(msg => ({
      ...msg,
      profiles: profileMap.get(msg.user_id) || { full_name: null }
    }));

    setMessages(messagesWithProfiles as Message[]);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);

    const { error } = await supabase.from('task_messages').insert({
      task_id: taskId,
      phase: phase,
      user_id: user.id,
      message: newMessage.trim(),
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return;
    }

    setNewMessage('');
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
    <div className="flex flex-col h-[400px] border rounded-lg bg-card">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Community Chat
        </h3>
        <p className="text-sm text-muted-foreground">Ask questions and share experiences</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {message.profiles.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">
                      {message.profiles.full_name || 'Anonymous User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90">{message.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
