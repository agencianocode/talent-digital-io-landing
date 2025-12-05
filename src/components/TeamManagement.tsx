import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserPlus, 
  Crown, 
  Shield, 
  Eye, 
  Trash2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  UserCheck
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

// Types
interface TeamMember {
  id: string;
  user_id?: string;
  invited_email?: string;
  role: 'owner' | 'admin' | 'viewer';
  status: 'accepted' | 'pending' | 'declined';
  invited_by?: string;
  accepted_at?: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'viewer'])
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface TeamManagementProps {
  companyId: string;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ companyId }) => {
  const { user } = useSupabaseAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'viewer'
    }
  });

  // Load team members
  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      // Get company user roles with user profiles  
      const { data: roles, error } = await supabase
        .from('company_user_roles')
        .select(`
          *,
          profiles!company_user_roles_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('company_id', companyId);

      if (error) {
        console.error('Error loading roles:', error);
      }

      // Get company owner
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select(`
          user_id,
          profiles!companies_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('id', companyId)
        .single();

      if (companyError) {
        console.error('Error loading company:', companyError);
      }

      // Combine owner and team members
      const members: TeamMember[] = [];

      // Add owner
      if (company && company.profiles) {
        const ownerProfile = Array.isArray(company.profiles) ? company.profiles[0] : company.profiles;
        members.push({
          id: `owner-${company.user_id}`,
          user_id: company.user_id,
          role: 'owner',
          status: 'accepted',
          created_at: '',
          user_profile: {
            full_name: ownerProfile?.full_name || 'Owner',
            avatar_url: ownerProfile?.avatar_url,
            email: 'owner@company.com' // This will be replaced with real email when available
          }
        });
      }

      // Add team members (incluyendo solicitudes pendientes)
      if (roles) {
        roles.forEach(role => {
          const profile = Array.isArray(role.profiles) ? role.profiles[0] : role.profiles;
          
          // Para solicitudes pendientes con user_id, obtener el nombre del perfil
          const displayName = profile?.full_name || role.invited_email || 'Usuario';
          const displayEmail = role.invited_email || 'Sin email';
          
          members.push({
            id: role.id,
            user_id: role.user_id || undefined,
            invited_email: role.invited_email || undefined,
            role: role.role,
            status: role.status as 'accepted' | 'pending' | 'declined',
            invited_by: role.invited_by || undefined,
            accepted_at: role.accepted_at || undefined,
            created_at: role.created_at,
            user_profile: {
              full_name: displayName,
              avatar_url: profile?.avatar_url,
              email: displayEmail
            }
          });
        });
      }

      console.log('👥 Team members loaded:', {
        total: members.length,
        pending: members.filter(m => m.status === 'pending').length,
        accepted: members.filter(m => m.status === 'accepted').length
      });

      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Error al cargar miembros del equipo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadTeamMembers();
    }
  }, [companyId]);

  // Invite user
  const onInvite = async (data: InviteFormData) => {
    try {
      const { error } = await supabase
        .from('company_user_roles')
        .insert({
          company_id: companyId,
          invited_email: data.email,
          role: data.role,
          invited_by: user?.id,
          status: 'pending',
          user_id: null // Will be set when user accepts
        });

      if (error) throw error;

      toast.success('Invitación enviada correctamente');
      setIsInviteDialogOpen(false);
      form.reset();
      loadTeamMembers();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Error al enviar invitación');
    }
  };

  // Remove team member
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('company_user_roles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Miembro eliminado del equipo');
      loadTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Error al eliminar miembro');
    }
  };

  // Update member role
  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('company_user_roles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Rol actualizado correctamente');
      loadTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar rol');
    }
  };

  // Approve membership request
  const approveMembershipRequest = async (memberId: string) => {
    try {
      console.log('✅ Aprobando solicitud de membresía:', { memberId, companyId });
      
      const { data, error } = await supabase
        .from('company_user_roles')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select();

      console.log('📡 Respuesta de UPDATE:', { data, error });

      if (error) {
        console.error('❌ Error en UPDATE:', error);
        throw error;
      }

      console.log('✅ Solicitud aprobada exitosamente');
      toast.success('Solicitud aprobada correctamente');
      loadTeamMembers();
    } catch (error) {
      console.error('💥 Error completo al aprobar solicitud:', error);
      toast.error('Error al aprobar solicitud. Revisa los logs de consola.');
    }
  };

  // Reject membership request
  const rejectMembershipRequest = async (memberId: string) => {
    try {
      console.log('🚫 Rechazando solicitud de membresía:', { memberId, companyId });
      
      const { data, error } = await supabase
        .from('company_user_roles')
        .update({ status: 'rejected' })
        .eq('id', memberId)
        .select();

      console.log('📡 Respuesta de UPDATE:', { data, error });

      if (error) {
        console.error('❌ Error en UPDATE:', error);
        throw error;
      }

      console.log('✅ Solicitud rechazada exitosamente');
      toast.success('Solicitud rechazada');
      loadTeamMembers();
    } catch (error) {
      console.error('💥 Error completo al rechazar solicitud:', error);
      toast.error('Error al rechazar solicitud. Revisa los logs de consola.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'declined': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Cargando equipo...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestión del Equipo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Administra usuarios y permisos de tu empresa
            </p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="usuario@empresa.com" 
                            type="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  <span className="font-medium">Administrador</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Tiene acceso completo, incluyendo remover miembros del equipo y editar permisos
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="viewer">
                              <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  <span className="font-medium">Miembro</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Tiene acceso completo, pero no puede remover miembros del equipo ni editar permisos
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsInviteDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Invitación
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div 
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user_profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.user_profile?.full_name 
                      ? member.user_profile.full_name.slice(0, 2).toUpperCase()
                      : member.invited_email?.slice(0, 2).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {member.user_profile?.full_name || member.invited_email}
                    </p>
                    {getStatusIcon(member.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.invited_email || member.user_profile?.email}
                  </p>
                  {member.status === 'pending' && (
                    <p className="text-xs text-yellow-600">Solicitud pendiente de aprobación</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant="secondary"
                  className={getRoleColor(member.role)}
                >
                  {getRoleIcon(member.role)}
                  <span className="ml-1">
                    {member.role === 'owner' ? 'Propietario' : member.role === 'admin' ? 'Administrador' : 'Miembro'}
                  </span>
                </Badge>

                <Badge 
                  variant={member.status === 'accepted' ? 'default' : member.status === 'pending' ? 'secondary' : 'destructive'}
                  className={member.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' : member.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                >
                  {member.status === 'accepted' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </>
                  ) : member.status === 'pending' ? (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pendiente
                    </>
                  ) : 'Rechazado'}
                </Badge>
                
                {member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Aprobar - solo para pendientes */}
                      {member.status === 'pending' ? (
                        <DropdownMenuItem 
                          onClick={() => approveMembershipRequest(member.id)}
                          className="text-green-600"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Aprobar solicitud
                        </DropdownMenuItem>
                      ) : member.role !== 'admin' ? (
                        <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'admin')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Hacer Administrador
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'viewer')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Hacer Miembro
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => member.status === 'pending' ? rejectMembershipRequest(member.id) : removeMember(member.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
          
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay miembros en el equipo</p>
              <p className="text-sm">Invita usuarios para comenzar a colaborar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};