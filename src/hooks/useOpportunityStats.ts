import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface OpportunityStats {
  unviewedApplications: Record<string, number>; // Por opportunity_id
  unreadMessages: Record<string, number>; // Por conversation_id relacionado a opportunity
}

export const useOpportunityStats = (opportunityIds: string[]) => {
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState<OpportunityStats>({
    unviewedApplications: {},
    unreadMessages: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || opportunityIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // 1. Obtener postulaciones sin revisar por oportunidad
        const { data: applications, error: appsError } = await supabase
          .from('applications' as any)
          .select('opportunity_id, is_viewed')
          .in('opportunity_id', opportunityIds)
          .eq('is_viewed', false);

        if (appsError) {
          console.error('Error fetching unviewed applications:', appsError);
        }

        const unviewedByOpportunity: Record<string, number> = {};
        (applications || []).forEach((app: any) => {
          unviewedByOpportunity[app.opportunity_id] = 
            (unviewedByOpportunity[app.opportunity_id] || 0) + 1;
        });

        // 2. Obtener mensajes sin leer relacionados a estas oportunidades
        // Los mensajes relacionados a oportunidades tienen conversation_id con formato:
        // conv_{userId}_{otherUserId}_app_{opportunityId}
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('conversation_id, is_read')
          .eq('recipient_id', user.id)
          .eq('is_read', false);

        if (messagesError) {
          console.error('Error fetching unread messages:', messagesError);
        }

        const unreadByOpportunity: Record<string, number> = {};
        (messages || []).forEach(msg => {
          // Extraer opportunity_id del conversation_id si existe
          const match = msg.conversation_id.match(/_app_([^_]+)/);
          if (match && match[1]) {
            const oppId = match[1];
            if (opportunityIds.includes(oppId)) {
              unreadByOpportunity[oppId] = (unreadByOpportunity[oppId] || 0) + 1;
            }
          }
        });

        setStats({
          unviewedApplications: unviewedByOpportunity,
          unreadMessages: unreadByOpportunity
        });
      } catch (error) {
        console.error('Error fetching opportunity stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Suscribirse a cambios en tiempo real
    const applicationsChannel = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `opportunity_id=in.(${opportunityIds.join(',')})`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      applicationsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [user, opportunityIds.join(',')]);

  return {
    ...stats,
    isLoading
  };
};
