import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProgress {
  phase: string;
  task_id: string;
  completed: boolean;
  completed_at?: string;
}

export const useUserProgress = (phase: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setProgress({});
      setLoading(false);
    }
  }, [user, phase]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('task_id, completed')
        .eq('user_id', user.id)
        .eq('phase', phase);

      if (error) throw error;

      const progressMap: Record<string, boolean> = {};
      data?.forEach((item) => {
        progressMap[item.task_id] = item.completed;
      });

      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgress = async (taskId: string) => {
    if (!user) {
      toast.error('Please sign in to save your progress');
      return;
    }

    const currentStatus = progress[taskId] || false;
    const newStatus = !currentStatus;

    // Optimistic update
    setProgress((prev) => ({ ...prev, [taskId]: newStatus }));

    try {
      const { error } = await supabase.from('user_progress').upsert(
        {
          user_id: user.id,
          phase,
          task_id: taskId,
          completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null,
        },
        {
          onConflict: 'user_id,phase,task_id',
        }
      );

      if (error) throw error;

      toast.success(newStatus ? 'Task marked as complete' : 'Task marked as incomplete');
    } catch (error) {
      // Revert on error
      setProgress((prev) => ({ ...prev, [taskId]: currentStatus }));
      toast.error('Failed to update progress');
      console.error('Error updating progress:', error);
    }
  };

  const getCompletionPercentage = (totalTasks: number) => {
    const completedCount = Object.values(progress).filter(Boolean).length;
    return totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  };

  return {
    progress,
    loading,
    toggleProgress,
    getCompletionPercentage,
    isCompleted: (taskId: string) => progress[taskId] || false,
  };
};
