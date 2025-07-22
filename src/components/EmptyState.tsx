
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Users, Briefcase, Filter, MessageCircle, FileText, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'opportunities' | 'talent' | 'search' | 'filter' | 'applications' | 'messages' | 'error';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'opportunities':
        return {
          icon: icon || <Briefcase className="h-12 w-12 text-muted-foreground" />,
          title: title || 'No tienes oportunidades publicadas',
          description: description || 'Comienza publicando tu primera oportunidad para atraer el mejor talento.',
          actionText: actionText || 'Publicar Primera Oportunidad',
        };
      case 'talent':
        return {
          icon: icon || <Users className="h-12 w-12 text-muted-foreground" />,
          title: title || 'No se encontró talento',
          description: description || 'No hay perfiles que coincidan con tus criterios de búsqueda. Intenta ajustar los filtros.',
          actionText: actionText || 'Ajustar filtros',
        };
      case 'search':
        return {
          icon: icon || <Search className="h-12 w-12 text-muted-foreground" />,
          title: title || 'Sin resultados de búsqueda',
          description: description || 'No encontramos resultados para tu búsqueda. Intenta con otros términos o ajusta los filtros.',
          actionText: actionText || 'Limpiar búsqueda',
        };
      case 'filter':
        return {
          icon: icon || <Filter className="h-12 w-12 text-muted-foreground" />,
          title: title || 'Sin resultados con estos filtros',
          description: description || 'Los filtros aplicados no produjeron ningún resultado. Intenta ajustarlos o limpiarlos.',
          actionText: actionText || 'Limpiar filtros',
        };
      case 'applications':
        return {
          icon: icon || <FileText className="h-12 w-12 text-muted-foreground" />,
          title: title || 'No hay aplicaciones aún',
          description: description || 'Cuando recibas aplicaciones para esta oportunidad, aparecerán aquí.',
          actionText: actionText || 'Compartir oportunidad',
        };
      case 'messages':
        return {
          icon: icon || <MessageCircle className="h-12 w-12 text-muted-foreground" />,
          title: title || 'No hay conversaciones',
          description: description || 'Inicia una conversación aplicando a oportunidades o contactando directamente con talento.',
          actionText: actionText || 'Explorar oportunidades',
        };
      case 'error':
        return {
          icon: icon || <AlertCircle className="h-12 w-12 text-destructive" />,
          title: title || 'Error al cargar',
          description: description || 'Ha ocurrido un error al cargar esta información. Intenta de nuevo.',
          actionText: actionText || 'Reintentar',
        };
      default:
        return {
          icon: icon || <Search className="h-12 w-12 text-muted-foreground" />,
          title: title || 'Sin resultados',
          description: description || 'No se encontraron resultados.',
          actionText: actionText || 'Reintentar',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
        <div className="mb-6">
          {content.icon}
        </div>
        
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3">
          {content.title}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md text-sm md:text-base">
          {content.description}
        </p>

        {(onAction || content.actionText) && (
          <Button
            variant="outline"
            onClick={onAction}
            className="transition-all duration-200 hover:scale-105"
          >
            {content.actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
