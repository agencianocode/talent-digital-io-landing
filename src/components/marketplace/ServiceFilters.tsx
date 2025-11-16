import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { ServiceFilters as ServiceFiltersType } from '@/hooks/useMarketplaceServices';
import { CATEGORY_SKILLS, getAllSkills } from '@/lib/marketplace-categories';
import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories';

interface ServiceFiltersProps {
  filters: ServiceFiltersType;
  onFiltersChange: (filters: Partial<ServiceFiltersType>) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults
}) => {
  const { categories: marketplaceCategories } = useMarketplaceCategories();
  
  // Get available skills based on selected category
  const availableSkills = useMemo(() => {
    if (filters.categoryFilter === 'all') {
      return getAllSkills();
    }
    return CATEGORY_SKILLS[filters.categoryFilter] || [];
  }, [filters.categoryFilter]);

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.categoryFilter !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.locationFilter !== 'all' ||
    filters.availabilityFilter !== 'all' ||
    (filters.skillsFilter && filters.skillsFilter !== 'all');

  const priceRanges = [
    { value: 'all', label: 'Todos los precios' },
    { value: '0-100', label: 'Hasta $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: '500-1000', label: '$500 - $1,000' },
    { value: '1000-2500', label: '$1,000 - $2,500' },
    { value: '2500-5000', label: '$2,500 - $5,000' },
    { value: '5000+', label: 'Más de $5,000' }
  ];

  const locations = [
    { value: 'all', label: 'Todas las ubicaciones' },
    { value: 'Remoto', label: 'Remoto' },
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Híbrido', label: 'Híbrido' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponibles' },
    { value: 'unavailable', label: 'No disponibles' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {totalResults} servicios encontrados
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descripción o persona..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <Select
              value={filters.categoryFilter}
              onValueChange={(value) => {
                onFiltersChange({ 
                  categoryFilter: value,
                  // Reset skills filter when category changes
                  skillsFilter: 'all'
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {marketplaceCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills Filter - Right next to Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Skills</label>
            <Select
              value={filters.skillsFilter || 'all'}
              onValueChange={(value) => onFiltersChange({ skillsFilter: value })}
              disabled={availableSkills.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={availableSkills.length > 0 ? "Todas las skills" : "Selecciona categoría"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las skills</SelectItem>
                {availableSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rango de Precio</label>
            <Select
              value={filters.priceRange}
              onValueChange={(value) => onFiltersChange({ priceRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rango" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ubicación</label>
            <Select
              value={filters.locationFilter}
              onValueChange={(value) => onFiltersChange({ locationFilter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Disponibilidad</label>
            <Select
              value={filters.availabilityFilter}
              onValueChange={(value) => onFiltersChange({ availabilityFilter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            {filters.searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Búsqueda: "{filters.searchQuery}"
              </Badge>
            )}
            {filters.categoryFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Categoría: {opportunityCategories.find(c => c.id === filters.categoryFilter)?.name || filters.categoryFilter}
              </Badge>
            )}
            {filters.priceRange !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Precio: {priceRanges.find(r => r.value === filters.priceRange)?.label}
              </Badge>
            )}
            {filters.locationFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Ubicación: {locations.find(l => l.value === filters.locationFilter)?.label}
              </Badge>
            )}
            {filters.availabilityFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Disponibilidad: {availabilityOptions.find(o => o.value === filters.availabilityFilter)?.label}
              </Badge>
            )}
            {filters.skillsFilter && filters.skillsFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Skill: {filters.skillsFilter}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceFilters;
