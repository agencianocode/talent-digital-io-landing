import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Users, Building, User, GraduationCap, Shield } from 'lucide-react';

interface UserFilters {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  countryFilter: string;
  dateRange: string;
  companyRoleFilter: string;
}

interface AdminUserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  totalUsers: number;
  filteredCount: number;
  isLoading?: boolean;
}

const AdminUserFilters: React.FC<AdminUserFiltersProps> = ({
  filters,
  onFiltersChange,
  totalUsers,
  filteredCount,
  isLoading = false
}) => {
  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      roleFilter: 'all',
      statusFilter: 'all',
      countryFilter: 'all',
      dateRange: 'all',
      companyRoleFilter: 'all'
    });
  };

  // Check if selected role is business role (for conditional company role filter)
  const isBusinessRole = ['freemium_business', 'premium_business', 'academy_premium'].includes(filters.roleFilter);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Usuarios
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredCount} de {totalUsers} usuarios
            </Badge>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filtro por Rol */}
          <div>
            <Select
              value={filters.roleFilter}
              onValueChange={(value) => handleFilterChange('roleFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Administrador
                  </div>
                </SelectItem>
                <SelectItem value="premium_business">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresa Premium
                  </div>
                </SelectItem>
                <SelectItem value="freemium_business">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresa Freemium
                  </div>
                </SelectItem>
                <SelectItem value="premium_talent">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Talento Premium
                  </div>
                </SelectItem>
                <SelectItem value="freemium_talent">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Talento Freemium
                  </div>
                </SelectItem>
                <SelectItem value="academy_premium">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Academia Premium
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <Select
              value={filters.statusFilter}
              onValueChange={(value) => handleFilterChange('statusFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por País */}
          <div>
            <Select
              value={filters.countryFilter}
              onValueChange={(value) => handleFilterChange('countryFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los países" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los países</SelectItem>
                <SelectItem value="AR">Argentina</SelectItem>
                <SelectItem value="BR">Brasil</SelectItem>
                <SelectItem value="CL">Chile</SelectItem>
                <SelectItem value="CO">Colombia</SelectItem>
                <SelectItem value="CR">Costa Rica</SelectItem>
                <SelectItem value="MX">México</SelectItem>
                <SelectItem value="PE">Perú</SelectItem>
                <SelectItem value="UY">Uruguay</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
                <SelectItem value="ES">España</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional Company Role Filter */}
        {isBusinessRole && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <Select
                value={filters.companyRoleFilter}
                onValueChange={(value) => handleFilterChange('companyRoleFilter', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol en empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los miembros</SelectItem>
                  <SelectItem value="admin_owner">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Solo Admins/Owners
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Solo Viewers
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Filtro por Rango de Fechas */}
        <div className="mt-4">
          <Select
            value={filters.dateRange}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Rango de fechas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Búsqueda: {filters.searchQuery}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('searchQuery', '')}
                />
              </Badge>
            )}
            {filters.roleFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rol: {filters.roleFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('roleFilter', 'all')}
                />
              </Badge>
            )}
            {filters.statusFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Estado: {filters.statusFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('statusFilter', 'all')}
                />
              </Badge>
            )}
            {filters.countryFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                País: {filters.countryFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('countryFilter', 'all')}
                />
              </Badge>
            )}
            {filters.dateRange !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Fecha: {filters.dateRange}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('dateRange', 'all')}
                />
              </Badge>
            )}
            {filters.companyRoleFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rol empresa: {filters.companyRoleFilter === 'admin_owner' ? 'Admin/Owner' : 'Viewer'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('companyRoleFilter', 'all')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserFilters;
