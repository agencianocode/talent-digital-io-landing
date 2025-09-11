import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
  User,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import OptimizedSearch from '@/components/OptimizedSearch';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
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
  const { userRole, isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const { requests, isLoading: requestsLoading, approveRequest, rejectRequest, loadAllRequests } = useUpgradeRequests();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, pendingRequests: 0, usersByRole: {} });
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoleChangeOpen, setIsRoleChangeOpen] = useState(false);
  
  // Filtering and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Load admin stats using secure function
  const loadStats = async () => {
    try {
      const { data: statsData, error } = await supabase
        .rpc('get_user_stats_for_admin');

      if (error) throw error;

      console.log('Raw stats data:', statsData);

      if (!statsData || statsData.length === 0) {
        setStats({ totalUsers: 0, pendingRequests: 0, usersByRole: {} });
        return;
      }

      const totalUsers = statsData[0]?.total_users || 0;
      const usersByRole = statsData.reduce((acc, stat) => {
        if (stat.role_name) {
          acc[stat.role_name] = stat.role_count;
        }
        return acc;
      }, {} as Record<string, number>);

      const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

      setStats({
        totalUsers: Number(totalUsers),
        pendingRequests: pendingRequestsCount,
        usersByRole
      });

      console.log('Admin stats loaded:', {
        totalUsers: Number(totalUsers),
        pendingRequests: pendingRequestsCount,
        usersByRole
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error cargando estadísticas');
    }
  };

  // Load all users using secure function
  const loadUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .rpc('get_all_users_for_admin');

      if (error) throw error;

      console.log('Raw users data:', usersData);

      if (!usersData || usersData.length === 0) {
        setUsers([]);
        return;
      }

      const formattedUsers = usersData.map(user => ({
        id: user.user_id,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
      }));

      setUsers(formattedUsers);
      console.log('Users loaded:', formattedUsers.length, 'users');
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error cargando usuarios');
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

  // Filter and paginate users
  const filteredAndPaginatedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filtered.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = filtered.slice(startIndex, startIndex + usersPerPage);

    return {
      users: paginatedUsers,
      totalUsers: filtered.length,
      totalPages,
      currentPage
    };
  }, [users, searchQuery, roleFilter, currentPage, usersPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadAllRequests();
  }, [loadAllRequests]);

  useEffect(() => {
    loadStats();
  }, [requests]);

  // Show loading while authentication is being checked
  if (authLoading) {
    console.log('AdminPanel: Showing loading state - authLoading:', authLoading);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Enhanced validation with better logging
  if (!isAuthenticated) {
    console.log('AdminPanel: User not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!userRole) {
    console.log('AdminPanel: No user role available, showing loading');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    console.log('AdminPanel: User role is not admin:', userRole, '- redirecting to appropriate dashboard');
    // Redirect to appropriate dashboard based on role
    const redirectPath = isBusinessRole(userRole) ? '/business-dashboard' : '/talent-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  console.log('AdminPanel: User authenticated as admin, rendering panel');

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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Administrador</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{stats.usersByRole['admin'] || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Empresa Premium</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">{stats.usersByRole['premium_business'] || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Empresa Freemium</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{stats.usersByRole['freemium_business'] || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Talento Premium</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{stats.usersByRole['premium_talent'] || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Talento Freemium</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{stats.usersByRole['freemium_talent'] || 0}</div>
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
              {requestsLoading ? (
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
                Gestión de Usuarios ({filteredAndPaginatedUsers.totalUsers} usuarios)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <OptimizedSearch
                    onSearch={setSearchQuery}
                    placeholder="Buscar por nombre o ID..."
                    className="w-full"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="premium_business">Empresa Premium</SelectItem>
                      <SelectItem value="freemium_business">Empresa Freemium</SelectItem>
                      <SelectItem value="premium_talent">Talento Premium</SelectItem>
                      <SelectItem value="freemium_talent">Talento Freemium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredAndPaginatedUsers.users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {users.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios con los filtros aplicados'}
                  </div>
                ) : (
                  filteredAndPaginatedUsers.users.map((user) => (
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
                  ))
                )}
              </div>

              {/* Pagination */}
              {filteredAndPaginatedUsers.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * usersPerPage) + 1} - {Math.min(currentPage * usersPerPage, filteredAndPaginatedUsers.totalUsers)} de {filteredAndPaginatedUsers.totalUsers} usuarios
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: filteredAndPaginatedUsers.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const delta = 2;
                          return page === 1 || 
                                 page === filteredAndPaginatedUsers.totalPages || 
                                 Math.abs(page - currentPage) <= delta;
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-10 h-10"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === filteredAndPaginatedUsers.totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;