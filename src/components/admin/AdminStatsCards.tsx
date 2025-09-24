import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building, 
  Briefcase, 
  ShoppingBag, 
  TrendingUp,
  Activity
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalOpportunities: number;
  activeOpportunities: number;
  pausedOpportunities: number;
  closedOpportunities: number;
  totalServices: number;
  activeServices: number;
  usersByRole: Record<string, number>;
  recentActivity: number;
}

interface AdminStatsCardsProps {
  stats: AdminStats;
  isLoading?: boolean;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* Total Usuarios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.recentActivity} esta semana
          </p>
        </CardContent>
      </Card>

      {/* Total Empresas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Empresas</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          <p className="text-xs text-muted-foreground">
            Registradas
          </p>
        </CardContent>
      </Card>

      {/* Oportunidades Activas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Oportunidades Activas</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activeOpportunities}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pausedOpportunities} pausadas
          </p>
        </CardContent>
      </Card>

      {/* Total Oportunidades */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Oportunidades</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
          <p className="text-xs text-muted-foreground">
            {stats.closedOpportunities} cerradas
          </p>
        </CardContent>
      </Card>

      {/* Servicios Activos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Servicios Activos</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.activeServices}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalServices} total
          </p>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Actividad Reciente</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.recentActivity}</div>
          <p className="text-xs text-muted-foreground">
            Últimas 24h
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsCards;
