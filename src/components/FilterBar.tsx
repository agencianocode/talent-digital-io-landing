import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Search, Filter, X, ChevronDown, RotateCcw } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface FilterBarProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  type: 'opportunities' | 'talent';
  resultCount?: number;
  isLoading?: boolean;
}

const OPPORTUNITY_CATEGORIES = [
  { value: 'ventas', label: 'Ventas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'creativo', label: 'Creativo' },
  { value: 'atencion-cliente', label: 'Atención al Cliente' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'tecnologia-automatizaciones', label: 'Tecnología y Automatizaciones' },
  { value: 'soporte-profesional', label: 'Soporte Profesional' }
];

const SUBCATEGORIES = {
  ventas: [
    { value: 'closer', label: 'Closer' },
    { value: 'sdr', label: 'SDR' },
    { value: 'account-manager', label: 'Account Manager' },
    { value: 'business-development', label: 'Business Development' }
  ],
  marketing: [
    { value: 'media-buyer', label: 'Media Buyer' },
    { value: 'content-creator', label: 'Content Creator' },
    { value: 'social-media', label: 'Social Media Manager' },
    { value: 'seo-specialist', label: 'SEO Specialist' },
    { value: 'email-marketing', label: 'Email Marketing' },
    { value: 'brand-manager', label: 'Brand Manager' }
  ],
  creativo: [
    { value: 'disenador-grafico', label: 'Diseñador Gráfico' },
    { value: 'ui-ux-designer', label: 'UI/UX Designer' },
    { value: 'video-editor', label: 'Video Editor' },
    { value: 'fotografo', label: 'Fotógrafo' },
    { value: 'ilustrador', label: 'Ilustrador' },
    { value: 'copywriter', label: 'Copywriter' }
  ],
  'atencion-cliente': [
    { value: 'customer-success', label: 'Customer Success' },
    { value: 'support-agent', label: 'Support Agent' },
    { value: 'community-manager', label: 'Community Manager' },
    { value: 'customer-experience', label: 'Customer Experience' }
  ],
  operaciones: [
    { value: 'project-manager', label: 'Project Manager' },
    { value: 'operations-manager', label: 'Operations Manager' },
    { value: 'data-analyst', label: 'Data Analyst' },
    { value: 'process-improvement', label: 'Process Improvement' },
    { value: 'supply-chain', label: 'Supply Chain' },
    { value: 'quality-assurance', label: 'Quality Assurance' }
  ],
  'tecnologia-automatizaciones': [
    { value: 'desarrollador-frontend', label: 'Desarrollador Frontend' },
    { value: 'desarrollador-backend', label: 'Desarrollador Backend' },
    { value: 'devops-engineer', label: 'DevOps Engineer' },
    { value: 'data-engineer', label: 'Data Engineer' },
    { value: 'automation-specialist', label: 'Automation Specialist' },
    { value: 'system-administrator', label: 'System Administrator' },
    { value: 'cybersecurity', label: 'Cybersecurity' }
  ],
  'soporte-profesional': [
    { value: 'asistente-administrativo', label: 'Asistente Administrativo' },
    { value: 'contador', label: 'Contador' },
    { value: 'abogado', label: 'Abogado' },
    { value: 'recursos-humanos', label: 'Recursos Humanos' },
    { value: 'virtual-assistant', label: 'Virtual Assistant' },
    { value: 'bookkeeper', label: 'Bookkeeper' }
  ]
};

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 años)' },
  { value: 'semi-senior', label: 'Semi-senior (2-5 años)' },
  { value: 'senior', label: 'Senior (5+ años)' }
];

const WORK_MODES = [
  { value: 'remote', label: 'Remoto' },
  { value: 'onsite', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' }
];

const COUNTRIES = [
  { value: 'es', label: 'España' },
  { value: 'mx', label: 'México' },
  { value: 'ar', label: 'Argentina' },
  { value: 'co', label: 'Colombia' },
  { value: 'pe', label: 'Perú' },
  { value: 'cl', label: 'Chile' }
];

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  searchTerm,
  onSearchChange,
  type,
  resultCount,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };

    if (key === 'category') {
      // Al cambiar categoría, limpiar subcategoría para evitar filtros incompatibles
      if (!value || value === '') {
        delete newFilters.category;
      } else {
        newFilters.category = value;
      }
      // Resetear subcategoría siempre que cambie la categoría
      delete newFilters.subcategory;
    } else {
      if (!value || value === '') {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
    }

    onFilterChange(newFilters);
  };
  const handleSalaryChange = (range: number[]) => {
    handleFilterChange('salaryRange', range);
  };

  // Selección múltiple de categorías
  const selectedCategories = Array.isArray(filters.category)
    ? (filters.category as string[])
    : (filters.category ? [filters.category] : []);

  const setCategorySelection = (value: string, checked: boolean) => {
    let updated = [...selectedCategories];
    if (checked) {
      if (!updated.includes(value)) updated.push(value);
    } else {
      updated = updated.filter(v => v !== value);
    }
    handleFilterChange('category', updated.length > 0 ? updated : '');
  };

  const clearAllFilters = () => {
    onFilterChange({});
    setLocalSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).length + (searchTerm ? 1 : 0);
  };

  const removeFilter = (key: string, subValue?: string) => {
    const newFilters = { ...filters } as Record<string, any>;
    if (subValue && Array.isArray(newFilters[key])) {
      const arr = (newFilters[key] as string[]).filter(v => v !== subValue);
      if (arr.length > 0) newFilters[key] = arr; else delete newFilters[key];
    } else {
      delete newFilters[key];
    }
    onFilterChange(newFilters);
  };
  const renderActiveFilters = () => {
    const activeFilters: React.ReactNode[] = [];

    if (searchTerm) {
      activeFilters.push(
        <Badge key="search" variant="secondary" className="gap-1">
          Búsqueda: {searchTerm}
          <X className="h-3 w-3 cursor-pointer" onClick={() => setLocalSearchTerm('')} />
        </Badge>
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        let label = '';
        let skipPush = false;
        switch (key) {
          case 'category':
            if (Array.isArray(value)) {
              (value as string[]).forEach((v) => {
                const lbl = OPPORTUNITY_CATEGORIES.find(c => c.value === v)?.label || v;
                activeFilters.push(
                  <Badge key={`category-${v}`} variant="secondary" className="gap-1">
                    Categoría: {lbl}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('category', v)} />
                  </Badge>
                );
              });
              skipPush = true;
            } else {
              label = `Categoría: ${OPPORTUNITY_CATEGORIES.find(c => c.value === value)?.label || value}`;
            }
            break;
          case 'subcategory':
            label = `Subcategoría: ${value}`;
            break;
          case 'workMode':
            label = `Modalidad: ${WORK_MODES.find(m => m.value === value)?.label || value}`;
            break;
          case 'experience':
            label = `Experiencia: ${EXPERIENCE_LEVELS.find(e => e.value === value)?.label || value}`;
            break;
          case 'country':
            label = `País: ${COUNTRIES.find(c => c.value === value)?.label || value}`;
            break;
          case 'salaryRange':
            label = `Salario: €${(value as number[])[0]}K - €${(value as number[])[1]}K`;
            break;
          default:
            label = `${key}: ${value as string}`;
        }

        if (skipPush) return;

        activeFilters.push(
          <Badge key={key} variant="secondary" className="gap-1">
            {label}
            <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(key)} />
          </Badge>
        );
      }
    });

    return activeFilters;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Main Controls */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={type === 'opportunities' ? 'Buscar oportunidades...' : 'Buscar talento por nombre o skills...'}
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {getActiveFiltersCount() > 0 && (
            <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
              {getActiveFiltersCount()}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>

        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Results Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            'Buscando...'
          ) : (
            `${resultCount} ${type === 'opportunities' ? 'oportunidades' : 'perfiles'} encontrad${resultCount === 1 ? 'o' : 'os'}`
          )}
        </div>
      )}

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {renderActiveFilters()}
        </div>
      )}

      {/* Advanced Filters */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-6">
              {type === 'opportunities' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category (multi-select) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categorías</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedCategories.length > 0 ? `${selectedCategories.length} seleccionadas` : 'Todas las categorías'}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-3" align="start">
                        <div className="space-y-2">
                          {OPPORTUNITY_CATEGORIES.map((category) => (
                            <div key={category.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`cat-${category.value}`}
                                checked={selectedCategories.includes(category.value)}
                                onCheckedChange={(checked) => setCategorySelection(category.value, !!checked)}
                              />
                              <label htmlFor={`cat-${category.value}`} className="text-sm">
                                {category.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Subcategory */}
                  {selectedCategories.length === 1 && SUBCATEGORIES[selectedCategories[0] as keyof typeof SUBCATEGORIES] && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subcategoría</label>
                      <Select
                        value={filters.subcategory || ''}
                        onValueChange={(value) => handleFilterChange('subcategory', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las subcategorías" />
                        </SelectTrigger>
                        <SelectContent>
                           {SUBCATEGORIES[selectedCategories[0] as keyof typeof SUBCATEGORIES]?.map((sub) => (
                            <SelectItem key={sub.value} value={sub.value}>
                              {sub.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Work Mode */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modalidad</label>
                    <Select
                      value={filters.workMode || ''}
                      onValueChange={(value) => handleFilterChange('workMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las modalidades" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experiencia</label>
                    <Select
                      value={filters.experience || ''}
                      onValueChange={(value) => handleFilterChange('experience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los niveles" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Rango salarial: €{filters.salaryRange?.[0] || 20}K - €{filters.salaryRange?.[1] || 100}K
                    </label>
                    <Slider
                      value={filters.salaryRange || [20, 100]}
                      onValueChange={handleSalaryChange}
                      max={150}
                      min={15}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                // Talent Filters
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Specialty */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Especialidad</label>
                    <Select
                      value={filters.specialty || ''}
                      onValueChange={(value) => handleFilterChange('specialty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las especialidades" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Years */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Años de experiencia</label>
                    <Select
                      value={filters.experienceYears || ''}
                      onValueChange={(value) => handleFilterChange('experienceYears', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier experiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">País</label>
                    <Select
                      value={filters.country || ''}
                      onValueChange={(value) => handleFilterChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los países" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Disponibilidad</label>
                    <Select
                      value={filters.availability || ''}
                      onValueChange={(value) => handleFilterChange('availability', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier disponibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Inmediata</SelectItem>
                        <SelectItem value="1-week">1 semana</SelectItem>
                        <SelectItem value="2-weeks">2 semanas</SelectItem>
                        <SelectItem value="1-month">1 mes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FilterBar;