import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Shield,
  Building,
  Star,
  User,
  GraduationCap,
  BarChart3,
  UserCheck,
  Building2,
  Briefcase,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { useUpgradeRequests } from '@/hooks/useUpgradeRequests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LogoutButton from '@/components/LogoutButton';
import AdminDashboard from './admin/AdminDashboard';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminCompanyManagement from './admin/AdminCompanyManagement';
import AdminOpportunityModeration from './admin/AdminOpportunityModeration';
import AdminMarketplaceManagement from './admin/AdminMarketplaceManagement';
import AdminChatManagement from './admin/AdminChatManagement';
import { useAdminChatBadge } from '@/hooks/useAdminChatBadge';

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
  const { unreadCount: unreadAdminMessages } = useAdminChatBadge();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, pendingRequests: 0, usersByRole: {} });
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyFilterId, setCompanyFilterId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold">Panel de Administración</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Gestión de usuarios y solicitudes</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-medium">Total Usuarios</CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-medium">Administrador</CardTitle>
              <Shield className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-xl font-bold text-purple-600">{stats.usersByRole['admin'] || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-medium">Empresa Premium</CardTitle>
              <Crown className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-xl font-bold text-yellow-600">{stats.usersByRole['premium_business'] || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-medium">Empresa Freemium</CardTitle>
              <Building className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-xl font-bold text-blue-600">{stats.usersByRole['freemium_business'] || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-medium">Talento Premium</CardTitle>
              <Star className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-xl font-bold text-orange-600">{stats.usersByRole['premium_talent'] || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-medium">Talento Freemium</CardTitle>
              <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-xl font-bold text-green-600">{stats.usersByRole['freemium_talent'] || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="w-full md:w-auto inline-flex">
              <TabsTrigger value="dashboard" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="upgrade-requests" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Solicitudes de Upgrade</span>
                <span className="md:hidden">Solicitudes</span>
              </TabsTrigger>
              <TabsTrigger value="user-management" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <UserCheck className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Gestión de Usuarios</span>
                <span className="md:hidden">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger value="company-management" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <Building2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Gestión de Empresas</span>
                <span className="md:hidden">Empresas</span>
              </TabsTrigger>
              <TabsTrigger value="opportunity-moderation" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <Briefcase className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Moderación de Oportunidades</span>
                <span className="md:hidden">Oportunidades</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace-management" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <ShoppingBag className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Gestión del Marketplace</span>
                <span className="md:hidden">Marketplace</span>
              </TabsTrigger>
              <TabsTrigger value="user-chat" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Chat con Usuarios</span>
                <span className="md:hidden">Chat</span>
                {unreadAdminMessages > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0 h-4 md:h-5 min-w-[1rem] md:min-w-[1.25rem] text-[10px] md:text-xs">
                    {unreadAdminMessages}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="dashboard">
          <AdminDashboard onTabChange={(tab) => {
            const tabMap: Record<string, string> = {
              'users': 'user-management',
              'companies': 'company-management',
              'opportunities': 'opportunity-moderation',
              'marketplace': 'marketplace-management'
            };
            setActiveTab(tabMap[tab] || tab);
          }} />
        </TabsContent>

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
                <div className="space-y-3 md:space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-3 md:p-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                              <span className="font-medium text-sm md:text-base">
                                {(request as any).profiles?.full_name || 'Usuario sin nombre'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {getRoleDisplayText(request.user_current_role)}
                              </Badge>
                              <span className="text-muted-foreground text-xs">→</span>
                              <Badge variant={getRoleBadgeVariant(request.requested_role)} className="text-xs">
                                {getRoleDisplayText(request.requested_role)}
                              </Badge>
                            </div>
                          </div>
                          
                          {request.reason && (
                            <div className="text-xs md:text-sm text-muted-foreground">
                              <strong>Razón:</strong> {request.reason}
                            </div>
                          )}
                          
                          <div className="text-[10px] md:text-xs text-muted-foreground">
                            Solicitado el {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs md:text-sm"
                                onClick={() => setSelectedUser({ 
                                  id: request.user_id, 
                                  full_name: (request as any).profiles?.full_name || 'Usuario sin nombre',
                                  role: request.user_current_role,
                                  created_at: request.created_at 
                                })}
                              >
                                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                <span className="hidden sm:inline">Aprobar</span>
                                <span className="sm:hidden">✓</span>
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
                            className="text-xs md:text-sm"
                            onClick={() => rejectRequest(request.id, 'Solicitud rechazada por el administrador')}
                          >
                            <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            <span className="hidden sm:inline">Rechazar</span>
                            <span className="sm:hidden">✕</span>
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
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="company-management">
          <AdminCompanyManagement 
            onNavigateToOpportunities={(companyId) => {
              setCompanyFilterId(companyId);
              setActiveTab('opportunity-moderation');
            }}
          />
        </TabsContent>

        <TabsContent value="opportunity-moderation">
          <AdminOpportunityModeration companyFilterId={companyFilterId} />
        </TabsContent>

        <TabsContent value="marketplace-management">
          <AdminMarketplaceManagement />
        </TabsContent>

          <TabsContent value="user-chat">
            <AdminChatManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;