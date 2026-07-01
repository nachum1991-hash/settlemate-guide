import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { UserX, Pin, Save, Loader2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { universities } from '@/data/onboardingOptions';

interface BanRow {
  user_id: string;
  banned_by: string | null;
  reason: string | null;
  created_at: string;
  bannedName: string;
  bannedUni: string | null;
  bannedByName: string | null;
}

const uniLabel = (slug: string | null | undefined) =>
  slug && slug !== 'other' ? universities.find((u) => u.value === slug)?.label ?? null : null;

export const ChatModerationPanel = () => {
  const { toast } = useToast();
  const [bans, setBans] = useState<BanRow[]>([]);
  const [loadingBans, setLoadingBans] = useState(true);
  const [confirmUnban, setConfirmUnban] = useState<BanRow | null>(null);

  // Channel settings
  const [taskId, setTaskId] = useState('');
  const [phase, setPhase] = useState('');
  const [welcome, setWelcome] = useState('');
  const [pinned, setPinned] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const resolveName = async (userId: string) => {
    const { data } = await supabase.rpc('get_profile_display_info', {
      profile_user_id: userId,
    });
    const row = (data as Array<{ full_name: string | null; university: string | null }> | null)?.[0];
    return {
      name: row?.full_name?.trim() || 'Unknown user',
      uni: row?.university ?? null,
    };
  };

  const loadBans = async () => {
    setLoadingBans(true);
    const { data, error } = await supabase
      .from('chat_bans')
      .select('user_id, banned_by, reason, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoadingBans(false);
      return;
    }
    const rows = (data as any[]) || [];
    const hydrated: BanRow[] = await Promise.all(
      rows.map(async (r) => {
        const banned = await resolveName(r.user_id);
        const by = r.banned_by ? await resolveName(r.banned_by) : null;
        return {
          user_id: r.user_id,
          banned_by: r.banned_by,
          reason: r.reason,
          created_at: r.created_at,
          bannedName: banned.name,
          bannedUni: banned.uni,
          bannedByName: by?.name ?? null,
        };
      }),
    );
    setBans(hydrated);
    setLoadingBans(false);
  };

  useEffect(() => {
    loadBans();
  }, []);

  const doUnban = async () => {
    if (!confirmUnban) return;
    const { data, error } = await supabase.functions.invoke('admin-unban-user', {
      body: { target_user_id: confirmUnban.user_id },
    });
    setConfirmUnban(null);
    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || 'Failed to unban', variant: 'destructive' });
      return;
    }
    toast({ title: 'User unbanned' });
    loadBans();
  };

  const loadSettings = async () => {
    if (!taskId.trim() || !phase.trim()) {
      toast({ title: 'Missing fields', description: 'Enter both task_id and phase.', variant: 'destructive' });
      return;
    }
    setLoadingSettings(true);
    const { data, error } = await supabase
      .from('chat_settings')
      .select('welcome_message, pinned_message')
      .eq('task_id', taskId.trim())
      .eq('phase', phase.trim())
      .maybeSingle();
    setLoadingSettings(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    const row = data as { welcome_message: string | null; pinned_message: string | null } | null;
    setWelcome(row?.welcome_message ?? '');
    setPinned(row?.pinned_message ?? '');
    toast({ title: row ? 'Settings loaded' : 'No settings yet', description: 'Edit and save to publish.' });
  };

  const saveSettings = async () => {
    if (!taskId.trim() || !phase.trim()) {
      toast({ title: 'Missing fields', description: 'Enter both task_id and phase.', variant: 'destructive' });
      return;
    }
    setSavingSettings(true);
    const { data, error } = await supabase.functions.invoke('upsert-chat-settings', {
      body: {
        task_id: taskId.trim(),
        phase: phase.trim(),
        welcome_message: welcome.trim() || null,
        pinned_message: pinned.trim() || null,
      },
    });
    setSavingSettings(false);
    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || 'Failed to save', variant: 'destructive' });
      return;
    }
    toast({ title: 'Saved', description: 'Channel settings updated.' });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full border-2 shadow-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-destructive/10 p-2">
            <UserX className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Chat bans</h2>
            <p className="text-sm text-muted-foreground">Users blocked from every community chat channel.</p>
          </div>
        </div>
        {loadingBans ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading bans…
          </div>
        ) : bans.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No active bans.</p>
        ) : (
          <div className="space-y-3">
            {bans.map((b) => (
              <div
                key={b.user_id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium">{b.bannedName}</span>
                    {uniLabel(b.bannedUni) && (
                      <span className="text-xs text-muted-foreground">· {uniLabel(b.bannedUni)}</span>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 break-all">ID: {b.user_id}</p>
                  <p className="text-sm mt-1">
                    <span className="text-muted-foreground">Reason:</span> {b.reason || '—'}
                  </p>
                  {b.bannedByName && (
                    <p className="text-xs text-muted-foreground">Banned by {b.bannedByName}</p>
                  )}
                </div>
                <Button variant="outline" onClick={() => setConfirmUnban(b)} className="min-h-[44px]">
                  Unban
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="w-full border-2 shadow-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <Pin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Channel settings</h2>
            <p className="text-sm text-muted-foreground">
              Welcome shows once, the first time a user opens this channel. Pinned shows as a banner above the messages.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taskId">Task ID</Label>
              <Input
                id="taskId"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="e.g. visa-israel"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phase">Phase</Label>
              <Input
                id="phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="e.g. phase-1"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSettings} disabled={loadingSettings} className="min-h-[44px]">
              {loadingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load'}
            </Button>
          </div>

          <div>
            <Label htmlFor="welcome">Welcome message</Label>
            <Textarea
              id="welcome"
              value={welcome}
              onChange={(e) => setWelcome(e.target.value)}
              placeholder="Shown once when a new member opens the chat."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="pinned">Pinned message</Label>
            <Textarea
              id="pinned"
              value={pinned}
              onChange={(e) => setPinned(e.target.value)}
              placeholder="Stays as a banner above the message list."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Button onClick={saveSettings} disabled={savingSettings} className="min-h-[44px]">
              {savingSettings ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save settings</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!confirmUnban} onOpenChange={(open) => !open && setConfirmUnban(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban {confirmUnban?.bannedName}?</AlertDialogTitle>
            <AlertDialogDescription>
              They'll regain access to community chat channels immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doUnban}>Unban</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
