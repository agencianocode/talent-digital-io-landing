
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface OptimizedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  className?: string;
}

const OptimizedSearch: React.FC<OptimizedSearchProps> = ({
  onSearch,
  placeholder = 'Buscar...',
  initialValue = '',
  debounceMs = 300,
  showClearButton = true,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Execute search when debounced term changes
  React.useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  const showClear = showClearButton && searchTerm.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {showClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OptimizedSearch;
