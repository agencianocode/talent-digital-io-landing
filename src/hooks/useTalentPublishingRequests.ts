import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TalentPublishingRequest {
  id: string;
  created_at: string;
  updated_at: string;
  requester_id: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_name: string;
  service_type: string;
  budget: string | null;
  timeline: string | null;
  description: string;
  requirements: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
}

export const useTalentPublishingRequests = () => {
  const [requests, setRequests] = useState<TalentPublishingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('marketplace_publishing_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []) as TalentPublishingRequest[];
      setRequests(typedData);
      setPendingCount(typedData.filter(r => r.status === 'pending').length);
    } catch (error: any) {
      console.error('Error loading my publishing requests:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus solicitudes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_publishing_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Solicitud cancelada',
        description: 'Tu solicitud ha sido cancelada exitosamente',
      });

      loadMyRequests();
    } catch (error: any) {
      console.error('Error canceling request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la solicitud',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadMyRequests();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('my_publishing_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_publishing_requests',
        },
        () => {
          loadMyRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    requests,
    loading,
    pendingCount,
    loadMyRequests,
    cancelRequest,
  };
};
