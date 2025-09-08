import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

export interface UpgradeRequest {
  id: string;
  user_id: string;
  user_current_role: string;
  requested_role: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUpgradeRequestData {
  requested_role: 'premium_talent' | 'premium_business' | 'premium_academy';
  reason?: string;
}

export const useUpgradeRequests = () => {
  const { user, userRole } = useSupabaseAuth();
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [userRequest, setUserRequest] = useState<UpgradeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's own upgrade request
  const loadUserRequest = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user request:', error);
        return;
      }

      setUserRequest(data as UpgradeRequest);
    } catch (error) {
      console.error('Error loading user request:', error);
    }
  }, [user]);

  // Load all upgrade requests (admin only)
  const loadAllRequests = useCallback(async () => {
    if (!user || userRole !== 'admin') return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select(`
          *,
          profiles!upgrade_requests_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading all requests:', error);
        toast.error('Error al cargar solicitudes');
        return;
      }

      setRequests((data || []) as UpgradeRequest[]);
    } catch (error) {
      console.error('Error loading all requests:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  }, [user, userRole]);

  // Create upgrade request
  const createUpgradeRequest = useCallback(async (data: CreateUpgradeRequestData) => {
    if (!user || !userRole) {
      toast.error('Usuario no autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('upgrade_requests')
        .insert({
          user_id: user.id,
          user_current_role: userRole,
          requested_role: data.requested_role,
          reason: data.reason,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating upgrade request:', error);
        toast.error('Error al crear solicitud de upgrade');
        return false;
      }

      toast.success('Solicitud de upgrade enviada correctamente');
      loadUserRequest(); // Reload user request
      return true;
    } catch (error) {
      console.error('Error creating upgrade request:', error);
      toast.error('Error al crear solicitud de upgrade');
      return false;
    }
  }, [user, userRole, loadUserRequest]);

  // Approve upgrade request (admin only)
  const approveRequest = useCallback(async (requestId: string, adminNotes?: string) => {
    if (!user || userRole !== 'admin') {
      toast.error('No tienes permisos para esta acción');
      return false;
    }

    try {
      const { error } = await supabase
        .from('upgrade_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error approving request:', error);
        toast.error('Error al aprobar solicitud');
        return false;
      }

      toast.success('Solicitud aprobada correctamente');
      loadAllRequests(); // Reload all requests
      return true;
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error al aprobar solicitud');
      return false;
    }
  }, [user, userRole, loadAllRequests]);

  // Reject upgrade request (admin only)
  const rejectRequest = useCallback(async (requestId: string, adminNotes?: string) => {
    if (!user || userRole !== 'admin') {
      toast.error('No tienes permisos para esta acción');
      return false;
    }

    try {
      const { error } = await supabase
        .from('upgrade_requests')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        toast.error('Error al rechazar solicitud');
        return false;
      }

      toast.success('Solicitud rechazada');
      loadAllRequests(); // Reload all requests
      return true;
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar solicitud');
      return false;
    }
  }, [user, userRole, loadAllRequests]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadUserRequest();
      if (userRole === 'admin') {
        loadAllRequests();
      }
    }
  }, [user, userRole, loadUserRequest, loadAllRequests]);

  return {
    requests,
    userRequest,
    isLoading,
    createUpgradeRequest,
    approveRequest,
    rejectRequest,
    loadUserRequest,
    loadAllRequests
  };
};