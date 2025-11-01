import { useEffect, useRef } from 'react';

/**
 * Hook to track if a component is still mounted
 * Prevents state updates on unmounted components (React Error #300)
 * 
 * Usage:
 * const isMounted = useIsMounted();
 * 
 * const loadData = async () => {
 *   const data = await fetchData();
 *   if (isMounted.current) {
 *     setData(data);
 *   }
 * };
 */
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};

