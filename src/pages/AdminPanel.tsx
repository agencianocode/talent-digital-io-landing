import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Shield,
  Building,
  Star,
  User
} from 'lucide-react';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { useUpgradeRequests } from '@/hooks/useUpgradeRequests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import AdminDashboard from './admin/AdminDashboard';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminCompanyManagement from './admin/AdminCompanyManagement';
import AdminOpportunityModeration from './admin/AdminOpportunityModeration';
import AdminMarketplaceManagement from './admin/AdminMarketplaceManagement';
import AdminChatManagement from './admin/AdminChatManagement';
import { AdminProfileSettings } from '@/components/admin/AdminProfileSettings';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyFilterId, setCompanyFilterId] = useState<string | null>(null);

  // Load admin stats using get-all-users Edge Function
  const loadStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session');
        return;
      }

      const { data, error } = await supabase.functions.invoke('get-all-users', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      const users = data?.users || [];
      const roleCounts = users.reduce((acc: Record<string, number>, u: any) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});

      // Normalize all possible roles to ensure they appear even if count is 0
      const usersByRole = {
        admin: 0,
        premium_business: 0,
        freemium_business: 0,
        business: 0,
        premium_talent: 0,
        talent: 0,
        ...roleCounts,
      };

      const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

      setStats({
        totalUsers: users.length,
        pendingRequests: pendingRequestsCount,
        usersByRole
      });

      console.log('Admin stats loaded:', { totalUsers: users.length, usersByRole });
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-4 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <SidebarTrigger className="flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {stats.pendingRequests > 0 && activeTab !== 'upgrade-requests' && (
                <Badge variant="destructive" className="text-[10px] md:text-xs px-1.5 md:px-2.5">
                  {stats.pendingRequests} {stats.pendingRequests === 1 ? 'solicitud' : 'solicitudes'}
                </Badge>
              )}
            </div>
          </header>

          <div className="p-2 md:p-4 border-b bg-muted/30 overflow-x-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 min-w-max sm:min-w-0">
              <Card className="min-w-[140px] sm:min-w-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-4">
                  <CardTitle className="text-[10px] md:text-xs font-medium truncate">Total Usuarios</CardTitle>
                  <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-2 md:p-4 pt-0">
                  <div className="text-base md:text-xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[140px] sm:min-w-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-4">
                  <CardTitle className="text-[10px] md:text-xs font-medium truncate">Administrador</CardTitle>
                  <Shield className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-2 md:p-4 pt-0">
                  <div className="text-base md:text-xl font-bold text-purple-600">{stats.usersByRole['admin'] || 0}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[140px] sm:min-w-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-4">
                  <CardTitle className="text-[10px] md:text-xs font-medium truncate">Empresa Premium</CardTitle>
                  <Crown className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-2 md:p-4 pt-0">
                  <div className="text-base md:text-xl font-bold text-yellow-600">{stats.usersByRole['premium_business'] || 0}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[140px] sm:min-w-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-4">
                  <CardTitle className="text-[10px] md:text-xs font-medium truncate">Empresa Freemium</CardTitle>
                  <Building className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-2 md:p-4 pt-0">
                  <div className="text-base md:text-xl font-bold text-blue-600">{stats.usersByRole['freemium_business'] || 0}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[140px] sm:min-w-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-4">
                  <CardTitle className="text-[10px] md:text-xs font-medium truncate">Talento Premium</CardTitle>
                  <Star className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-2 md:p-4 pt-0">
                  <div className="text-base md:text-xl font-bold text-orange-600">{stats.usersByRole['premium_talent'] || 0}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[140px] sm:min-w-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-4">
                  <CardTitle className="text-[10px] md:text-xs font-medium truncate">Talento Freemium</CardTitle>
                  <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-2 md:p-4 pt-0">
                  <div className="text-base md:text-xl font-bold text-green-600">{stats.usersByRole['freemium_talent'] || 0}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <main className="flex-1 overflow-auto p-3 md:p-6">`
            {activeTab === "dashboard" && (
              <AdminDashboard onTabChange={(tab) => {
                const tabMap: Record<string, string> = {
                  'users': 'users',
                  'companies': 'companies',
                  'opportunities': 'opportunities',
                  'marketplace': 'marketplace'
                };
                setActiveTab(tabMap[tab] || tab);
              }} />
            )}

            {activeTab === "upgrade-requests" && (
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes de Upgrade Pendientes</CardTitle>
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
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setIsDialogOpen(false);
                                        setAdminNotes('');
                                        setSelectedUser(null);
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      onClick={async () => {
                                        if (selectedUser) {
                                          await approveRequest(request.id, adminNotes);
                                          setIsDialogOpen(false);
                                          setAdminNotes('');
                                          setSelectedUser(null);
                                        }
                                      }}
                                    >
                                      Confirmar Aprobación
                                    </Button>
                                  </DialogFooter>
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
            )}

            {activeTab === "users" && (
              <AdminUserManagement />
            )}

            {activeTab === "companies" && (
              <AdminCompanyManagement 
                onNavigateToOpportunities={(companyId) => {
                  setCompanyFilterId(companyId);
                  setActiveTab('opportunities');
                }}
              />
            )}

            {activeTab === "opportunities" && (
              <AdminOpportunityModeration companyFilterId={companyFilterId} />
            )}

            {activeTab === "marketplace" && (
              <AdminMarketplaceManagement />
            )}

            {activeTab === "chat" && (
              <AdminChatManagement />
            )}

            {activeTab === "notifications" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Notificaciones</h2>
                <p className="text-muted-foreground">Panel de notificaciones administrativas</p>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Configuración</h2>
                <p className="text-muted-foreground">Configuración del sistema</p>
              </div>
            )}

            {activeTab === "admin-profile" && (
              <AdminProfileSettings />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;