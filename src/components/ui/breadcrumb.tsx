import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Agregar inicio
    breadcrumbs.push({
      label: 'Inicio',
      href: '/',
      icon: <Home className="h-4 w-4" />
    });

    // Construir breadcrumbs basado en la ruta
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Mapear segmentos a labels legibles
      let label = segment;
      let icon: React.ReactNode | undefined;

      switch (segment) {
        case 'business-dashboard':
          label = 'Dashboard Empresa';
          break;
        case 'talent-dashboard':
          label = 'Dashboard Talento';
          break;
        case 'opportunities':
          label = 'Oportunidades';
          break;
        case 'applications':
          label = 'Aplicaciones';
          break;
        case 'marketplace':
          label = 'Marketplace';
          break;
        case 'profile':
          label = 'Perfil';
          break;
        case 'settings':
          label = 'Configuración';
          break;
        case 'new':
          label = 'Nueva';
          break;
        case 'edit':
          label = 'Editar';
          break;
        default:
          // Si es un ID, mostrar un label genérico
          if (segment.length > 20) {
            label = 'Detalles';
          }
      }

      breadcrumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath,
        icon
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : getBreadcrumbs();

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-foreground font-medium">
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
