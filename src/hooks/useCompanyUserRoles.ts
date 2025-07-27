import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

export interface CompanyUserRole {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'viewer';
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
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
      // For now, return empty array until table is created
      console.log('Table not created yet, using empty array');
      setUserRoles([]);
      
      // Temporary: Set current user as owner for testing
      const tempRole: CompanyUserRole = {
        id: 'temp-role',
        company_id: companyId,
        user_id: user.id,
        role: 'owner',
        status: 'accepted',
        invited_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCurrentUserRole(tempRole);
    } catch (error) {
      console.error('Error loading user roles:', error);
      setUserRoles([]);
      setCurrentUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, user]);

  // Invite a new user to the company
  const inviteUser = useCallback(async (inviteData: InviteUserData) => {
    toast.info(`Invitación a ${inviteData.email} como ${inviteData.role} - Ejecuta el SQL primero para activar`);
  }, []);

  // Update user role
  const updateUserRole = useCallback(async (roleId: string, newRole: 'owner' | 'admin' | 'viewer') => {
    toast.info('Funcionalidad de actualización próximamente - Ejecuta el SQL primero');
  }, []);

  // Remove user from company
  const removeUser = useCallback(async (roleId: string) => {
    toast.info('Funcionalidad de remoción próximamente - Ejecuta el SQL primero');
  }, []);

  // Transfer ownership
  const transferOwnership = useCallback(async (newOwnerRoleId: string) => {
    toast.info('Funcionalidad de transferencia próximamente - Ejecuta el SQL primero');
  }, []);

  // Accept invitation
  const acceptInvitation = useCallback(async (roleId: string) => {
    toast.info('Funcionalidad de aceptación próximamente - Ejecuta el SQL primero');
  }, []);

  // Decline invitation
  const declineInvitation = useCallback(async (roleId: string) => {
    toast.info('Funcionalidad de rechazo próximamente - Ejecuta el SQL primero');
  }, []);

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