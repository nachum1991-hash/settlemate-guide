import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Submission {
  id: string;
  user_id: string;
  file_path: string | null;
  created_at: string;
  status: string;
  profile?: { full_name: string | null; university_email: string | null };
}

export const VerificationQueue = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data: subs } = await supabase
      .from('verification_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    const list = (subs ?? []) as Submission[];
    if (list.length > 0) {
      const userIds = list.map(s => s.user_id);
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, university_email')
        .in('id', userIds);
      const map = new Map((profs ?? []).map(p => [p.id, p]));
      list.forEach(s => {
        const p = map.get(s.user_id);
        s.profile = { full_name: p?.full_name ?? null, university_email: p?.university_email ?? null };
      });
    }
    setItems(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const viewLetter = async (s: Submission) => {
    if (!s.file_path) return;
    const { data, error } = await supabase.storage.from('user-documents').createSignedUrl(s.file_path, 60);
    if (error || !data?.signedUrl) {
      toast({ title: 'Could not open file', description: error?.message || 'Try again.', variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const decide = async (s: Submission, decision: 'approve' | 'reject') => {
    setActingId(s.id);
    const { data, error } = await supabase.functions.invoke('verify-admin-decide', {
      body: { submission_id: s.id, decision, reject_reason: rejectReason[s.id] },
    });
    setActingId(null);
    if (error || data?.error) {
      toast({ title: 'Failed', description: data?.error || 'Could not apply decision.', variant: 'destructive' });
      return;
    }
    toast({ title: decision === 'approve' ? 'Approved' : 'Rejected', description: 'File deleted from storage.' });
    await load();
  };

  if (loading) {
    return (
      <Card className="w-full border-2 shadow-elevated p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="w-full border-2 shadow-elevated p-6">
        <h2 className="text-lg font-semibold mb-1">No pending reviews</h2>
        <p className="text-sm text-muted-foreground">All caught up.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((s) => (
        <Card key={s.id} className="w-full border-2 shadow-elevated p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold break-words">{s.profile?.full_name || 'Unnamed student'}</span>
                <Badge variant="secondary">pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground break-words">{s.profile?.university_email || '(no university email on file)'}</p>
              <p className="text-xs text-muted-foreground mt-1">Submitted {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}</p>
            </div>
            <Button variant="outline" onClick={() => viewLetter(s)} className="min-h-[44px]">
              <ExternalLink className="h-4 w-4 mr-2" /> View letter
            </Button>
          </div>

          <Textarea
            placeholder="(Optional) reason if rejecting"
            value={rejectReason[s.id] ?? ''}
            onChange={(e) => setRejectReason(r => ({ ...r, [s.id]: e.target.value }))}
            className="text-sm"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => decide(s, 'approve')}
              disabled={actingId === s.id}
              className="min-h-[44px] flex-1"
            >
              {actingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" /> Approve</>}
            </Button>
            <Button
              variant="destructive"
              onClick={() => decide(s, 'reject')}
              disabled={actingId === s.id}
              className="min-h-[44px] flex-1"
            >
              <X className="h-4 w-4 mr-2" /> Reject
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
