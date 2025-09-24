// Mapeo de países a gentilicios/nacionalidades para el texto de restricción de solicitantes

export const countryNationalities: Record<string, string> = {
  // Países de habla hispana
  'Argentina': 'argentinos',
  'Bolivia': 'bolivianos',
  'Chile': 'chilenos',
  'Colombia': 'colombianos',
  'Costa Rica': 'costarricenses',
  'Cuba': 'cubanos',
  'Ecuador': 'ecuatorianos',
  'El Salvador': 'salvadoreños',
  'España': 'españoles',
  'Guatemala': 'guatemaltecos',
  'Honduras': 'hondureños',
  'México': 'mexicanos',
  'Nicaragua': 'nicaragüenses',
  'Panamá': 'panameños',
  'Paraguay': 'paraguayos',
  'Perú': 'peruanos',
  'Puerto Rico': 'puertorriqueños',
  'República Dominicana': 'dominicanos',
  'Uruguay': 'uruguayos',
  'Venezuela': 'venezolanos',
  
  // Países de habla inglesa
  'United States': 'estadounidenses',
  'Estados Unidos': 'estadounidenses',
  'Canada': 'canadienses',
  'Canadá': 'canadienses',
  'United Kingdom': 'británicos',
  'Reino Unido': 'británicos',
  'Australia': 'australianos',
  'New Zealand': 'neozelandeses',
  'Nueva Zelanda': 'neozelandeses',
  
  // Brasil
  'Brazil': 'brasileños',
  'Brasil': 'brasileños',
  
  // Otros países importantes
  'France': 'franceses',
  'Francia': 'franceses',
  'Germany': 'alemanes',
  'Alemania': 'alemanes',
  'Italy': 'italianos',
  'Italia': 'italianos',
  'Portugal': 'portugueses',
  'Netherlands': 'holandeses',
  'Países Bajos': 'holandeses',
  'Belgium': 'belgas',
  'Bélgica': 'belgas',
  'Switzerland': 'suizos',
  'Suiza': 'suizos',
  'Austria': 'austriacos',
  'Sweden': 'suecos',
  'Suecia': 'suecos',
  'Norway': 'noruegos',
  'Noruega': 'noruegos',
  'Denmark': 'daneses',
  'Dinamarca': 'daneses',
  'Finland': 'finlandeses',
  'Finlandia': 'finlandeses',
  'Russia': 'rusos',
  'Rusia': 'rusos',
  'Poland': 'polacos',
  'Polonia': 'polacos',
  'Czech Republic': 'checos',
  'República Checa': 'checos',
  'Hungary': 'húngaros',
  'Hungría': 'húngaros',
  'Romania': 'rumanos',
  'Rumania': 'rumanos',
  'Bulgaria': 'búlgaros',
  'Serbia': 'serbios',
  'Croatia': 'croatas',
  'Croacia': 'croatas',
  'Slovenia': 'eslovenos',
  'Eslovenia': 'eslovenos',
  'Slovakia': 'eslovacos',
  'Eslovaquia': 'eslovacos',
  
  // Asia
  'China': 'chinos',
  'Japan': 'japoneses',
  'Japón': 'japoneses',
  'South Korea': 'surcoreanos',
  'Corea del Sur': 'surcoreanos',
  'India': 'indios',
  'Indonesia': 'indonesios',
  'Thailand': 'tailandeses',
  'Tailandia': 'tailandeses',
  'Philippines': 'filipinos',
  'Filipinas': 'filipinos',
  'Malaysia': 'malayos',
  'Malasia': 'malayos',
  'Singapore': 'singapurenses',
  'Singapur': 'singapurenses',
  'Vietnam': 'vietnamitas',
  'Taiwan': 'taiwaneses',
  'Hong Kong': 'hongkoneses',
  
  // África
  'South Africa': 'sudafricanos',
  'Sudáfrica': 'sudafricanos',
  'Nigeria': 'nigerianos',
  'Egypt': 'egipcios',
  'Egipto': 'egipcios',
  'Morocco': 'marroquíes',
  'Marruecos': 'marroquíes',
  'Kenya': 'kenianos',
  'Ghana': 'ghaneses',
  'Ethiopia': 'etíopes',
  'Etiopía': 'etíopes',
  
  // Oceanía
  'Fiji': 'fiyianos',
  'Papua New Guinea': 'papúes',
  'Papúa Nueva Guinea': 'papúes',
};

/**
 * Capitaliza la primera letra de una cadena
 * @param str - La cadena a capitalizar
 * @returns Cadena con la primera letra en mayúscula
 */
const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Extrae el país de una ubicación completa
 * @param location - La ubicación completa (ej: "Cali, Valle del Cauca, Colombia")
 * @returns Solo el país (ej: "Colombia")
 */
const extractCountryFromLocation = (location: string): string => {
  // Si la ubicación contiene comas, el país suele ser la última parte
  const parts = location.split(',').map(part => part.trim());
  
  // Devolver la última parte (que generalmente es el país)
  const country = parts[parts.length - 1];
  return country || location; // Fallback a la ubicación original si no hay partes
};

/**
 * Genera el texto de restricción de solicitantes basado en el país de la empresa
 * @param countryLocation - La ubicación/país de la empresa
 * @returns Texto formateado para mostrar la restricción
 */
export const getApplicantRestrictionText = (countryLocation: string | undefined | null): string => {
  if (!countryLocation) {
    return 'Solo se aceptan solicitantes locales';
  }

  // Extraer solo el país de la ubicación completa
  const country = extractCountryFromLocation(countryLocation);

  // Buscar el país en el mapeo (case insensitive)
  const mappedCountry = Object.keys(countryNationalities).find(
    key => key.toLowerCase() === country.toLowerCase()
  );

  if (mappedCountry) {
    const nationality = countryNationalities[mappedCountry];
    if (nationality) {
      return `Solo se aceptan solicitantes ${capitalizeFirst(nationality)}`;
    }
  }

  // Si no se encuentra el país en el mapeo, usar el nombre del país directamente
  // y asumir que termina en -os/-as según el patrón común
  const cleanCountry = country.trim();
  let nationality = cleanCountry.toLowerCase();
  
  // Reglas básicas para generar gentilicios
  if (nationality.endsWith('a')) {
    nationality = nationality.slice(0, -1) + 'anos';
  } else if (nationality.endsWith('o')) {
    nationality = nationality.slice(0, -1) + 'anos';
  } else if (nationality.endsWith('n')) {
    nationality = nationality + 'es';
  } else if (nationality.endsWith('l')) {
    nationality = nationality + 'es';
  } else if (nationality.endsWith('s')) {
    nationality = nationality + 'es';
  } else {
    nationality = nationality + 'anos';
  }

  return `Solo se aceptan solicitantes ${capitalizeFirst(nationality)}`;
};

export default countryNationalities;
