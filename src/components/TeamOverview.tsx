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
  UserPlus, 
  Crown, 
  Shield, 
  Eye, 
  ExternalLink,
  Users
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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

interface TeamOverviewProps {
  companyId: string;
}

export const TeamOverview: React.FC<TeamOverviewProps> = ({ companyId }) => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
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

  // Load team members (same logic as UserManagement)
  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      console.log('TeamOverview - Loading members for company:', companyId);
      
      
      // Get company user roles (simple query)
      const { data: roles, error } = await supabase
        .from('company_user_roles')
        .select('*')
        .eq('company_id', companyId);

      console.log('TeamOverview - Roles query result:', { roles, error });

      // Get company owner info
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('user_id, name')
        .eq('id', companyId)
        .single();

      console.log('TeamOverview - Company query result:', { company, companyError });

      // Combine owner and team members
      const members: TeamMember[] = [];

      // Get all unique user_ids to fetch profiles
      const userIds = [];
      if (company) userIds.push(company.user_id);
      if (roles) {
        roles.forEach(role => {
          if (role.user_id && !role.user_id.startsWith('pending-')) {
            userIds.push(role.user_id);
          }
        });
      }

      // Get real profiles for all users
      let profiles: Array<{user_id: string, full_name: string | null, avatar_url: string | null}> = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        
        console.log('TeamOverview - Profiles query result:', { profilesData, profilesError });
        profiles = profilesData || [];
      }

      // Add owner with real data
      if (company) {
        const ownerProfile = profiles.find(p => p.user_id === company.user_id);
        members.push({
          id: `owner-${company.user_id}`,
          user_id: company.user_id,
          role: 'owner',
          status: 'accepted',
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: ownerProfile?.full_name || 'Owner',
            avatar_url: ownerProfile?.avatar_url || undefined,
            email: 'owner@company.com' // We could get this from auth if needed
          }
        });
      }

      // Add team members with real data
      if (roles && roles.length > 0) {
        roles.forEach(role => {
          const userProfile = profiles.find(p => p.user_id === role.user_id);
          
          // Skip the owner role if it's already added as owner
          if (role.role === 'owner' && company && role.user_id === company.user_id) {
            return; // Skip duplicate owner
          }
          
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
              full_name: userProfile?.full_name || role.invited_email?.split('@')[0] || 'Usuario',
              avatar_url: userProfile?.avatar_url || undefined,
              email: role.invited_email || 'unknown@email.com'
            }
          });
        });
      }

      console.log('TeamOverview - Loaded members:', members);
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

  // Auto-refresh every 30 seconds to check for invitation updates
  useEffect(() => {
    if (!companyId) return;

    const interval = setInterval(() => {
      loadTeamMembers();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [companyId]);

  // Quick invite user
  const onInvite = async (data: InviteFormData) => {
    try {
      const { data: insertResult, error } = await (supabase as any)
        .from('company_user_roles')
        .insert({
          company_id: companyId,
          user_id: null, // Will be set when user accepts
          invited_email: data.email,
          role: data.role,
          status: 'pending',
          invited_by: user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Generate invitation link using the actual record ID
      const invitationLink = `${window.location.origin}/accept-invitation?id=${insertResult.id}`;
      
      // Copy link to clipboard
      try {
        await navigator.clipboard.writeText(invitationLink);
        toast.success(`Invitación creada para ${data.email}. Link copiado al portapapeles.`);
      } catch (clipboardError) {
        toast.success(`Invitación creada para ${data.email}. Link: ${invitationLink}`);
      }

      setIsInviteDialogOpen(false);
      form.reset();
      loadTeamMembers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error(`Error al enviar invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };


  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-green-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Cargando equipo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Total Miembros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === 'admin').length}</p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === 'viewer').length}</p>
                <p className="text-sm text-muted-foreground">Visualizadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Miembros del Equipo
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invitar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invitar Usuario</DialogTitle>
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
                              <Input placeholder="usuario@ejemplo.com" {...field} />
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
                                  <div className="flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                                    Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="viewer">
                                  <div className="flex items-center">
                                    <Eye className="h-4 w-4 mr-2 text-green-600" />
                                    Viewer
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Enviar Invitación</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadTeamMembers}
              >
                🔄 Actualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/business-dashboard/users')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gestión Completa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user_profile?.avatar_url} />
                    <AvatarFallback>
                      {member.user_profile?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user_profile?.full_name || 'Usuario'}</p>
                    <p className="text-sm text-muted-foreground">{member.user_profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleBadgeColor(member.role)}>
                    <div className="flex items-center">
                      {getRoleIcon(member.role)}
                      <span className="ml-1">{member.role}</span>
                    </div>
                  </Badge>
                  <Badge className={getStatusBadgeColor(member.status)}>
                    {member.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay miembros en el equipo aún.</p>
              <p className="text-sm">Invita usuarios para comenzar a colaborar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
