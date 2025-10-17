import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, ShoppingBag, User, Tag, AlertTriangle } from 'lucide-react';

interface MarketplaceFilters {
  searchQuery: string;
  userFilter: string;
  categoryFilter: string;
  statusFilter: string;
  dateRange: string;
  priceRange: string;
}

interface AdminMarketplaceFiltersProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  totalServices: number;
  filteredCount: number;
  isLoading?: boolean;
  users?: Array<{ id: string; name: string }>;
}

const AdminMarketplaceFilters: React.FC<AdminMarketplaceFiltersProps> = ({
  filters,
  onFiltersChange,
  totalServices,
  filteredCount,
  isLoading = false,
  users = []
}) => {
  const handleFilterChange = (key: keyof MarketplaceFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      userFilter: 'all',
      categoryFilter: 'all',
      statusFilter: 'all',
      dateRange: 'all',
      priceRange: 'all'
    });
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
            Filtros del Marketplace
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredCount} de {totalServices} servicios
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
                placeholder="Buscar por nombre, empresa..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filtro por Usuario */}
          <div>
            <Select
              value={filters.userFilter}
              onValueChange={(value) => handleFilterChange('userFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Categoría */}
          <div>
            <Select
              value={filters.categoryFilter}
              onValueChange={(value) => handleFilterChange('categoryFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="diseno-grafico">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Diseño Gráfico
                  </div>
                </SelectItem>
                <SelectItem value="desarrollo-web">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Desarrollo Web
                  </div>
                </SelectItem>
                <SelectItem value="marketing-digital">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Marketing Digital
                  </div>
                </SelectItem>
                <SelectItem value="consultoria">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Consultoría
                  </div>
                </SelectItem>
                <SelectItem value="redaccion">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Redacción
                  </div>
                </SelectItem>
                <SelectItem value="traduccion">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Traducción
                  </div>
                </SelectItem>
                <SelectItem value="video-edicion">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Video y Edición
                  </div>
                </SelectItem>
                <SelectItem value="otros">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Otros
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
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-green-600" />
                    Activo
                  </div>
                </SelectItem>
                <SelectItem value="paused">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-yellow-600" />
                    Pausado
                  </div>
                </SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    Borrador
                  </div>
                </SelectItem>
                <SelectItem value="review-required">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Revisión Requerida
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Rango de Precio */}
          <div>
            <Select
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los precios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="0-100">$0 - $100</SelectItem>
                <SelectItem value="100-500">$100 - $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="5000+">$5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
            {filters.userFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Usuario: {users.find(u => u.id === filters.userFilter)?.name || filters.userFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('userFilter', 'all')}
                />
              </Badge>
            )}
            {filters.categoryFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Categoría: {filters.categoryFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('categoryFilter', 'all')}
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
            {filters.priceRange !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Precio: {filters.priceRange}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('priceRange', 'all')}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminMarketplaceFilters;
