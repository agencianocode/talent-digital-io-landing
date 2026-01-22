import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Users, Building, User, Shield, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, AlertCircle, Clock, CircleSlash } from 'lucide-react';

interface UserFilters {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  countryFilter: string;
  dateRange: string;
  companyRoleFilter: string;
  completenessFilter: string;
  subscriptionFilter: string;
  sortBy: 'name' | 'date' | 'last_activity';
  sortOrder: 'asc' | 'desc';
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
      companyRoleFilter: 'all',
      completenessFilter: 'all',
      subscriptionFilter: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const toggleSortOrder = () => {
    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'sortBy' && key !== 'sortOrder' && value !== '' && value !== 'all'
  ) || filters.sortBy !== 'date' || filters.sortOrder !== 'desc';

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
                    <Shield className="h-4 w-4" />
                    🛡️ Superadmin
                  </div>
                </SelectItem>
                <SelectItem value="owner">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    👑 Owner Empresa
                  </div>
                </SelectItem>
                <SelectItem value="company_admin">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    ⚙️ Admin Empresa
                  </div>
                </SelectItem>
                <SelectItem value="company_member">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    👤 Miembro Empresa
                  </div>
                </SelectItem>
                <SelectItem value="talent">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    💼 Talento
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Suscripción */}
          <div>
            <Select
              value={filters.subscriptionFilter || 'all'}
              onValueChange={(value) => handleFilterChange('subscriptionFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las suscripciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las suscripciones</SelectItem>
                <SelectItem value="premium">⭐ Premium</SelectItem>
                <SelectItem value="freemium">Free</SelectItem>
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

          {/* Filtro por Completitud de Perfil */}
          <div>
            <Select
              value={filters.completenessFilter}
              onValueChange={(value) => handleFilterChange('completenessFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Completitud de perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los perfiles</SelectItem>
                <SelectItem value="complete">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Perfil 100% completo
                  </div>
                </SelectItem>
                <SelectItem value="incomplete">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Perfil Incompleto
                  </div>
                </SelectItem>
                <SelectItem value="unverified">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    Perfil sin verificar
                  </div>
                </SelectItem>
                <SelectItem value="zero">
                  <div className="flex items-center gap-2">
                    <CircleSlash className="h-4 w-4 text-red-600" />
                    Perfil 0%
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second row: Country and Company Role filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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


        {/* Filtro por Rango de Fechas y Ordenamiento */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange('dateRange', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
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

          {/* Ordenar por */}
          <div>
            <Select
              value={filters.sortBy}
              onValueChange={(value: 'name' | 'date' | 'last_activity') => handleFilterChange('sortBy', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Fecha de registro
                  </div>
                </SelectItem>
                <SelectItem value="last_activity">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Última actividad
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Nombre
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orden ascendente/descendente */}
          <div>
            <Button
              variant="outline"
              onClick={toggleSortOrder}
              disabled={isLoading}
              className="w-full justify-start"
            >
              {filters.sortOrder === 'asc' ? (
                <>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Ascendente
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Descendente
                </>
              )}
            </Button>
          </div>
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
                Rol: {
                  filters.roleFilter === 'admin' ? 'Superadmin' :
                  filters.roleFilter === 'owner' ? 'Owner' :
                  filters.roleFilter === 'company_admin' ? 'Admin Empresa' :
                  filters.roleFilter === 'company_member' ? 'Miembro' :
                  filters.roleFilter === 'talent' ? 'Talento' : filters.roleFilter
                }
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('roleFilter', 'all')}
                />
              </Badge>
            )}
            {filters.subscriptionFilter && filters.subscriptionFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Suscripción: {filters.subscriptionFilter === 'premium' ? 'Premium' : 'Free'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('subscriptionFilter', 'all')}
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
            {filters.completenessFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Completitud: {
                  filters.completenessFilter === 'complete' ? '100%' :
                  filters.completenessFilter === 'incomplete' ? 'Incompleto' :
                  filters.completenessFilter === 'unverified' ? 'Sin verificar' : '0%'
                }
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('completenessFilter', 'all')}
                />
              </Badge>
            )}
            {(filters.sortBy !== 'date' || filters.sortOrder !== 'desc') && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Orden: {filters.sortBy === 'date' ? 'Fecha' : filters.sortBy === 'last_activity' ? 'Actividad' : 'Nombre'} ({filters.sortOrder === 'asc' ? 'Asc' : 'Desc'})
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserFilters;
