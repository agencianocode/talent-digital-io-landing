import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export interface Invitation {
  id: string;
  company_id: string;
  invited_by_user_id: string;
  talent_user_id: string;
  opportunity_id?: string;
  invitation_type: 'general' | 'opportunity_specific';
  subject: string;
  message: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  expires_at?: string;
  viewed_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Related data
  company?: {
    name: string;
    logo_url?: string;
  };
  opportunity?: {
    title: string;
    id: string;
  };
  invited_by?: {
    full_name: string;
    avatar_url?: string;
  };
  talent?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateInvitationData {
  company_id: string;
  talent_user_id: string;
  opportunity_id?: string;
  invitation_type: 'general' | 'opportunity_specific';
  subject: string;
  message: string;
  expires_at?: string;
}

export const useInvitations = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch invitations sent by a company
  const fetchSentInvitations = useCallback(async (companyId: string): Promise<Invitation[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invitations' as any)
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch related data separately to avoid complex joins
      const invitationsWithData = await Promise.all(
        (data || []).map(async (invitation: any) => {
          const [companyResult, opportunityResult, talentResult] = await Promise.all([
            supabase.from('companies').select('name, logo_url').eq('id', invitation.company_id).single(),
            invitation.opportunity_id ? supabase.from('opportunities').select('title, id').eq('id', invitation.opportunity_id).single() : Promise.resolve({ data: null }),
            supabase.from('profiles').select('full_name, avatar_url').eq('user_id', invitation.talent_user_id).single()
          ]);

          return {
            ...invitation,
            company: companyResult.data,
            opportunity: opportunityResult.data,
            talent: talentResult.data
          };
        })
      );
      
      return invitationsWithData;
    } catch (error) {
      console.error('Error fetching sent invitations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las invitaciones enviadas",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch invitations received by a talent
  const fetchReceivedInvitations = useCallback(async (talentUserId: string): Promise<Invitation[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invitations' as any)
        .select('*')
        .eq('talent_user_id', talentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch related data separately to avoid complex joins
      const invitationsWithData = await Promise.all(
        (data || []).map(async (invitation: any) => {
          const [companyResult, opportunityResult, invitedByResult] = await Promise.all([
            supabase.from('companies').select('name, logo_url').eq('id', invitation.company_id).single(),
            invitation.opportunity_id ? supabase.from('opportunities').select('title, id').eq('id', invitation.opportunity_id).single() : Promise.resolve({ data: null }),
            supabase.from('profiles').select('full_name, avatar_url').eq('user_id', invitation.invited_by_user_id).single()
          ]);

          return {
            ...invitation,
            company: companyResult.data,
            opportunity: opportunityResult.data,
            invited_by: invitedByResult.data
          };
        })
      );
      
      return invitationsWithData;
    } catch (error) {
      console.error('Error fetching received invitations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las invitaciones recibidas",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create a new invitation
  const createInvitation = useCallback(async (invitationData: CreateInvitationData): Promise<Invitation | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para enviar invitaciones",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invitations' as any)
        .insert({
          ...invitationData,
          invited_by_user_id: user.id,
        })
        .select('*')
        .single();

      if (error) throw error;
      
      // Fetch related data separately
      const [companyResult, opportunityResult, talentResult] = await Promise.all([
        supabase.from('companies').select('name, logo_url').eq('id', (data as any).company_id).single(),
        (data as any).opportunity_id ? supabase.from('opportunities').select('title, id').eq('id', (data as any).opportunity_id).single() : Promise.resolve({ data: null }),
        supabase.from('profiles').select('full_name, avatar_url').eq('user_id', (data as any).talent_user_id).single()
      ]);

      const invitationWithData = {
        ...(data as any),
        company: companyResult.data,
        opportunity: opportunityResult.data,
        talent: talentResult.data
      };
      
      toast({
        title: "Éxito",
        description: "Invitación enviada correctamente",
      });
      
      return invitationWithData;
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Update invitation status (view, accept, decline)
  const updateInvitationStatus = useCallback(async (invitationId: string, status: 'viewed' | 'accepted' | 'declined'): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para responder invitaciones",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'viewed') {
        updateData.viewed_at = new Date().toISOString();
      } else if (status === 'accepted' || status === 'declined') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invitations' as any)
        .update(updateData)
        .eq('id', invitationId)
        .eq('talent_user_id', user.id); // Ensure user can only update their own invitations

      if (error) throw error;
      
      const statusMessage = {
        viewed: 'Invitación marcada como vista',
        accepted: 'Invitación aceptada',
        declined: 'Invitación rechazada'
      };

      toast({
        title: "Éxito",
        description: statusMessage[status],
      });
      
      return true;
    } catch (error) {
      console.error('Error updating invitation status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la invitación",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Delete an invitation (only by the sender)
  const deleteInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar invitaciones",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('invitations' as any)
        .delete()
        .eq('id', invitationId)
        .eq('invited_by_user_id', user.id); // Ensure user can only delete their own invitations

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Invitación eliminada correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la invitación",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Get invitation statistics
  const getInvitationStats = useCallback(async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('invitations' as any)
        .select('status')
        .eq('company_id', companyId);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          total: 0,
          sent: 0,
          viewed: 0,
          accepted: 0,
          declined: 0,
          expired: 0
        };
      }

      const stats = (data as any[]).reduce((acc, invitation) => {
        acc.total++;
        acc[invitation.status as keyof typeof acc]++;
        return acc;
      }, {
        total: 0,
        sent: 0,
        viewed: 0,
        accepted: 0,
        declined: 0,
        expired: 0
      });

      return stats;
    } catch (error) {
      console.error('Error getting invitation stats:', error);
      return {
        total: 0,
        sent: 0,
        viewed: 0,
        accepted: 0,
        declined: 0,
        expired: 0
      };
    }
  }, []);

  // Check if user has already been invited to an opportunity
  const hasUserBeenInvited = useCallback(async (talentUserId: string, opportunityId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('invitations' as any)
        .select('id')
        .eq('talent_user_id', talentUserId)
        .eq('opportunity_id', opportunityId)
        .in('status', ['sent', 'viewed'])
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking if user has been invited:', error);
      return false;
    }
  }, []);

  return {
    isLoading,
    fetchSentInvitations,
    fetchReceivedInvitations,
    createInvitation,
    updateInvitationStatus,
    deleteInvitation,
    getInvitationStats,
    hasUserBeenInvited,
  };
};
