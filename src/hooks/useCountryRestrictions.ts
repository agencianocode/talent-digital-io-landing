// Hook para manejar restricciones de país en oportunidades

import { useMemo } from 'react';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { 
  canTalentApplyToOpportunity, 
  filterOpportunitiesForTalent, 
  getRestrictionMessage,
  extractCountryFromLocation 
} from '@/lib/country-restrictions';

/**
 * Hook para manejar restricciones de país para talentos
 */
export const useCountryRestrictions = () => {
  const { userRole, profile } = useSupabaseAuth();
  
  // Obtener la ubicación del talento desde su perfil
  const talentLocation = useMemo(() => {
    if (!isTalentRole(userRole) || !profile) {
      return null;
    }
    
    // Obtener ubicación del perfil del talento (combinar ciudad y país si están disponibles)
    if (profile.country && profile.city) {
      return `${profile.city}, ${profile.country}`;
    }
    return profile.country || null;
  }, [userRole, profile]);

  const talentCountry = useMemo(() => {
    return extractCountryFromLocation(talentLocation);
  }, [talentLocation]);

  /**
   * Verifica si el talento puede aplicar a una oportunidad específica
   */
  const canApplyToOpportunity = (opportunity: {
    country_restriction_enabled?: boolean | null;
    allowed_country?: string | null;
  }): boolean => {
    return canTalentApplyToOpportunity(opportunity, talentLocation);
  };

  /**
   * Filtra un array de oportunidades para mostrar solo las que el talento puede aplicar
   */
  const filterOpportunities = <T extends {
    country_restriction_enabled?: boolean | null;
    allowed_country?: string | null;
  }>(opportunities: T[]): T[] => {
    return filterOpportunitiesForTalent(opportunities, talentLocation);
  };

  /**
   * Obtiene el mensaje de restricción para una oportunidad
   */
  const getOpportunityRestrictionMessage = (opportunity: {
    country_restriction_enabled?: boolean | null;
    allowed_country?: string | null;
  }): string | null => {
    return getRestrictionMessage(opportunity);
  };

  /**
   * Verifica si el talento está en el mismo país que una empresa
   */
  const isInSameCountryAsCompany = (companyLocation: string | null | undefined): boolean => {
    if (!talentCountry || !companyLocation) return false;
    
    const companyCountry = extractCountryFromLocation(companyLocation);
    if (!companyCountry) return false;
    
    return talentCountry.toLowerCase() === companyCountry.toLowerCase();
  };

  return {
    talentLocation,
    talentCountry,
    isTalent: isTalentRole(userRole),
    canApplyToOpportunity,
    filterOpportunities,
    getOpportunityRestrictionMessage,
    isInSameCountryAsCompany
  };
};

export default useCountryRestrictions;
