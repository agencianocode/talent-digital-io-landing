// Utilidades para manejar restricciones de país en oportunidades

/**
 * Extrae el país de una ubicación completa
 * @param location - La ubicación completa (ej: "Bogotá, Cundinamarca, Colombia")
 * @returns Solo el país (ej: "Colombia")
 */
export const extractCountryFromLocation = (location: string | null | undefined): string | null => {
  if (!location) return null;
  
  // Si la ubicación contiene comas, el país suele ser la última parte
  const parts = location.split(',').map(part => part.trim());
  
  // Devolver la última parte (que generalmente es el país)
  const country = parts[parts.length - 1];
  return country || null;
};

/**
 * Verifica si dos países son el mismo (comparación case-insensitive)
 * @param country1 - Primer país para comparar
 * @param country2 - Segundo país para comparar
 * @returns true si son el mismo país
 */
export const isSameCountry = (country1: string | null | undefined, country2: string | null | undefined): boolean => {
  if (!country1 || !country2) return false;
  return country1.toLowerCase().trim() === country2.toLowerCase().trim();
};

/**
 * Verifica si un talento puede aplicar a una oportunidad basándose en restricciones de país
 * @param opportunity - La oportunidad a verificar
 * @param talentLocation - La ubicación del talento
 * @returns true si el talento puede aplicar, false si está restringido
 */
export const canTalentApplyToOpportunity = (
  opportunity: {
    country_restriction_enabled?: boolean | null;
    allowed_country?: string | null;
  },
  talentLocation: string | null | undefined
): boolean => {
  // Si no hay restricción habilitada, cualquiera puede aplicar
  if (!opportunity.country_restriction_enabled) {
    return true;
  }

  // Si hay restricción pero no se especifica país permitido, cualquiera puede aplicar
  if (!opportunity.allowed_country) {
    return true;
  }

  // Si el talento no tiene ubicación, no puede aplicar a oportunidades restringidas
  if (!talentLocation) {
    return false;
  }

  // Extraer países de ambas ubicaciones
  const talentCountry = extractCountryFromLocation(talentLocation);
  const allowedCountry = opportunity.allowed_country;

  // Comparar países
  return isSameCountry(talentCountry, allowedCountry);
};

/**
 * Filtra oportunidades basándose en la ubicación del talento
 * @param opportunities - Array de oportunidades
 * @param talentLocation - Ubicación del talento
 * @returns Oportunidades filtradas que el talento puede aplicar
 */
export const filterOpportunitiesForTalent = <T extends {
  country_restriction_enabled?: boolean | null;
  allowed_country?: string | null;
}>(
  opportunities: T[],
  talentLocation: string | null | undefined
): T[] => {
  return opportunities.filter(opportunity => 
    canTalentApplyToOpportunity(opportunity, talentLocation)
  );
};

/**
 * Obtiene el mensaje de restricción para mostrar al talento
 * @param opportunity - La oportunidad
 * @returns Mensaje de restricción o null si no hay restricción
 */
export const getRestrictionMessage = (opportunity: {
  country_restriction_enabled?: boolean | null;
  allowed_country?: string | null;
}): string | null => {
  if (!opportunity.country_restriction_enabled || !opportunity.allowed_country) {
    return null;
  }

  return `Esta oportunidad está disponible solo para candidatos de ${opportunity.allowed_country}`;
};

export default {
  extractCountryFromLocation,
  isSameCountry,
  canTalentApplyToOpportunity,
  filterOpportunitiesForTalent,
  getRestrictionMessage
};
