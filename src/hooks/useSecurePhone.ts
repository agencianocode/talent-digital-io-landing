import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to securely fetch a talent's phone number
 * Phone is only returned if the current user has meaningful interaction with the talent
 * (applications, messages, or premium subscription)
 */
export const useSecurePhone = (talentUserId: string | null) => {
  const [phone, setPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!talentUserId) {
      setPhone(null);
      return;
    }

    const fetchSecurePhone = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase
          .rpc('get_talent_phone_if_authorized' as any, {
            talent_user_uuid: talentUserId
          });

        if (rpcError) throw rpcError;
        
        setPhone((data as string) || null);
      } catch (err) {
        console.error('Error fetching secure phone:', err);
        setError(err as Error);
        setPhone(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurePhone();
  }, [talentUserId]);

  return { phone, isLoading, error };
};
