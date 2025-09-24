// Componente para mostrar alertas de restricción de país

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle } from 'lucide-react';
import { getRestrictionMessage } from '@/lib/country-restrictions';

interface CountryRestrictionAlertProps {
  opportunity: {
    country_restriction_enabled?: boolean | null;
    allowed_country?: string | null;
  };
  className?: string;
}

/**
 * Componente para mostrar una alerta de restricción de país
 */
const CountryRestrictionAlert: React.FC<CountryRestrictionAlertProps> = ({
  opportunity,
  className = ""
}) => {
  const restrictionMessage = getRestrictionMessage(opportunity);

  // Si no hay restricción, no mostrar nada
  if (!restrictionMessage) {
    return null;
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {restrictionMessage}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Componente compacto para mostrar en cards de oportunidades
 */
export const CompactCountryRestrictionAlert: React.FC<CountryRestrictionAlertProps> = ({
  opportunity,
  className = ""
}) => {
  const restrictionMessage = getRestrictionMessage(opportunity);

  if (!restrictionMessage) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded ${className}`}>
      <MapPin className="h-3 w-3" />
      Solo candidatos de {opportunity.allowed_country}
    </div>
  );
};

export default CountryRestrictionAlert;
