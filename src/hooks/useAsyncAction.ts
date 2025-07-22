
import { useState, useCallback } from 'react';
import { useToastContext } from '@/contexts/ToastContext';

interface UseAsyncActionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAsyncAction(options: UseAsyncActionOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToastContext();

  const execute = useCallback(async (asyncFn: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      
      if (options.successMessage) {
        showToast({
          type: 'success',
          title: options.successMessage
        });
      }
      
      options.onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      const errorMessage = options.errorMessage || error.message;
      showToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, showToast]);

  const retry = useCallback(async (asyncFn: () => Promise<any>) => {
    setError(null);
    return execute(asyncFn);
  }, [execute]);

  return {
    execute,
    retry,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}
