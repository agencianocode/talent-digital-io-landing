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
  User
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUpgradeRequests } from '@/hooks/useUpgradeRequests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // Load admin statistics
  const loadStats = async () => {
    try {
      // Get total users and roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role');

      if (rolesError) throw rolesError;

      const totalUsers = rolesData?.length || 0;
      const usersByRole = rolesData?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const pendingRequests = requests.filter(r => r.status === 'pending').length;

      setStats({ totalUsers, pendingRequests, usersByRole });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          created_at,
          user_roles!inner(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(user => ({
        id: user.user_id,
        full_name: user.full_name || 'Sin nombre',
        role: (user.user_roles[0] as any)?.role || 'unknown',
        created_at: user.created_at
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Change user role
  const changeUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', selectedUser.id);

      if (error) throw error;

      toast.success(`Rol actualizado para ${selectedUser.full_name}`);
      setIsRoleChangeOpen(false);
      setSelectedUser(null);
      setNewRole('');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Error al cambiar el rol');
    }
  };

  // Handle approve request
  const handleApprove = async (requestId: string) => {
    const success = await approveRequest(requestId, adminNotes);
    if (success) {
      setAdminNotes('');
      setIsDialogOpen(false);
      loadStats();
    }
  };

  // Handle reject request
  const handleReject = async (requestId: string) => {
    const success = await rejectRequest(requestId, adminNotes);
    if (success) {
      setAdminNotes('');
      setIsDialogOpen(false);
      loadStats();
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
  }, [requests]);

  const getRoleIcon = (role: string) => {
    if (role.includes('talent')) return <User className="h-4 w-4" />;
    if (role.includes('business')) return <Building className="h-4 w-4" />;
    if (role.includes('academy')) return <GraduationCap className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'destructive';
    if (role.includes('premium')) return 'default';
    return 'secondary';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión de usuarios y solicitudes</p>
        </div>
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
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.usersByRole)
                .filter(([role]) => role.includes('premium'))
                .reduce((sum, [, count]) => sum + count, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Freemium</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.usersByRole)
                .filter(([role]) => role.includes('freemium'))
                .reduce((sum, [, count]) => sum + count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Solicitudes de Upgrade</TabsTrigger>
          <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Upgrade Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Cargando...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay solicitudes pendientes
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Usuario</Label>
                          <p className="text-sm">{request.user_id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Rol Actual</Label>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {getRoleIcon(request.user_current_role)}
                            {request.user_current_role}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Rol Solicitado</Label>
                          <Badge variant="default" className="flex items-center gap-1 w-fit">
                            {getRoleIcon(request.requested_role)}
                            {request.requested_role}
                          </Badge>
                        </div>
                      </div>

                      {request.reason && (
                        <div>
                          <Label className="text-sm font-medium">Razón</Label>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Revisar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Revisar Solicitud</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Notas del Administrador</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Agregar notas opcionales..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleApprove(request.id)}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Aprobar
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleReject(request.id)}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rechazar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Registro: {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </div>
                    
                    <Dialog open={isRoleChangeOpen} onOpenChange={setIsRoleChangeOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedUser(user)}
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
                            <p className="text-sm text-muted-foreground">Rol actual: {selectedUser?.role}</p>
                          </div>
                          <div>
                            <Label>Nuevo Rol</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="freemium_talent">Freemium Talent</SelectItem>
                                <SelectItem value="premium_talent">Premium Talent</SelectItem>
                                <SelectItem value="freemium_business">Freemium Business</SelectItem>
                                <SelectItem value="premium_business">Premium Business</SelectItem>
                                <SelectItem value="premium_academy">Premium Academy</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={changeUserRole}
                              disabled={!newRole}
                              className="flex-1"
                            >
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