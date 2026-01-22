import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Building, Users, MapPin, ArrowUpDown, ArrowUp, ArrowDown, Crown, GraduationCap, Briefcase } from 'lucide-react';

interface CompanyFilters {
  searchQuery: string;
  industryFilter: string;
  sizeFilter: string;
  locationFilter: string;
  dateRange: string;
  statusFilter: string;
  businessTypeFilter: string;
  subscriptionFilter: string;
  sortBy: 'name' | 'date';
  sortOrder: 'asc' | 'desc';
}

interface AdminCompanyFiltersProps {
  filters: CompanyFilters;
  onFiltersChange: (filters: CompanyFilters) => void;
  totalCompanies: number;
  filteredCount: number;
  isLoading?: boolean;
}

const AdminCompanyFilters: React.FC<AdminCompanyFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCompanies,
  filteredCount,
  isLoading = false
}) => {
  const handleFilterChange = (key: keyof CompanyFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      industryFilter: 'all',
      sizeFilter: 'all',
      locationFilter: 'all',
      dateRange: 'all',
      statusFilter: 'all',
      businessTypeFilter: 'all',
      subscriptionFilter: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const toggleSortOrder = () => {
    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Empresas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredCount} de {totalCompanies} empresas
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, industria..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filtro por Industria */}
          <div>
            <Select
              value={filters.industryFilter}
              onValueChange={(value) => handleFilterChange('industryFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las industrias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las industrias</SelectItem>
                <SelectItem value="technology">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Tecnología
                  </div>
                </SelectItem>
                <SelectItem value="marketing">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Marketing
                  </div>
                </SelectItem>
                <SelectItem value="sales">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Ventas
                  </div>
                </SelectItem>
                <SelectItem value="consulting">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Consultoría
                  </div>
                </SelectItem>
                <SelectItem value="education">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Educación
                  </div>
                </SelectItem>
                <SelectItem value="healthcare">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Salud
                  </div>
                </SelectItem>
                <SelectItem value="finance">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Finanzas
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Otras
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Tamaño */}
          <div>
            <Select
              value={filters.sizeFilter}
              onValueChange={(value) => handleFilterChange('sizeFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tamaños" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tamaños</SelectItem>
                <SelectItem value="startup">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Startup (1-10)
                  </div>
                </SelectItem>
                <SelectItem value="small">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Pequeña (11-50)
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Mediana (51-200)
                  </div>
                </SelectItem>
                <SelectItem value="large">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Grande (201-1000)
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Enterprise (1000+)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Ubicación */}
          <div>
            <Select
              value={filters.locationFilter}
              onValueChange={(value) => handleFilterChange('locationFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                <SelectItem value="remote">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Remoto
                  </div>
                </SelectItem>
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
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
                <SelectItem value="suspended">Suspendidas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row: Business Type, Subscription, Date, Sort */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro por Tipo de Negocio */}
          <div>
            <Select
              value={filters.businessTypeFilter}
              onValueChange={(value) => handleFilterChange('businessTypeFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de negocio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="company">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Empresa
                  </div>
                </SelectItem>
                <SelectItem value="academy">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Academia
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Suscripción */}
          <div>
            <Select
              value={filters.subscriptionFilter}
              onValueChange={(value) => handleFilterChange('subscriptionFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Suscripción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las suscripciones</SelectItem>
                <SelectItem value="premium">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Premium
                  </div>
                </SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              onValueChange={(value: 'name' | 'date') => handleFilterChange('sortBy', value)}
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
            {filters.industryFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Industria: {filters.industryFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('industryFilter', 'all')}
                />
              </Badge>
            )}
            {filters.sizeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tamaño: {filters.sizeFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('sizeFilter', 'all')}
                />
              </Badge>
            )}
            {filters.locationFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Ubicación: {filters.locationFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('locationFilter', 'all')}
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
            {filters.businessTypeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tipo: {filters.businessTypeFilter === 'academy' ? 'Academia' : 'Empresa'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('businessTypeFilter', 'all')}
                />
              </Badge>
            )}
            {filters.subscriptionFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Suscripción: {filters.subscriptionFilter === 'premium' ? 'Premium' : 'Freemium'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('subscriptionFilter', 'all')}
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
            {(filters.sortBy !== 'date' || filters.sortOrder !== 'desc') && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Orden: {filters.sortBy === 'date' ? 'Fecha' : 'Nombre'} ({filters.sortOrder === 'asc' ? 'Asc' : 'Desc'})
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCompanyFilters;
