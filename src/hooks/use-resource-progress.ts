import { useState, useEffect, useCallback } from 'react';
import { WeeklyProgress } from '@/types/weekly-resources';
import {
  getUserProgress,
  updateResourceCompletion,
  markWeekCompleted,
} from '@/lib/user-progress-service';
import { useAuth } from '@/hooks/use-auth';

interface UseResourceProgressResult {
  progress: WeeklyProgress | null;
  isLoading: boolean;
  error: string | null;
  toggleCompletion: (resourceId: string, completed: boolean) => Promise<void>;
  markWeekComplete: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage user's progress for a specific weekly resource
 * @param domain - The domain
 * @param weekNumber - The week number
 * @returns Progress data and mutation functions
 */
export function useResourceProgress(
  domain: string,
  weekNumber: number
): UseResourceProgressResult {
  const { user } = useAuth();
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user?.uid) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Progress fetch timed out - continuing without progress data');
      setProgress(null);
      setIsLoading(false);
    }, 5000); // 5 second timeout

    try {
      const data = await getUserProgress(user.uid, domain, weekNumber);
      clearTimeout(timeoutId);
      setProgress(data);
    } catch (err) {
      clearTimeout(timeoutId);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load progress';
      setError(errorMessage);
      console.error('Progress fetch error:', err);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [user?.uid, domain, weekNumber]);

  useEffect(() => {
    if (user?.uid && domain && weekNumber) {
      fetchProgress();
    }
  }, [fetchProgress, user?.uid, domain, weekNumber]);

  const toggleCompletion = useCallback(
    async (resourceId: string, completed: boolean) => {
      if (!user?.uid) {
        throw new Error('User must be logged in to update progress');
      }

      try {
        // Optimistic update
        setProgress((prev) => {
          if (!prev) return prev;
          const completedResources = completed
            ? [...prev.completedResources, resourceId]
            : prev.completedResources.filter((id) => id !== resourceId);

          return {
            ...prev,
            completedResources,
          };
        });

        // Update Firestore
        const updatedProgress = await updateResourceCompletion(
          user.uid,
          domain,
          weekNumber,
          resourceId,
          completed
        );
        setProgress(updatedProgress);
      } catch (err) {
        // Revert optimistic update on error
        await fetchProgress();
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update resource completion';
        setError(errorMessage);
        throw err;
      }
    },
    [user?.uid, domain, weekNumber, fetchProgress]
  );

  const markWeekComplete = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('User must be logged in to mark week complete');
    }

    try {
      const updatedProgress = await markWeekCompleted(
        user.uid,
        domain,
        weekNumber
      );
      setProgress(updatedProgress);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to mark week as complete';
      setError(errorMessage);
      throw err;
    }
  }, [user?.uid, domain, weekNumber]);

  return {
    progress,
    isLoading,
    error,
    toggleCompletion,
    markWeekComplete,
    refetch: fetchProgress,
  };
}
