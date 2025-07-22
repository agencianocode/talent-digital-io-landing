import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Users, Briefcase, Filter } from 'lucide-react';

interface EmptyStateProps {
  type: 'opportunities' | 'talent' | 'search' | 'filter';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'opportunities':
        return {
          icon: <Briefcase className="h-12 w-12 text-muted-foreground" />,
          title: title || 'No hay oportunidades disponibles',
          description: description || 'No se encontraron oportunidades que coincidan con tus criterios.',
          actionText: actionText || 'Limpiar filtros',
        };
      case 'talent':
        return {
          icon: <Users className="h-12 w-12 text-muted-foreground" />,
          title: title || 'No se encontró talento',
          description: description || 'No hay perfiles que coincidan con tus criterios de búsqueda.',
          actionText: actionText || 'Ajustar filtros',
        };
      case 'search':
        return {
          icon: <Search className="h-12 w-12 text-muted-foreground" />,
          title: title || 'Sin resultados de búsqueda',
          description: description || 'No encontramos resultados para tu búsqueda. Intenta con otros términos.',
          actionText: actionText || 'Limpiar búsqueda',
        };
      case 'filter':
        return {
          icon: <Filter className="h-12 w-12 text-muted-foreground" />,
          title: title || 'Sin resultados con estos filtros',
          description: description || 'Los filtros aplicados no produjeron ningún resultado. Intenta ajustarlos.',
          actionText: actionText || 'Limpiar filtros',
        };
      default:
        return {
          icon: <Search className="h-12 w-12 text-muted-foreground" />,
          title: title || 'Sin resultados',
          description: description || 'No se encontraron resultados.',
          actionText: actionText || 'Reintentar',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4">
          {content.icon}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {content.title}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          {content.description}
        </p>

        {(onAction || content.actionText) && (
          <Button
            variant="outline"
            onClick={onAction}
          >
            {content.actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;