import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminActivityFeed from '@/components/admin/AdminActivityFeed';
import AdminCharts from '@/components/admin/AdminCharts';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminCustomization } from '@/hooks/useAdminCustomization';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onTabChange?: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onTabChange }) => {
  const { stats, activities, chartData, isLoading, error, refetch } = useAdminData();
  const { customization } = useAdminCustomization();

  const handleRefresh = async () => {
    toast.loading('Actualizando datos...', { id: 'refresh' });
    await refetch();
    toast.success('Datos actualizados correctamente', { id: 'refresh' });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error al cargar datos</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {customization?.platform_name ? `${customization.platform_name} - Admin` : 'Dashboard Administrativo'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {customization?.platform_description || 'Resumen general de la plataforma'}
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {customization?.show_stats_cards !== false && (
        <AdminStatsCards stats={stats} isLoading={isLoading} />
      )}

      {/* Charts and Activity */}
      {(customization?.show_charts !== false || customization?.show_activity_feed !== false) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          {customization?.show_charts !== false && (
            <div className="lg:col-span-2">
              <AdminCharts chartData={chartData} isLoading={isLoading} />
            </div>
          )}

          {/* Activity Feed */}
          {customization?.show_activity_feed !== false && (
            <div className={customization?.show_charts !== false ? "lg:col-span-1" : "lg:col-span-3"}>
              <AdminActivityFeed activities={activities} isLoading={isLoading} />
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {customization?.show_quick_actions !== false && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <Button 
              variant="outline" 
              className="h-auto min-h-[80px] md:h-20 flex flex-col gap-1 md:gap-2 p-3"
              onClick={() => onTabChange?.('users')}
            >
              <span className="text-base md:text-lg">👥</span>
              <span className="text-xs md:text-sm text-center leading-tight">Gestionar Usuarios</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto min-h-[80px] md:h-20 flex flex-col gap-1 md:gap-2 p-3"
              onClick={() => onTabChange?.('companies')}
            >
              <span className="text-base md:text-lg">🏢</span>
              <span className="text-xs md:text-sm text-center leading-tight">Gestionar Empresas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto min-h-[80px] md:h-20 flex flex-col gap-1 md:gap-2 p-3"
              onClick={() => onTabChange?.('opportunities')}
            >
              <span className="text-base md:text-lg">💼</span>
              <span className="text-xs md:text-sm text-center leading-tight">Moderar Oportunidades</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto min-h-[80px] md:h-20 flex flex-col gap-1 md:gap-2 p-3"
              onClick={() => onTabChange?.('marketplace')}
            >
              <span className="text-base md:text-lg">🛍</span>
              <span className="text-xs md:text-sm text-center leading-tight">Gestionar Marketplace</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Registration Links */}
      {customization?.show_registration_links !== false && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            📝 Links de Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏢</span>
                <div>
                  <p className="font-medium text-sm">Registro para Empresas</p>
                  <p className="text-xs text-muted-foreground">/register-business</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/register-business');
                  toast.success('Link copiado al portapapeles');
                }}
              >
                Copiar Link
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="font-medium text-sm">Registro para Talento</p>
                  <p className="text-xs text-muted-foreground">/register-talent</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/register-talent');
                  toast.success('Link copiado al portapapeles');
                }}
              >
                Copiar Link
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎓</span>
                <div>
                  <p className="font-medium text-sm">Registro para Academias</p>
                  <p className="text-xs text-muted-foreground">/register-academy</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/register-academy');
                  toast.success('Link copiado al portapapeles');
                }}
              >
                Copiar Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* System Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Operativo</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleString('es')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Versión</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-muted-foreground">v1.0.0</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
