import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  Users, 
  UserPlus, 
  RefreshCw, 
  Crown, 
  Shield, 
  Eye,
  User,
  Check,
  X,
  Clock,
  MoreVertical,
  UserMinus,
  UserCog
} from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PermissionDenied from '@/components/PermissionDenied';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamMember {
  id: string;
  user_id: string | null;
  company_id: string;
  role: 'owner' | 'admin' | 'viewer';
  status: string;
  created_at: string;
  updated_at: string;
  invited_email?: string | null;
  invited_by?: string | null;
  user?: {
    id: string | null;
    email: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

interface InviteData {
  email: string;
  role: 'admin' | 'viewer';
  message?: string;
}

const UsersManagement = () => {
  const { activeCompany, canManageUsers, refreshCompanies } = useCompany();
  const { user } = useSupabaseAuth();
  
  console.log('UsersManagement component mounted');
  console.log('activeCompany from context:', activeCompany);
  console.log('user from context:', user);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData>({
    email: '',
    role: 'viewer',
    message: ''
  });

  // Load team members using direct queries with profiles
  const loadTeamMembers = async () => {
    if (!activeCompany?.id) return;

    setIsLoading(true);
    try {
      console.log('[UsersManagement] Loading team members for company:', activeCompany.id);

      // Get company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('user_id, name, created_at, updated_at, id')
        .eq('id', activeCompany.id)
        .maybeSingle();

      if (companyError) throw companyError;

      const { data: teamData, error: rolesError } = await supabase
        .from('company_user_roles')
        .select('*')
        .eq('company_id', activeCompany.id)
        .order('created_at', { ascending: true });

      if (rolesError) throw rolesError;

      const userIds = [
        ...(companyData?.user_id ? [companyData.user_id] : []),
        ...(teamData || [])
          .map((r) => r.user_id)
          .filter((id): id is string => id !== null && typeof id === 'string' && id.length === 36),
      ];
      const uniqueUserIds = [...new Set(userIds)];

      let profiles: any[] = [];
      if (uniqueUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', uniqueUserIds);
        
        console.log('[UsersManagement] Profiles query:', { uniqueUserIds, profilesData, profilesError });
        profiles = profilesData || [];
      }
      
      // Get emails and names from auth context
      const emailsMap: Record<string, string> = {};
      const namesMap: Record<string, string> = {};
      
      // For current user, we already have the email and name from context
      if (user?.id && user?.email) {
        emailsMap[user.id] = user.email;
        
        // Try to get full name from user metadata (Google Auth, etc)
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
        if (fullName) {
          namesMap[user.id] = fullName;
        }
        
        console.log('[UsersManagement] Current user data:', { 
          userId: user.id, 
          email: user.email, 
          fullName,
          metadata: user.user_metadata 
        });
      }

      const allMembers: TeamMember[] = [];

      if (companyData?.user_id) {
        const ownerInRoles = (teamData || []).find(
          (m) => m.user_id === companyData.user_id && m.role === 'owner'
        );
        if (!ownerInRoles) {
          const ownerProfile = profiles.find((p) => p.user_id === companyData.user_id);
          const ownerEmail = emailsMap[companyData.user_id] || '';
          const ownerName = namesMap[companyData.user_id] || ownerProfile?.full_name || 'Propietario';
          
          console.log('[UsersManagement] Owner profile found:', { 
            ownerProfile, 
            ownerEmail, 
            ownerName,
            fromMetadata: namesMap[companyData.user_id]
          });
          
          allMembers.push({
            id: `owner-${companyData.user_id}`,
            user_id: companyData.user_id,
            company_id: activeCompany.id,
            role: 'owner',
            status: 'accepted',
            invited_by: null,
            created_at: companyData.created_at || new Date().toISOString(),
            updated_at: companyData.updated_at || new Date().toISOString(),
            invited_email: ownerEmail || null,
            user: {
              id: companyData.user_id,
              email: ownerEmail,
              full_name: ownerName,
              avatar_url: ownerProfile?.avatar_url || null,
            },
          });
        }
      }

      const membersWithUserInfo = (teamData || []).map((member) => {
        const userProfile = profiles.find((p) => p.user_id === member.user_id);
        const memberEmail = member.user_id ? (emailsMap[member.user_id] || member.invited_email || '') : (member.invited_email || '');
        const memberName = member.user_id 
          ? (namesMap[member.user_id] || userProfile?.full_name || member.invited_email?.split('@')[0] || 'Usuario')
          : (member.invited_email?.split('@')[0] || 'Usuario');
        
        console.log('[UsersManagement] Processing member:', { 
          member, 
          userProfile, 
          memberEmail,
          memberName,
          fromEmailsMap: member.user_id ? emailsMap[member.user_id] : 'N/A',
          fromNamesMap: member.user_id ? namesMap[member.user_id] : 'N/A'
        });
        
        return {
          ...member,
          user: {
            id: member.user_id || '',
            email: memberEmail,
            full_name: memberName,
            avatar_url: userProfile?.avatar_url || null,
          },
        } as TeamMember;
      });

      const finalMembers = [...allMembers, ...membersWithUserInfo];
      console.log('[UsersManagement] Final members to display:', finalMembers);
      setTeamMembers(finalMembers);
    } catch (error) {
      console.error('[UsersManagement] Error loading team members:', error);
      toast.error('Error al cargar los miembros del equipo');
    } finally {
      setIsLoading(false);
    }
  };
  // Send invitation
  const handleSendInvitation = async () => {
    if (!inviteData.email.trim()) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    if (!activeCompany?.id) {
      toast.error('No hay empresa activa');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting invitation process...');
      console.log('Invite data:', inviteData);
      console.log('Active company:', activeCompany);
      console.log('User:', user);

      // Check if user is already a member by email (check both user_id and invited_email)
      console.log('Checking existing members...');
      const { data: existingMembers, error: checkError } = await supabase
        .from('company_user_roles')
        .select('id, user_id, invited_email')
        .eq('company_id', activeCompany.id);

      console.log('Existing members query result:', { existingMembers, checkError });

      if (checkError) {
        console.error('Error checking existing members:', checkError);
        throw checkError;
      }

      // Check if email is already invited or is a member
      const isAlreadyMember = existingMembers?.some(member => 
        member.invited_email === inviteData.email || 
        member.user_id === inviteData.email // In case user_id stores email
      );

      console.log('Is already member?', isAlreadyMember);

      if (isAlreadyMember) {
        toast.error('Este usuario ya es miembro del equipo o ya tiene una invitación pendiente');
        return;
      }

      // Create invitation
      console.log('Creating invitation...');
      const invitationData = {
        company_id: activeCompany.id,
        user_id: null,
        role: inviteData.role,
        status: 'pending',
        invited_by: user?.id || null,
        invited_email: inviteData.email
      };
      
      console.log('Invitation data to insert:', invitationData);

      const { data: created, error: insertError } = await supabase
        .from('company_user_roles')
        .insert(invitationData)
        .select('id')
        .single();

      console.log('Insert result:', { created, insertError });

      if (insertError || !created?.id) {
        console.error('Error creating invitation:', insertError);
        throw insertError || new Error('No se pudo crear la invitación');
      }

      // Send invitation email via edge function
      console.log('Invoking send-invitation edge function...');
      const payload = {
        email: inviteData.email,
        role: inviteData.role,
        company_id: activeCompany.id,
        invited_by: user?.email || 'Administrador',
        invitation_id: created.id,
        redirect_base: window.location.origin
      };
      console.log('[send-invitation] payload:', payload);

      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: payload
      });

      if (emailError) {
        console.error('send-invitation error:', emailError);
        const fallbackUrl = `${window.location.origin}/accept-invitation?id=${created.id}`;
        toast.warning(
          `Invitación creada exitosamente. Nota: El correo no se pudo enviar automáticamente. Enlace de invitación: ${fallbackUrl}`,
          { duration: 8000 }
        );
      } else {
        console.log('send-invitation response:', emailData);
        toast.success('¡Invitación enviada exitosamente! El usuario recibirá un correo con las instrucciones.');
      }

      setIsInviteModalOpen(false);
      setInviteData({ email: '', role: 'viewer', message: '' });
      await loadTeamMembers();
      await refreshCompanies();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar la invitación');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove team member
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover a este miembro del equipo?')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('company_user_roles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Miembro removido exitosamente');
      await loadTeamMembers();
      await refreshCompanies();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Error al remover el miembro');
    } finally {
      setIsLoading(false);
    }
  };

  // Update member role
  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'viewer') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('company_user_roles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Rol actualizado exitosamente');
      await loadTeamMembers();
      await refreshCompanies();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  // Approve membership request
  const handleApproveMembership = async (memberId: string) => {
    console.log('📋 handleApproveMembership called with:', { memberId, activeCompanyId: activeCompany?.id });
    
    if (memberId.startsWith('owner-')) {
      console.warn('⚠️ Cannot approve owner - this is a fake ID');
      return;
    }
    
    if (!activeCompany?.id) {
      console.warn('⚠️ No active company');
      toast.error('No hay empresa activa');
      return;
    }

    setIsLoading(true);
    try {
      // Verificar primero que el registro existe y pertenece a esta empresa
      const { data: checkData, error: checkError } = await supabase
        .from('company_user_roles')
        .select('id, status, company_id, user_id')
        .eq('id', memberId)
        .maybeSingle();
      
      console.log('🔍 Pre-check result:', { checkData, checkError });
      
      if (checkError) {
        console.error('❌ Check error:', checkError);
        toast.error(`Error al verificar: ${checkError.message}`);
        return;
      }
      
      if (!checkData) {
        console.error('❌ Record not found');
        toast.error('El registro no existe');
        return;
      }
      
      if (checkData.company_id !== activeCompany.id) {
        console.error('❌ Record belongs to different company');
        toast.error('No tienes permisos para esta solicitud');
        return;
      }
      
      if (checkData.status === 'accepted') {
        console.warn('⚠️ Already accepted');
        toast.info('Esta solicitud ya fue aprobada');
        await loadTeamMembers();
        return;
      }

      // Hacer el update
      const now = new Date().toISOString();
      console.log('📡 Attempting update with:', { memberId, status: 'accepted', accepted_at: now });
      
      const { data, error } = await (supabase as any)
        .from('company_user_roles')
        .update({ 
          status: 'accepted',
          accepted_at: now,
          updated_at: now
        })
        .eq('id', memberId)
        .select();

      console.log('📡 Update result:', { data, error, rowsAffected: data?.length });

      if (error) {
        console.error('❌ Update error:', error);
        toast.error(`Error: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error('❌ No rows updated - possible RLS issue');
        toast.error('No se pudo actualizar. Verifica tus permisos.');
        return;
      }

      console.log('✅ Successfully approved:', data[0]);
      toast.success('Solicitud aprobada correctamente');
      
      // Recargar datos para reflejar cambios
      await loadTeamMembers();
      await refreshCompanies();
    } catch (error: any) {
      console.error('💥 Exception:', error);
      toast.error(`Error: ${error?.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reject membership request
  const handleRejectMembership = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres rechazar esta solicitud?')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚫 Rechazando solicitud:', { memberId, companyId: activeCompany?.id });
      
      const { error } = await supabase
        .from('company_user_roles')
        .update({ status: 'rejected' })
        .eq('id', memberId);

      if (error) {
        console.error('❌ Error rechazando:', error);
        throw error;
      }

      toast.success('Solicitud rechazada');
      await loadTeamMembers();
      await refreshCompanies();
    } catch (error) {
      console.error('💥 Error al rechazar solicitud:', error);
      toast.error('Error al rechazar solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered for loadTeamMembers');
    console.log('activeCompany?.id:', activeCompany?.id);
    loadTeamMembers();
  }, [activeCompany?.id]);


  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'declined': return <X className="w-3 h-3" />;
      default: return null;
    }
  };

  // Check if user has access
  if (!activeCompany) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  Selecciona una empresa para gestionar su equipo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Check permissions
  if (!canManageUsers()) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <PermissionDenied
              title="Acceso Denegado"
              message="No tienes permisos para gestionar usuarios. Solo los propietarios y administradores pueden acceder a esta página."
              requiredRole="admin"
            />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Equipo</h1>
                  <p className="text-gray-600">Administra los miembros y permisos de tu empresa</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800">
                      <UserPlus className="w-4 h-4" />
                      + Invitar a un compañero de equipo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Invitar a compañeros de equipo</DialogTitle>
                        <DialogDescription>
                          Tus compañeros de equipo recibirán un correo electrónico con una invitación para unirse a tu empresa en TalentoDigital.io.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 mt-6">
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Direcciones de correo electrónico
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Agregar correos electrónicos"
                            value={inviteData.email}
                            onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Para invitar a varias personas, separe las direcciones de correo electrónico con comas.
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Nivel de acceso
                          </Label>
                          <div className="mt-3 space-y-3">
                            <div 
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                inviteData.role === 'admin' 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setInviteData(prev => ({ ...prev, role: 'admin' }))}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                                  inviteData.role === 'admin' 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {inviteData.role === 'admin' && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">Administrador</span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Tiene acceso completo, incluyendo remover miembros del equipo y editar permisos.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div 
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                inviteData.role === 'viewer' 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setInviteData(prev => ({ ...prev, role: 'viewer' }))}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                                  inviteData.role === 'viewer' 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {inviteData.role === 'viewer' && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Eye className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-gray-900">Miembro</span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Tiene acceso completo, pero no puede remover miembros del equipo ni editar permisos.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                            Mensaje
                          </Label>
                          <Textarea
                            id="message"
                            placeholder="Incluir un mensaje opcional..."
                            value={inviteData.message}
                            onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                            rows={3}
                            className="mt-2"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsInviteModalOpen(false)}
                            className="px-6"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleSendInvitation} 
                            disabled={isLoading || !inviteData.email.trim()}
                            className="px-6 bg-gray-900 hover:bg-gray-800"
                          >
                            {isLoading ? 'Enviando...' : 'Enviar invitación'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" onClick={loadTeamMembers} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
          </div>

          {/* Team Members Section */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Cargando miembros...</span>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay miembros en el equipo</h3>
              <p className="text-gray-600 mb-4">Invita a los primeros miembros para comenzar a colaborar</p>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invitar Primer Miembro
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.user?.avatar_url} />
                          <AvatarFallback>
                            {(() => {
                              console.log('Rendering avatar for member:', member);
                              console.log('Member user data:', member.user);
                              return member.user?.full_name ? 
                                member.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() :
                                (member.user?.email || member.invited_email)?.[0]?.toUpperCase() || 'U';
                            })()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user?.full_name || member.invited_email || 'Usuario'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {member.user?.email || member.invited_email || 'Sin email'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`flex items-center gap-1 ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          {member.role === 'owner' ? 'Propietario' : 
                           member.role === 'admin' ? 'Administrador' : 'Miembro'}
                        </Badge>
                        <Badge className={`flex items-center gap-1 ${getStatusColor(member.status)}`}>
                          {getStatusIcon(member.status)}
                          {member.status === 'accepted' ? 'Activo' :
                           member.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                        {(() => {
                          // No mostrar menú para owners o IDs falsos (owner-xxx)
                          const isValidId = !member.id.startsWith('owner-');
                          const showMenu = member.role !== 'owner' && canManageUsers() && isValidId;
                          console.log('🔍 Menú de 3 puntos:', {
                            memberId: member.id,
                            memberName: member.user?.full_name,
                            role: member.role,
                            status: member.status,
                            isOwner: member.role === 'owner',
                            isValidId,
                            canManage: canManageUsers(),
                            showMenu
                          });
                          return showMenu;
                        })() && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Aprobar solicitud - solo para pendientes */}
                              {(() => {
                                const isPending = member.status === 'pending';
                                console.log('🔍 Opciones de menú para:', {
                                  memberId: member.id,
                                  status: member.status,
                                  isPending,
                                  shouldShowApprove: isPending
                                });
                                return isPending;
                              })() && (
                                <>
                                  <div 
                                    onClick={() => {
                                      console.log('🎯 Approve button clicked for:', member.id);
                                      handleApproveMembership(member.id);
                                    }}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-green-600 hover:bg-accent hover:text-accent-foreground"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Aprobar solicitud
                                  </div>
                                  <div
                                    onClick={() => {
                                      console.log('🎯 Reject button clicked for:', member.id);
                                      handleRejectMembership(member.id);
                                    }}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-600 hover:bg-accent hover:text-accent-foreground"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Rechazar solicitud
                                  </div>
                                </>
                              )}
                              
                              {/* Opciones de rol - solo para miembros aceptados */}
                              {member.status === 'accepted' && (
                                <>
                                  {member.role !== 'admin' && (
                                    <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                                      <UserCog className="mr-2 h-4 w-4" />
                                      Hacer Administrador
                                    </DropdownMenuItem>
                                  )}
                                  {member.role !== 'viewer' && (
                                    <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'viewer')}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Hacer Miembro
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              
                              {/* Eliminar - disponible siempre */}
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-destructive"
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UsersManagement;
