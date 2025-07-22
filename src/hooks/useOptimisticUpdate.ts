
import { useState, useCallback } from 'react';
import { useToastContext } from '@/contexts/ToastContext';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useOptimisticUpdate = <T>(
  initialData: T[],
  options: OptimisticUpdateOptions<T> = {}
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();

  const optimisticAdd = useCallback(async (
    newItem: T,
    asyncOperation: () => Promise<T>
  ) => {
    // Optimistically add item
    setData(prev => [newItem, ...prev]);
    setIsLoading(true);

    try {
      const result = await asyncOperation();
      // Replace optimistic item with real result
      setData(prev => prev.map(item => item === newItem ? result : item));
      
      if (options.successMessage) {
        showToast({
          type: 'success',
          title: options.successMessage
        });
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      // Remove optimistic item on error
      setData(prev => prev.filter(item => item !== newItem));
      
      const errorMessage = options.errorMessage || 'Operación fallida';
      showToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, showToast]);

  const optimisticUpdate = useCallback(async (
    itemId: string | number,
    updates: Partial<T>,
    asyncOperation: () => Promise<T>
  ) => {
    // Store original state for rollback
    const originalData = [...data];
    
    // Optimistically update item
    setData(prev => prev.map(item => 
      (item as any).id === itemId ? { ...item, ...updates } : item
    ));
    setIsLoading(true);

    try {
      const result = await asyncOperation();
      // Update with real result
      setData(prev => prev.map(item => 
        (item as any).id === itemId ? result : item
      ));
      
      if (options.successMessage) {
        showToast({
          type: 'success',
          title: options.successMessage
        });
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      // Rollback on error
      setData(originalData);
      
      const errorMessage = options.errorMessage || 'Operación fallida';
      showToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [data, options, showToast]);

  const optimisticRemove = useCallback(async (
    itemId: string | number,
    asyncOperation: () => Promise<void>
  ) => {
    // Store item for potential rollback
    const itemToRemove = data.find(item => (item as any).id === itemId);
    if (!itemToRemove) return;
    
    // Optimistically remove item
    setData(prev => prev.filter(item => (item as any).id !== itemId));
    setIsLoading(true);

    try {
      await asyncOperation();
      
      if (options.successMessage) {
        showToast({
          type: 'success',
          title: options.successMessage
        });
      }
    } catch (error) {
      // Restore item on error
      setData(prev => [itemToRemove, ...prev]);
      
      const errorMessage = options.errorMessage || 'Operación fallida';
      showToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [data, options, showToast]);

  return {
    data,
    isLoading,
    optimisticAdd,
    optimisticUpdate,
    optimisticRemove,
    setData
  };
};
