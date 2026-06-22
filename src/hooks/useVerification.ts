import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export interface VerificationState {
  verified: boolean;
  method: 'email_domain' | 'acceptance_letter' | null;
  universityEmail: string | null;
  emailVerifiedAt: string | null;
  pendingSubmission: boolean;
  rejectedReason: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useVerification = (): VerificationState => {
  const { user, supabase } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const [pending, setPending] = useState(false);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('verification_submissions')
      .select('status, reject_reason')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setPending(data?.status === 'pending');
    setRejectedReason(data?.status === 'rejected' ? (data.reject_reason ?? null) : null);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { load(); }, [load]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchProfile(), load()]);
  }, [refetchProfile, load]);

  return {
    verified: !!profile?.verified,
    method: profile?.verification_method ?? null,
    universityEmail: profile?.university_email ?? null,
    emailVerifiedAt: profile?.university_email_verified_at ?? null,
    pendingSubmission: pending,
    rejectedReason,
    loading: profileLoading || loading,
    refetch,
  };
};
