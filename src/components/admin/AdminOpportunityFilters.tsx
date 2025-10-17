import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Briefcase, Building, Tag, AlertTriangle } from 'lucide-react';

interface OpportunityFilters {
  searchQuery: string;
  companyFilter: string;
  categoryFilter: string;
  statusFilter: string;
  dateRange: string;
  priorityFilter: string;
}

interface AdminOpportunityFiltersProps {
  filters: OpportunityFilters;
  onFiltersChange: (filters: OpportunityFilters) => void;
  totalOpportunities: number;
  filteredCount: number;
  isLoading?: boolean;
  companies?: Array<{ id: string; name: string }>;
}

const AdminOpportunityFilters: React.FC<AdminOpportunityFiltersProps> = ({
  filters,
  onFiltersChange,
  totalOpportunities,
  filteredCount,
  isLoading = false,
  companies = []
}) => {
  const handleFilterChange = (key: keyof OpportunityFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      companyFilter: 'all',
      categoryFilter: 'all',
      statusFilter: 'all',
      dateRange: 'all',
      priorityFilter: 'all'
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
            Filtros de Oportunidades
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredCount} de {totalOpportunities} oportunidades
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
                placeholder="Buscar por título, empresa..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filtro por Empresa */}
          <div>
            <Select
              value={filters.companyFilter}
              onValueChange={(value) => handleFilterChange('companyFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {company.name}
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
                <SelectItem value="ventas">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Ventas
                  </div>
                </SelectItem>
                <SelectItem value="marketing">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Marketing
                  </div>
                </SelectItem>
                <SelectItem value="atencion-cliente">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Atención Cliente
                  </div>
                </SelectItem>
                <SelectItem value="operaciones">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Operaciones
                  </div>
                </SelectItem>
                <SelectItem value="creativo">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Creativo
                  </div>
                </SelectItem>
                <SelectItem value="tecnologia">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tecnología
                  </div>
                </SelectItem>
                <SelectItem value="soporte-profesional">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Soporte Profesional
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
                    <Briefcase className="h-4 w-4 text-green-600" />
                    Activa
                  </div>
                </SelectItem>
                <SelectItem value="paused">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-yellow-600" />
                    Pausada
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    Cerrada
                  </div>
                </SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
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

          {/* Filtro por Prioridad */}
          <div>
            <Select
              value={filters.priorityFilter}
              onValueChange={(value) => handleFilterChange('priorityFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Alta
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Media
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-green-600" />
                    Baja
                  </div>
                </SelectItem>
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
            {filters.companyFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Empresa: {companies.find(c => c.id === filters.companyFilter)?.name || filters.companyFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('companyFilter', 'all')}
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
            {filters.priorityFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Prioridad: {filters.priorityFilter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('priorityFilter', 'all')}
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

export default AdminOpportunityFilters;
