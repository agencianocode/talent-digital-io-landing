import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyUserRole {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'viewer';
  invited_by?: string;
  invited_email?: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  // Enriched fields for display
  user_name?: string;
  user_avatar?: string | null;
  user_email?: string;
}

export interface InviteUserData {
  email: string;
  role: 'admin' | 'viewer';
  company_id: string;
}

export const useCompanyUserRoles = (companyId?: string) => {
  const { user } = useSupabaseAuth();
  const [userRoles, setUserRoles] = useState<CompanyUserRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<CompanyUserRole | null>(null);

  // Load user roles for a company
  const loadUserRoles = useCallback(async () => {
    if (!companyId || !user) return;

    setIsLoading(true);
    try {
      // Fetch all user roles for the company (without join to avoid relationship issues)
      const { data: roles, error } = await (supabase as any)
        .from('company_user_roles')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      // Get unique user IDs to fetch profiles separately
      const userIds = (roles || [])
        .map((role: any) => role.user_id)
        .filter((id: string) => id && !id.startsWith('pending-') && id.length === 36);

      // Fetch profiles for real users
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        
        if (profilesError) {
          console.warn('Error fetching profiles:', profilesError);
        } else {
          profiles = profilesData || [];
        }
      }

      // Enrich roles with user data
      const enrichedRoles = (roles || []).map((role: any) => {
        const userProfile = profiles.find(p => p.user_id === role.user_id);
        return {
          ...role,
          user_name: userProfile?.full_name || role.invited_email?.split('@')[0] || 'Usuario',
          user_avatar: userProfile?.avatar_url || null,
          user_email: role.invited_email || 'Sin email'
        };
      });

      setUserRoles(enrichedRoles);

      // Find current user's role
      const currentRole = enrichedRoles?.find((role: any) => role.user_id === user.id);
      setCurrentUserRole(currentRole || null);
    } catch (error) {
      console.error('Error loading user roles:', error);
      toast.error('Error al cargar roles de usuario');
      setUserRoles([]);
      setCurrentUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, user]);

  // Invite a new user to the company
  const inviteUser = useCallback(async (inviteData: InviteUserData) => {
    if (!user) return;

    try {
      // Create invitation record with null user_id - will be linked when user accepts
      const { data, error } = await (supabase as any)
        .from('company_user_roles')
        .insert({
          company_id: inviteData.company_id,
          user_id: null, // Will be linked when user accepts invitation
          invited_email: inviteData.email,
          role: inviteData.role,
          invited_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Invitation created successfully:', data);

      // Send invitation email via edge function
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invitation', {
          body: {
            email: inviteData.email,
            role: inviteData.role,
            company_id: inviteData.company_id,
            invited_by: user.email || 'Un administrador',
            invitation_id: data.id
          }
        });

        if (emailError) {
          console.error('Error sending invitation email:', emailError);
          toast.warning(`Invitación creada pero el email no pudo enviarse. Link: ${window.location.origin}/accept-invitation?id=${data.id}`);
        } else {
          console.log('Invitation email sent successfully:', emailData);
          toast.success(`Invitación enviada a ${inviteData.email}`);
        }
      } catch (emailError) {
        console.error('Exception sending invitation email:', emailError);
        toast.warning(`Invitación creada pero el email no pudo enviarse. Link: ${window.location.origin}/accept-invitation?id=${data.id}`);
      }

      // Reload user roles
      await loadUserRoles();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error(`Error al enviar invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [user, loadUserRoles]);

  // Update user role
  const updateUserRole = useCallback(async (roleId: string, newRole: 'owner' | 'admin' | 'viewer') => {
    try {
      const { error } = await (supabase as any)
        .from('company_user_roles')
        .update({ role: newRole })
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Rol actualizado correctamente');
      await loadUserRoles();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol');
    }
  }, [loadUserRoles]);

  // Remove user from company
  const removeUser = useCallback(async (roleId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('company_user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Usuario removido de la empresa');
      await loadUserRoles();
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Error al remover usuario');
    }
  }, [loadUserRoles]);

  // Transfer ownership
  const transferOwnership = useCallback(async (newOwnerRoleId: string) => {
    if (!user) return;

    try {
      // Start transaction: demote current owner to admin, promote new user to owner
      const { error: demoteError } = await (supabase as any)
        .from('company_user_roles')
        .update({ role: 'admin' })
        .eq('user_id', user.id)
        .eq('role', 'owner');

      if (demoteError) throw demoteError;

      const { error: promoteError } = await (supabase as any)
        .from('company_user_roles')
        .update({ role: 'owner' })
        .eq('id', newOwnerRoleId);

      if (promoteError) throw promoteError;

      toast.success('Propiedad transferida correctamente');
      await loadUserRoles();
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error('Error al transferir propiedad');
    }
  }, [user, loadUserRoles]);

  // Accept invitation
  const acceptInvitation = useCallback(async (roleId: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('company_user_roles')
        .update({ 
          status: 'accepted',
          user_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Invitación aceptada');
      await loadUserRoles();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Error al aceptar invitación');
    }
  }, [user, loadUserRoles]);

  // Decline invitation
  const declineInvitation = useCallback(async (roleId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('company_user_roles')
        .update({ status: 'declined' })
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Invitación rechazada');
      await loadUserRoles();
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Error al rechazar invitación');
    }
  }, [loadUserRoles]);

  // Check if current user has permission
  const hasPermission = useCallback((requiredRole: 'owner' | 'admin' | 'viewer') => {
    if (!currentUserRole) return false;

    const roleHierarchy = { owner: 3, admin: 2, viewer: 1 };
    return roleHierarchy[currentUserRole.role] >= roleHierarchy[requiredRole];
  }, [currentUserRole]);

  // Load roles on mount and when companyId changes
  useEffect(() => {
    loadUserRoles();
  }, [loadUserRoles]);

  return {
    userRoles,
    currentUserRole,
    isLoading,
    inviteUser,
    updateUserRole,
    removeUser,
    transferOwnership,
    acceptInvitation,
    declineInvitation,
    hasPermission,
    loadUserRoles
  };
}; 