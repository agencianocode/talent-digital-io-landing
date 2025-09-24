import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminActivityFeed from '@/components/admin/AdminActivityFeed';
import AdminCharts from '@/components/admin/AdminCharts';
import { useAdminData } from '@/hooks/useAdminData';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { stats, activities, chartData, isLoading, error, refetch } = useAdminData();

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Resumen general de la plataforma
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} isLoading={isLoading} />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2">
          <AdminCharts chartData={chartData} isLoading={isLoading} />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <AdminActivityFeed activities={activities} isLoading={isLoading} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-lg">👥</span>
              <span className="text-sm">Gestionar Usuarios</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-lg">🏢</span>
              <span className="text-sm">Gestionar Empresas</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-lg">💼</span>
              <span className="text-sm">Moderar Oportunidades</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-lg">🛍</span>
              <span className="text-sm">Gestionar Marketplace</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
