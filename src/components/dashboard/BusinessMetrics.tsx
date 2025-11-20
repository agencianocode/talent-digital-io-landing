import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase, 
  Users, 
  MessageCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useOpportunityDashboard } from '@/hooks/useOpportunityDashboard';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

interface BusinessMetricsProps {
  useMockData?: boolean;
}

export const BusinessMetrics = ({ useMockData = false }: BusinessMetricsProps) => {
  const { metrics, isLoading } = useOpportunityDashboard(useMockData);
  const navigate = useNavigate();
  
  // Refs y estados para scroll horizontal con flechas
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Funciones de scroll suave
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };

  // Detectar si hay overflow y actualizar flechas
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;
    if (!hasOverflow) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    setShowLeftArrow(container.scrollLeft > 10);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Actualizar flechas cuando cambie el contenido o tamaño de ventana
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setTimeout(checkScrollButtons, 100);

    container.addEventListener('scroll', checkScrollButtons);
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 sm:gap-4 w-full">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="h-16 sm:h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Main Metrics */}
      <div className="relative">
        {/* Botón Izquierda - solo en pantallas pequeñas */}
        {showLeftArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 shadow-xl bg-white hover:bg-gray-50 rounded-full border-2 xl:hidden"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Flex horizontal con scroll en pantallas pequeñas, Grid en pantallas grandes */}
        <div 
          ref={scrollContainerRef}
          className="flex xl:grid xl:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto xl:overflow-x-visible pb-2"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            .overflow-x-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 flex-shrink-0 w-64 sm:w-72 xl:w-auto xl:w-auto"
            onClick={() => navigate('/business-dashboard/opportunities')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Oportunidades Activas</div>
              <div className="text-xl sm:text-2xl font-bold">{metrics.activeOpportunities}</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 flex-shrink-0 w-64 sm:w-72 xl:w-auto"
            onClick={() => navigate('/business-dashboard/applications')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">Postulaciones en Oportunidades Activas</div>
              <div className="text-xl sm:text-2xl font-bold">{metrics.applicationsInActiveOpportunities || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.unreviewedApplications || 0} sin revisar / {metrics.applicationsInActiveOpportunities || 0} totales
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 flex-shrink-0 w-64 sm:w-72 xl:w-auto"
            onClick={() => navigate('/business-dashboard/applications?filter=pending')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Candidatos en Evaluación</div>
              <div className="text-xl sm:text-2xl font-bold">{metrics.candidatesInEvaluation || 0}</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 flex-shrink-0 w-64 sm:w-72 xl:w-auto"
            onClick={() => navigate('/business-dashboard/messages')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Candidatos Contactados</div>
              <div className="text-xl sm:text-2xl font-bold">{metrics.candidatesContacted || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Botón Derecha - solo en pantallas pequeñas */}
        {showRightArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 shadow-xl bg-white hover:bg-gray-50 rounded-full border-2 xl:hidden"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

    </div>
  );
};