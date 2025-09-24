// Componente para mostrar restricciones de país en oportunidades

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe } from 'lucide-react';

interface CountryRestrictionBadgeProps {
  countryRestrictionEnabled?: boolean | null;
  allowedCountry?: string | null;
  className?: string;
}

/**
 * Componente para mostrar un badge de restricción de país
 */
const CountryRestrictionBadge: React.FC<CountryRestrictionBadgeProps> = ({
  countryRestrictionEnabled,
  allowedCountry,
  className = ""
}) => {
  // Si no hay restricción habilitada, no mostrar nada
  if (!countryRestrictionEnabled || !allowedCountry) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200 ${className}`}
    >
      <MapPin className="h-3 w-3" />
      Solo {allowedCountry}
    </Badge>
  );
};

/**
 * Componente para mostrar un indicador de oportunidad global (sin restricciones)
 */
export const GlobalOpportunityBadge: React.FC<{className?: string}> = ({ className = "" }) => {
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 text-green-700 border-green-300 ${className}`}
    >
      <Globe className="h-3 w-3" />
      Global
    </Badge>
  );
};

/**
 * Componente que decide automáticamente qué badge mostrar
 */
export const OpportunityLocationBadge: React.FC<CountryRestrictionBadgeProps> = (props) => {
  if (props.countryRestrictionEnabled && props.allowedCountry) {
    return <CountryRestrictionBadge {...props} />;
  }
  
  return <GlobalOpportunityBadge className={props.className} />;
};

export default CountryRestrictionBadge;
