import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Load team members using secure RPC with safe fallback
  const loadTeamMembers = async () => {
    if (!activeCompany?.id) return;

    setIsLoading(true);
    try {
      // 1) Try secure RPC first
      const { data, error } = await supabase.rpc('get_company_team_members', { company_uuid: activeCompany.id });

      if (!error && Array.isArray(data) && data.length > 0) {
        const membersWithUserInfo: TeamMember[] = data.map((member: any) => ({
          id: member.id,
          user_id: member.user_id,
          company_id: member.company_id,
          role: member.role,
          status: member.status,
          invited_email: member.invited_email,
          invited_by: member.invited_by,
          created_at: member.created_at,
          updated_at: member.updated_at,
          user: {
            id: member.user_id || '',
            email: member.email || member.invited_email || '',
            full_name: member.full_name || member.email?.split('@')[0] || 'Miembro',
            avatar_url: member.avatar_url || null,
          },
        }));

        setTeamMembers(membersWithUserInfo);
        return;
      }

      console.warn('[UsersManagement] RPC vacío o con error, usando fallback...', { error, data });

      // 2) Fallback: consultas directas (como antes)
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('user_id, name, created_at, updated_at, id')
        .eq('id', activeCompany.id)
        .maybeSingle();

      if (companyError) throw companyError;

      const { data: teamData, error: rolesError } = await supabase
        .from('company_user_roles')
        .select(`
          *,
          profiles!company_user_roles_user_id_fkey (
            user_id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('company_id', activeCompany.id)
        .order('created_at', { ascending: true });

      if (rolesError) throw rolesError;

      // Get owner profile
      let ownerProfile: any = null;
      if (companyData?.user_id) {
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, email')
          .eq('user_id', companyData.user_id)
          .maybeSingle();
        ownerProfile = ownerData;
      }

      const allMembers: TeamMember[] = [];

      if (companyData?.user_id) {
        const ownerInRoles = (teamData || []).find(
          (m) => m.user_id === companyData.user_id && m.role === 'owner'
        );
        if (!ownerInRoles && ownerProfile) {
          allMembers.push({
            id: `owner-${companyData.user_id}`,
            user_id: companyData.user_id,
            company_id: activeCompany.id,
            role: 'owner',
            status: 'accepted',
            invited_by: null,
            created_at: companyData.created_at || new Date().toISOString(),
            updated_at: companyData.updated_at || new Date().toISOString(),
            invited_email: ownerProfile?.email || null,
            user: {
              id: companyData.user_id,
              email: ownerProfile?.email || '',
              full_name: ownerProfile?.full_name || 'Propietario',
              avatar_url: ownerProfile?.avatar_url || null,
            },
          });
        }
      }

      const membersWithUserInfo = (teamData || []).map((member) => {
        // Get profile from the join
        const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
        
        return {
          ...member,
          user: {
            id: member.user_id || '',
            email: profile?.email || member.invited_email || '',
            full_name: profile?.full_name || member.invited_email?.split('@')[0] || 'Usuario',
            avatar_url: profile?.avatar_url || null,
          },
        } as TeamMember;
      });

      setTeamMembers([...allMembers, ...membersWithUserInfo]);
    } catch (error) {
      console.error('Error loading team members:', error);
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

  useEffect(() => {
    console.log('useEffect triggered for loadTeamMembers');
    console.log('activeCompany?.id:', activeCompany?.id);
    loadTeamMembers();
  }, [activeCompany?.id]);

  // Calculate statistics
  const totalMembers = teamMembers.length;
  const admins = teamMembers.filter(m => m.role === 'admin').length;
  const viewers = teamMembers.filter(m => m.role === 'viewer').length;
  const owners = teamMembers.filter(m => m.role === 'owner').length;

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Equipo</h1>
                <p className="text-gray-600">Administra los miembros y permisos de tu empresa</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                    <p className="text-sm text-gray-600">Total Miembros</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Crown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{owners}</p>
                    <p className="text-sm text-gray-600">Propietarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{admins}</p>
                    <p className="text-sm text-gray-600">Administradores</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{viewers}</p>
                    <p className="text-sm text-gray-600">Visualizadores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <CardTitle>Miembros de la organización</CardTitle>
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
            </CardHeader>
            <CardContent>
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
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
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
                        {member.role !== 'owner' && canManageUsers() && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UsersManagement;
