import { useState, useEffect } from 'react';
import { WeeklyResource } from '@/types/weekly-resources';
import { loadWeeklyResource } from '@/lib/weekly-resources-service';

interface UseWeeklyResourceResult {
  resource: WeeklyResource | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to load and manage a weekly resource
 * @param domain - The domain to load resource for
 * @param weekNumber - The week number to load
 * @returns Resource data, loading state, error state, and refetch function
 */
export function useWeeklyResource(
  domain: string,
  weekNumber: number
): UseWeeklyResourceResult {
  const [resource, setResource] = useState<WeeklyResource | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResource = async () => {
    console.log('[useWeeklyResource] Fetching resource:', { domain, weekNumber });
    setLoading(true);
    setError(null);

    try {
      const data = await loadWeeklyResource(domain, weekNumber);
      console.log('[useWeeklyResource] Resource loaded successfully');
      setResource(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load resource';
      console.error('[useWeeklyResource] Error loading resource:', err);
      setError(errorMessage);
      setResource(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[useWeeklyResource] Effect triggered:', { domain, weekNumber, isValid: !!(domain && weekNumber) });
    if (domain && weekNumber) {
      fetchResource();
    }
  }, [domain, weekNumber]);

  return {
    resource,
    loading,
    error,
    refetch: fetchResource,
  };
}
