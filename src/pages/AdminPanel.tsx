import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Crown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield,
  TrendingUp,
  Building,
  GraduationCap,
  User,
  LogOut
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUpgradeRequests } from '@/hooks/useUpgradeRequests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LogoutButton from '@/components/LogoutButton';

interface AdminStats {
  totalUsers: number;
  pendingRequests: number;
  usersByRole: Record<string, number>;
}

interface UserData {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const { userRole } = useSupabaseAuth();
  const { requests, isLoading, approveRequest, rejectRequest, loadAllRequests } = useUpgradeRequests();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, pendingRequests: 0, usersByRole: {} });
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoleChangeOpen, setIsRoleChangeOpen] = useState(false);

  // Redirect if not admin
  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Load admin stats
  const loadStats = async () => {
    try {
      const { data: userRolesData, error } = await supabase
        .from('user_roles')
        .select('role');

      if (error) throw error;

      const usersByRole = userRolesData?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        totalUsers: userRolesData?.length || 0,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        usersByRole
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      // Get profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        return;
      }

      // Get user roles separately
      const userIds = profilesData.map(p => p.user_id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combine the data
      const formattedUsers = profilesData.map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.user_id);
        return {
          id: profile.user_id,
          full_name: profile.full_name || 'Sin nombre',
          role: userRole?.role || 'unknown',
          created_at: profile.created_at
        };
      });

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', selectedUser.id);

      if (error) throw error;

      toast.success('Rol actualizado exitosamente');
      setIsRoleChangeOpen(false);
      setSelectedUser(null);
      setNewRole('');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'premium_business': 
      case 'premium_talent': return 'default';
      case 'freemium_business': 
      case 'freemium_talent': return 'secondary';
      default: return 'outline';
    }
  };

  // Get role display text
  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'premium_business': return 'Empresa Premium';
      case 'freemium_business': return 'Empresa Freemium';
      case 'premium_talent': return 'Talento Premium';
      case 'freemium_talent': return 'Talento Freemium';
      default: return role;
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadAllRequests();
  }, [loadAllRequests]);

  useEffect(() => {
    loadStats();
  }, [requests]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestión de usuarios y solicitudes</p>
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(stats.usersByRole['premium_business'] || 0) + (stats.usersByRole['premium_talent'] || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Freemium</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats.usersByRole['freemium_business'] || 0) + (stats.usersByRole['freemium_talent'] || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upgrade-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upgrade-requests">Solicitudes de Upgrade</TabsTrigger>
          <TabsTrigger value="user-management">Gestión de Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="upgrade-requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Solicitudes de Upgrade Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Cargando solicitudes...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay solicitudes pendientes
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">
                                {(request as any).profiles?.full_name || 'Usuario sin nombre'}
                              </span>
                            </div>
                            <Badge variant="outline">
                              {getRoleDisplayText(request.user_current_role)}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant={getRoleBadgeVariant(request.requested_role)}>
                              {getRoleDisplayText(request.requested_role)}
                            </Badge>
                          </div>
                          
                          {request.reason && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Razón:</strong> {request.reason}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Solicitado el {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser({ 
                                  id: request.user_id, 
                                  full_name: (request as any).profiles?.full_name || 'Usuario sin nombre',
                                  role: request.user_current_role,
                                  created_at: request.created_at 
                                })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Aprobar Solicitud de Upgrade</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="admin-notes">Notas del Administrador (Opcional)</Label>
                                  <Textarea
                                    id="admin-notes"
                                    placeholder="Agregar notas sobre la aprobación..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={async () => {
                                      if (selectedUser) {
                                        await approveRequest(request.id, adminNotes);
                                        setIsDialogOpen(false);
                                        setAdminNotes('');
                                        setSelectedUser(null);
                                      }
                                    }}
                                    className="flex-1"
                                  >
                                    Confirmar Aprobación
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setIsDialogOpen(false);
                                      setAdminNotes('');
                                      setSelectedUser(null);
                                    }}
                                    className="flex-1"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => rejectRequest(request.id, 'Solicitud rechazada por el administrador')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-management">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Registro: {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleDisplayText(user.role)}
                        </Badge>
                      </div>

                      <Dialog open={isRoleChangeOpen} onOpenChange={setIsRoleChangeOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                            }}
                          >
                            Cambiar Rol
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Usuario: {selectedUser?.full_name}</Label>
                            </div>
                            <div>
                              <Label htmlFor="new-role">Nuevo Rol</Label>
                              <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="premium_business">Empresa Premium</SelectItem>
                                  <SelectItem value="freemium_business">Empresa Freemium</SelectItem>
                                  <SelectItem value="premium_talent">Talento Premium</SelectItem>
                                  <SelectItem value="freemium_talent">Talento Freemium</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleRoleChange} className="flex-1">
                                Cambiar Rol
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setIsRoleChangeOpen(false);
                                  setSelectedUser(null);
                                  setNewRole('');
                                }}
                                className="flex-1"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;