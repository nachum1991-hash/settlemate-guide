import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send, MessageCircle, Reply, X, ShieldCheck, Pin, MoreVertical,
  Pencil, Trash2, UserX, Check,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { MessageReactions } from './MessageReactions';
import { universities } from '@/data/onboardingOptions';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface SenderProfile {
  full_name: string | null;
  university: string | null;
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  edited_at: string | null;
  user_id: string;
  reply_to_id: string | null;
  profiles: SenderProfile;
  replyToMessage?: {
    message: string;
    profiles: SenderProfile;
  };
  reactions: Reaction[];
}

interface TaskChatProps {
  taskId: string;
  phase: string;
}

const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];
const EDIT_WINDOW_MS = 15 * 60 * 1000;

const universityLabel = (slug: string | null | undefined) => {
  if (!slug || slug === 'other') return null;
  return universities.find((u) => u.value === slug)?.label ?? null;
};

const formatSender = (p: SenderProfile) => {
  const name = p.full_name?.trim() || 'Anonymous User';
  const uni = universityLabel(p.university);
  return { name, uni };
};

export const TaskChat = ({ taskId, phase }: TaskChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const [welcomeText, setWelcomeText] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; mode: 'own' | 'admin' } | null>(null);
  const [confirmBan, setConfirmBan] = useState<{ userId: string; name: string } | null>(null);

  const { user, supabase: authSupabase } = useAuth();
  const { verified, loading: verifLoading } = useVerification();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstEnteredRef = useRef<string | null>(null);
  const welcomeShownRef = useRef(false);
  const initedRef = useRef(false);

  // Fetch a single sender profile via secure RPC
  const fetchProfile = async (userId: string): Promise<SenderProfile> => {
    const { data } = await authSupabase.rpc('get_profile_display_info', {
      profile_user_id: userId,
    });
    const row = (data as Array<{ full_name: string | null; university: string | null }> | null)?.[0];
    return {
      full_name: row?.full_name ?? null,
      university: row?.university ?? null,
    };
  };

  const buildReactionsForMessage = (
    rows: Array<{ emoji: string; user_id: string }> | null | undefined,
  ): Reaction[] => {
    const map = new Map<string, { count: number; userReacted: boolean }>();
    (rows || []).forEach((r) => {
      const cur = map.get(r.emoji) || { count: 0, userReacted: false };
      cur.count++;
      if (r.user_id === user?.id) cur.userReacted = true;
      map.set(r.emoji, cur);
    });
    return ALLOWED_EMOJIS.map((emoji) => ({
      emoji,
      count: map.get(emoji)?.count || 0,
      userReacted: map.get(emoji)?.userReacted || false,
    }));
  };

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

    const rows = data as any[];
    const userIds = [...new Set(rows.map((m) => m.user_id as string))];
    const profileMap = new Map<string, SenderProfile>();
    await Promise.all(
      userIds.map(async (uid) => {
        profileMap.set(uid, await fetchProfile(uid));
      }),
    );

    const messageIds = rows.map((m) => m.id);
    const reactionsMap = new Map<string, Array<{ emoji: string; user_id: string }>>();
    if (messageIds.length > 0) {
      const { data: reactionsData } = await authSupabase
        .from('message_reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);
      (reactionsData as any[] | null)?.forEach((r) => {
        const arr = reactionsMap.get(r.message_id) || [];
        arr.push({ emoji: r.emoji, user_id: r.user_id });
        reactionsMap.set(r.message_id, arr);
      });
    }

    const messageMap = new Map<string, any>();
    rows.forEach((m) => messageMap.set(m.id, m));

    const hydrated: Message[] = rows.map((msg) => {
      const base: Message = {
        id: msg.id,
        message: msg.message,
        created_at: msg.created_at,
        edited_at: msg.edited_at ?? null,
        user_id: msg.user_id,
        reply_to_id: msg.reply_to_id ?? null,
        profiles: profileMap.get(msg.user_id) || { full_name: null, university: null },
        reactions: buildReactionsForMessage(reactionsMap.get(msg.id)),
      };
      if (msg.reply_to_id) {
        const parent = messageMap.get(msg.reply_to_id);
        if (parent) {
          base.replyToMessage = {
            message: parent.message,
            profiles: profileMap.get(parent.user_id) || { full_name: null, university: null },
          };
        }
      }
      return base;
    });

    setMessages(hydrated);
  };

  // Init: ban check + join + settings + initial fetch (once per taskId/phase/user)
  useEffect(() => {
    if (!user || !verified || verifLoading) return;
    if (initedRef.current) return;
    initedRef.current = true;

    (async () => {
      // 1. Ban check
      const { data: banRow } = await authSupabase
        .from('chat_bans')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (banRow) {
        setIsBanned(true);
        return;
      }

      // 2. Join channel
      const { data: joinData, error: joinErr } = await authSupabase.rpc('join_chat_channel', {
        _task_id: taskId,
        _phase: phase,
      });
      if (joinErr) {
        console.error('join_chat_channel failed:', joinErr);
        toast({ title: 'Unable to open chat', description: joinErr.message, variant: 'destructive' });
        return;
      }
      const row = (joinData as Array<{ first_entered_at: string; was_new: boolean }> | null)?.[0];
      firstEnteredRef.current = row?.first_entered_at ?? null;
      const wasNew = !!row?.was_new;

      // 3. Chat settings
      const { data: settings } = await authSupabase
        .from('chat_settings')
        .select('welcome_message, pinned_message')
        .eq('task_id', taskId)
        .eq('phase', phase)
        .maybeSingle();
      const s = settings as { welcome_message: string | null; pinned_message: string | null } | null;
      setPinnedMessage(s?.pinned_message ?? null);
      setWelcomeText(s?.welcome_message ?? null);
      if (wasNew && s?.welcome_message && !welcomeShownRef.current) {
        welcomeShownRef.current = true;
        setShowWelcome(true);
      }

      // 4. Messages
      await fetchMessages();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, phase, user, verified, verifLoading]);

  // Reset init flag when channel identity changes
  useEffect(() => {
    initedRef.current = false;
    welcomeShownRef.current = false;
    firstEnteredRef.current = null;
    setMessages([]);
    setPinnedMessage(null);
    setWelcomeText(null);
    setIsBanned(false);
    setEditingId(null);
    setReplyingTo(null);
  }, [taskId, phase]);

  // Realtime subscription
  useEffect(() => {
    if (!user || !verified || isBanned) return;

    const channel = authSupabase
      .channel(`task-chat-${taskId}-${phase}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_messages', filter: `task_id=eq.${taskId}` },
        async (payload) => {
          const row: any = payload.new;
          if (row.phase !== phase) return;
          // RLS-based hide: if before firstEntered, skip
          if (firstEnteredRef.current && new Date(row.created_at) < new Date(firstEnteredRef.current)) return;
          if (row.user_id === user.id) {
            // Local send already handled? We still hydrate to be safe.
          }
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return prev;
          });
          const sender = await fetchProfile(row.user_id);
          const { data: rxRows } = await authSupabase
            .from('message_reactions')
            .select('emoji, user_id')
            .eq('message_id', row.id);
          let replyPreview: Message['replyToMessage'];
          if (row.reply_to_id) {
            const { data: parent } = await authSupabase
              .from('task_messages')
              .select('message, user_id')
              .eq('id', row.reply_to_id)
              .maybeSingle();
            if (parent) {
              const parentSender = await fetchProfile((parent as any).user_id);
              replyPreview = { message: (parent as any).message, profiles: parentSender };
            }
          }
          const hydrated: Message = {
            id: row.id,
            message: row.message,
            created_at: row.created_at,
            edited_at: row.edited_at ?? null,
            user_id: row.user_id,
            reply_to_id: row.reply_to_id ?? null,
            profiles: sender,
            reactions: buildReactionsForMessage(rxRows as any),
            replyToMessage: replyPreview,
          };
          setMessages((prev) => (prev.some((m) => m.id === hydrated.id) ? prev : [...prev, hydrated]));
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'task_messages', filter: `task_id=eq.${taskId}` },
        (payload) => {
          const row: any = payload.new;
          if (row.phase !== phase) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === row.id
                ? { ...m, message: row.message, edited_at: row.edited_at ?? null }
                : m,
            ),
          );
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'task_messages', filter: `task_id=eq.${taskId}` },
        (payload) => {
          const row: any = payload.old;
          setMessages((prev) => prev.filter((m) => m.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      authSupabase.removeChannel(channel);
    };
  }, [taskId, phase, user, verified, isBanned, authSupabase]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReactionToggle = async (messageId: string, emoji: string) => {
    if (!user) return;
    const { error } = await authSupabase.functions.invoke('toggle-reaction', {
      body: { message_id: messageId, emoji },
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to update reaction', variant: 'destructive' });
      return;
    }
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const updated = msg.reactions.map((r) => {
          if (r.emoji !== emoji) return r;
          return r.userReacted
            ? { ...r, count: Math.max(0, r.count - 1), userReacted: false }
            : { ...r, count: r.count + 1, userReacted: true };
        });
        return { ...msg, reactions: updated };
      }),
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !user) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      toast({ title: 'Message too long', description: `Max ${MAX_MESSAGE_LENGTH} characters.`, variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { data, error } = await authSupabase.functions.invoke('send-chat-message', {
      body: { task_id: taskId, phase, message: trimmed, reply_to_id: replyingTo?.id || null },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      return;
    }
    if (data?.error) {
      if (data.error === 'banned') {
        setIsBanned(true);
      }
      toast({
        title: data.error === 'Rate limit exceeded' ? 'Slow down' : 'Error',
        description: data.message || data.error,
        variant: 'destructive',
      });
      return;
    }
    setNewMessage('');
    setReplyingTo(null);
  };

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditDraft(msg.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft('');
  };

  const saveEdit = async (id: string) => {
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    const { data, error } = await authSupabase.functions.invoke('edit-chat-message', {
      body: { message_id: id, new_message: trimmed },
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to edit', variant: 'destructive' });
      return;
    }
    if (data?.error) {
      toast({ title: 'Cannot edit', description: data.message || data.error, variant: 'destructive' });
      return;
    }
    cancelEdit();
    // realtime UPDATE will patch state; also patch optimistically:
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, message: trimmed, edited_at: new Date().toISOString() } : m)),
    );
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const fn = confirmDelete.mode === 'admin' ? 'admin-delete-message' : 'delete-own-message';
    const { data, error } = await authSupabase.functions.invoke(fn, {
      body: { message_id: confirmDelete.id },
    });
    setConfirmDelete(null);
    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || 'Failed to delete', variant: 'destructive' });
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== confirmDelete.id));
  };

  const doBan = async () => {
    if (!confirmBan) return;
    const { data, error } = await authSupabase.functions.invoke('admin-ban-user', {
      body: { target_user_id: confirmBan.userId },
    });
    setConfirmBan(null);
    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || 'Failed to ban', variant: 'destructive' });
      return;
    }
    toast({ title: 'User banned', description: `${confirmBan.name} can no longer post.` });
  };

  const canEdit = (msg: Message) =>
    msg.user_id === user?.id && Date.now() - new Date(msg.created_at).getTime() < EDIT_WINDOW_MS;

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Sign in to join the conversation</p>
      </div>
    );
  }

  if (!verifLoading && !verified) {
    return (
      <div className="border rounded-lg bg-card p-6 sm:p-8 text-center space-y-3">
        <div className="rounded-full bg-primary/10 p-3 inline-flex">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-base">Verify to join the chat</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The community chat is for verified students only. Confirm your university email or upload your acceptance letter — guides and FAQs stay open to everyone.
        </p>
        <Button asChild className="min-h-[44px]">
          <Link to="/verify">Verify your student status</Link>
        </Button>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="border rounded-lg bg-card p-6 sm:p-8 text-center space-y-3">
        <div className="rounded-full bg-destructive/10 p-3 inline-flex">
          <UserX className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="font-semibold text-base">You've been removed from this chat</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          A moderator has restricted your access to the community chat. If you think this was a mistake, contact support.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[60vh] min-h-[300px] max-h-[500px] border rounded-lg bg-card">
        <div className="p-3 sm:p-4 border-b bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Community Chat
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Ask questions and share experiences</p>
        </div>

        {pinnedMessage && (
          <div className="px-3 sm:px-4 py-2 border-b bg-primary/5 flex items-start gap-2">
            <Pin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap break-words">
              {pinnedMessage}
            </p>
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const { name, uni } = formatSender(message.profiles);
                const isOwn = message.user_id === user.id;
                const editing = editingId === message.id;
                return (
                  <div key={message.id} className="flex gap-3 group">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {name[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-sm">{name}</span>
                        {uni && (
                          <span className="text-xs text-muted-foreground">· {uni}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                        {message.edited_at && (
                          <span className="text-xs text-muted-foreground italic">(edited)</span>
                        )}
                        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => setReplyingTo(message)}
                            aria-label="Reply"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 px-2" aria-label="More">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {isOwn && canEdit(message) && (
                                <DropdownMenuItem onClick={() => startEdit(message)}>
                                  <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                              )}
                              {isOwn && (
                                <DropdownMenuItem
                                  onClick={() => setConfirmDelete({ id: message.id, mode: 'own' })}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              )}
                              {isAdmin && !isOwn && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => setConfirmDelete({ id: message.id, mode: 'admin' })}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete (admin)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setConfirmBan({ userId: message.user_id, name })}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserX className="w-4 h-4 mr-2" /> Ban this user
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {message.replyToMessage && (
                        <div className="text-xs bg-muted/50 rounded px-2 py-1 border-l-2 border-primary/50">
                          <span className="font-medium text-muted-foreground">
                            {formatSender(message.replyToMessage.profiles).name}
                          </span>
                          {formatSender(message.replyToMessage.profiles).uni && (
                            <span className="text-muted-foreground">
                              {' · '}{formatSender(message.replyToMessage.profiles).uni}
                            </span>
                          )}
                          <p className="text-muted-foreground truncate">
                            {message.replyToMessage.message}
                          </p>
                        </div>
                      )}
                      {editing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                            className="min-h-[60px] resize-none text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveEdit(message.id)} disabled={!editDraft.trim()}>
                              <Check className="w-3.5 h-3.5 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      )}
                      <MessageReactions
                        messageId={message.id}
                        reactions={message.reactions}
                        onReactionToggle={handleReactionToggle}
                      />
                    </div>
                  </div>
                );
              })
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
                {formatSender(replyingTo.profiles).name}
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
            <Button
              type="submit"
              size="icon"
              disabled={loading || !newMessage.trim()}
              className="min-h-[44px] min-w-[44px] h-11 w-11 sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Welcome dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to the chat</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap text-left pt-2 text-foreground/80">
              {welcomeText}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWelcome(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The message and its reactions will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban confirm */}
      <AlertDialog open={!!confirmBan} onOpenChange={(open) => !open && setConfirmBan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban {confirmBan?.name} from chat?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to every community chat channel until unbanned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doBan} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ban user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
