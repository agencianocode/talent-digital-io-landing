import React from 'react';
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
import { Search, X } from 'lucide-react';
import { ServiceFilters as ServiceFiltersType } from '@/hooks/useMarketplaceServices';
import { NEW_MARKETPLACE_CATEGORIES } from '@/lib/marketplace-constants';

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
  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.categoryFilter !== 'all';

  return (
    <div className="mb-6 space-y-3">
      {/* Search + Category en una línea */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descripción o persona..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Category Dropdown */}
        <Select
          value={filters.categoryFilter}
          onValueChange={(value) => onFiltersChange({ categoryFilter: value })}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {NEW_MARKETPLACE_CATEGORIES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalResults} servicios encontrados
          </span>
          {filters.searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: "{filters.searchQuery}"
            </Badge>
          )}
          {filters.categoryFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filters.categoryFilter}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground h-6 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceFilters;
