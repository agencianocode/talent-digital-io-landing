// Hook para verificar acceso de talentos a oportunidades específicas

import { useMemo } from 'react';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { canTalentApplyToOpportunity, getRestrictionMessage } from '@/lib/country-restrictions';

interface Opportunity {
  country_restriction_enabled?: boolean | null;
  allowed_country?: string | null;
}

/**
 * Hook para verificar si un talento puede acceder/aplicar a una oportunidad
 */
export const useOpportunityAccess = (opportunity: Opportunity) => {
  const { userRole, profile } = useSupabaseAuth();

  // Obtener la ubicación del talento
  const talentLocation = useMemo(() => {
    if (!isTalentRole(userRole) || !profile) {
      return null;
    }
    
    if (profile.country && profile.city) {
      return `${profile.city}, ${profile.country}`;
    }
    return profile.country || null;
  }, [userRole, profile]);

  // Verificar si puede aplicar
  const canApply = useMemo(() => {
    return canTalentApplyToOpportunity(opportunity, talentLocation);
  }, [opportunity, talentLocation]);

  // Obtener mensaje de restricción
  const restrictionMessage = useMemo(() => {
    return getRestrictionMessage(opportunity);
  }, [opportunity]);

  // Verificar si es un talento autenticado
  const isTalent = isTalentRole(userRole);

  return {
    canApply,
    restrictionMessage,
    isTalent,
    talentLocation,
    hasRestriction: opportunity.country_restriction_enabled && opportunity.allowed_country,
    allowedCountry: opportunity.allowed_country
  };
};

export default useOpportunityAccess;
