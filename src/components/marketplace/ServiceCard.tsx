import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Eye, 
  MessageSquare, 
  ExternalLink,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { MarketplaceService } from '@/hooks/useMarketplaceServices';
import { getCategoryById } from '@/lib/marketplace-categories';

interface ServiceCardProps {
  service: MarketplaceService;
  onRequestService: (service: MarketplaceService) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onRequestService
}) => {
  const navigate = useNavigate();
  const category = getCategoryById(service.category);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(`/business-dashboard/marketplace/service/${service.id}`)}
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
              <Badge variant="outline" className="text-xs">
                {service.delivery_time}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {service.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={service.user_avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(service.user_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{service.user_name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{service.location}</span>
            </div>
          </div>
          {service.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{service.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({service.reviews_count})
              </span>
            </div>
          )}
        </div>

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

        {/* Price */}
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

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onRequestService(service);
            }}
            className="flex-1"
            size="sm"
          >
            Solicitar Servicio
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/business-dashboard/marketplace/service/${service.id}`);
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
