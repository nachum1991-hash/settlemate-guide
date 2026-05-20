import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  origin_country: string | null;
  university: string | null;
  arrival_date: string | null;
  onboarding_completed: boolean;
}

export const useProfile = () => {
  const { user, supabase } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (!error) setProfile(data as Profile | null);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return { error: new Error('Not authenticated') };
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (!error) await fetchProfile();
      return { error };
    },
    [user, supabase, fetchProfile]
  );

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
