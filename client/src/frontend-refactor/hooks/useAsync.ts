import { useState, useCallback, useRef } from 'react';

export function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref-based lock mechanism to immediately trap concurrent execution attempts
  const isSubmittingRef = useRef<boolean>(false);

  const execute = useCallback(
    async (...args: Args) => {
      // Hard Lock: Prevent double-click race conditions instantly
      if (isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response);
        return response;
      } catch (err: any) {
        // Standardized, user-friendly error parsing instead of raw console traces
        const errorMessage = err instanceof Error 
            ? err.message 
            : 'We encountered a network issue. Please check your connection and try again.';
        
        setError(errorMessage);
        setData(null);
      } finally {
        // Always release the lock
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  return {
    data,
    isLoading,
    error,
    execute,
    reset: () => {
        setData(null);
        setError(null);
    }
  };
}
