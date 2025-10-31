import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PublishingRequest {
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

export const usePublishingRequests = () => {
  const [requests, setRequests] = useState<PublishingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_publishing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      setPendingCount(data?.filter(r => r.status === 'pending').length || 0);
    } catch (error: any) {
      console.error('Error loading publishing requests:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('marketplace_publishing_requests')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: `Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`,
      });

      loadRequests();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la solicitud',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadRequests();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('publishing_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_publishing_requests',
        },
        () => {
          loadRequests();
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
    loadRequests,
    updateRequestStatus,
  };
};
