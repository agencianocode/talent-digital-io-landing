import { useEffect, useCallback, useRef, useState } from 'react';

interface UseDraftProtectionOptions<T> {
  /** Unique key for localStorage */
  storageKey: string;
  /** Current form data to protect */
  data: T;
  /** Callback when draft is restored */
  onRestore?: (data: T) => void;
  /** Maximum age in hours before draft expires (default: 24) */
  maxAgeHours?: number;
  /** Whether to show restore prompt automatically on mount */
  autoPromptRestore?: boolean;
}

interface StoredDraft<T> {
  data: T;
  timestamp: number;
}

/**
 * Hook to protect form data from being lost when switching windows/tabs.
 * Automatically saves drafts on visibility change and beforeunload events.
 * 
 * @example
 * ```tsx
 * const { hasStoredDraft, restoreDraft, clearDraft } = useDraftProtection({
 *   storageKey: 'invitation-manager-draft',
 *   data: { emailList, message },
 *   onRestore: (data) => {
 *     setEmailList(data.emailList);
 *     setMessage(data.message);
 *   }
 * });
 * ```
 */
export function useDraftProtection<T>({
  storageKey,
  data,
  onRestore,
  maxAgeHours = 24,
  autoPromptRestore = false,
}: UseDraftProtectionOptions<T>) {
  const dataRef = useRef(data);
  const [hasStoredDraft, setHasStoredDraft] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);

  // Keep ref updated with latest data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Check if there's a valid draft
  const checkForDraft = useCallback((): StoredDraft<T> | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const draft: StoredDraft<T> = JSON.parse(stored);
      const ageInHours = (Date.now() - draft.timestamp) / (1000 * 60 * 60);

      if (ageInHours > maxAgeHours) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return draft;
    } catch {
      return null;
    }
  }, [storageKey, maxAgeHours]);

  // Save current data to localStorage
  const saveDraft = useCallback(() => {
    try {
      const draft: StoredDraft<T> = {
        data: dataRef.current,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      console.log('[useDraftProtection] Draft saved:', storageKey);
    } catch (error) {
      console.error('[useDraftProtection] Error saving draft:', error);
    }
  }, [storageKey]);

  // Clear stored draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasStoredDraft(false);
      console.log('[useDraftProtection] Draft cleared:', storageKey);
    } catch (error) {
      console.error('[useDraftProtection] Error clearing draft:', error);
    }
  }, [storageKey]);

  // Restore draft data
  const restoreDraft = useCallback((): T | null => {
    const draft = checkForDraft();
    if (draft) {
      onRestore?.(draft.data);
      clearDraft();
      return draft.data;
    }
    return null;
  }, [checkForDraft, onRestore, clearDraft]);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = checkForDraft();
    setHasStoredDraft(!!draft);
    setDraftChecked(true);

    if (draft && autoPromptRestore && onRestore) {
      // Auto-restore if enabled
      onRestore(draft.data);
      clearDraft();
    }
  }, [checkForDraft, autoPromptRestore, onRestore, clearDraft]);

  // Save draft on visibility change (window switch) and beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveDraft();
      }
    };

    const handleBeforeUnload = () => {
      saveDraft();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraft]);

  return {
    /** Whether there's a stored draft available */
    hasStoredDraft,
    /** Whether the initial draft check has completed */
    draftChecked,
    /** Restore the stored draft and call onRestore callback */
    restoreDraft,
    /** Clear the stored draft */
    clearDraft,
    /** Manually save current data as draft */
    saveDraft,
  };
}

export default useDraftProtection;
