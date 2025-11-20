import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  Play,
  Pause,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { TalentService, ServiceRequest } from '@/hooks/useTalentServices';
import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories';
import ServiceRequestsSection from './ServiceRequestsSection';

interface TalentServiceCardProps {
  service: TalentService;
  serviceRequests?: ServiceRequest[];
  onEdit: (service: TalentService) => void;
  onDelete: (service: TalentService) => void;
  onDuplicate: (service: TalentService) => void;
  onToggleStatus: (service: TalentService) => void;
  onViewPortfolio?: (service: TalentService) => void;
  onUpdateRequestStatus?: (requestId: string, status: ServiceRequest['status']) => Promise<boolean>;
  isUpdatingRequest?: boolean;
}

const TalentServiceCard: React.FC<TalentServiceCardProps> = ({
  service,
  serviceRequests = [],
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onViewPortfolio,
  onUpdateRequestStatus,
  isUpdatingRequest = false
}) => {
  const navigate = useNavigate();
  const { categories: marketplaceCategories } = useMarketplaceCategories();
  const category = marketplaceCategories.find((cat) => cat.name === service.category);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          label: 'Activo', 
          color: 'bg-green-100 text-green-800',
          icon: Play
        };
      case 'paused':
        return { 
          label: 'Pausado', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: Pause
        };
      case 'draft':
        return { 
          label: 'Borrador', 
          color: 'bg-gray-100 text-gray-800',
          icon: Clock
        };
      case 'sold':
        return { 
          label: 'Vendido', 
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle
        };
      default:
        return { 
          label: 'Desconocido', 
          color: 'bg-gray-100 text-gray-800',
          icon: Clock
        };
    }
  };

  const statusInfo = getStatusInfo(service.status);
  const StatusIcon = statusInfo.icon;

  const handleCardClick = (e: React.MouseEvent) => {
    // No navegar si se hace clic en el dropdown menu o botones
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]')) {
      return;
    }
    
    // Navegar a la página de detalle del servicio
    const userRole = window.location.pathname.includes('business-dashboard') 
      ? 'business' 
      : 'talent';
    const basePath = userRole === 'business' ? '/business-dashboard' : '/talent-dashboard';
    navigate(`${basePath}/my-services/${service.id}`);
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {category && (
                <Badge variant="secondary">
                  {category.name}
                </Badge>
              )}
              <Badge className={statusInfo.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
              {service.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(service)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onToggleStatus(service)}
                className={service.status === 'active' ? 'text-yellow-600' : 'text-green-600'}
              >
                {service.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              {service.portfolio_url && (
                <DropdownMenuItem onClick={() => onViewPortfolio?.(service)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Portfolio
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(service)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Tags */}
        {service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {service.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {service.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{service.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{service.views_count} vistas</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{service.requests_count} solicitudes</span>
          </div>
        </div>

        {/* Price and Delivery */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">
              {formatPrice(service.price, service.currency)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{service.delivery_time}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <MapPin className="h-3 w-3" />
          <span>{service.location}</span>
        </div>

        {/* Availability Status */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t">
          <div className="flex items-center gap-2">
            {service.is_available ? (
              <>
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Disponible</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No disponible</span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(service.updated_at).toLocaleDateString('es-ES')}
          </div>
        </div>

        {/* Service Requests Section */}
        {onUpdateRequestStatus && (
          <ServiceRequestsSection
            serviceId={service.id}
            serviceTitle={service.title}
            requests={serviceRequests}
            onUpdateStatus={onUpdateRequestStatus}
            isUpdating={isUpdatingRequest}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TalentServiceCard;
