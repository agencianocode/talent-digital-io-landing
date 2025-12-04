/**
 * Normaliza el valor de delivery_time para mostrar valores legibles
 * Maneja tanto los valores nuevos (legibles) como los valores antiguos (técnicos)
 */
export const normalizeDeliveryTime = (deliveryTime: string): string => {
  // Si el valor ya es legible, devolverlo tal cual
  const readableValues = [
    '1-2 días',
    '3-5 días',
    '1 semana',
    '2 semanas',
    '1 mes',
    '2-3 meses',
    '3-6 meses',
    '1-2 semanas',
    'Personalizado'
  ];

  if (readableValues.includes(deliveryTime)) {
    return deliveryTime;
  }

  // Transformar valores técnicos antiguos a valores legibles
  const technicalToReadable: Record<string, string> = {
    'urgent': '1-2 semanas',
    'fast': '1 mes',
    'normal': '2-3 meses',
    'flexible': '3-6 meses'
  };

  return technicalToReadable[deliveryTime.toLowerCase()] || deliveryTime;
};

/**
 * Formatea el rango de precios de un servicio
 * Muestra un rango si los precios son diferentes, o un precio único si son iguales
 * Maneja compatibilidad con servicios antiguos que solo tienen 'price'
 */
export const formatPriceRange = (
  priceMin: number | undefined, 
  priceMax: number | undefined, 
  currency: string,
  fallbackPrice?: number
): string => {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  // Compatibilidad hacia atrás: si no hay price_min/price_max, usar price antiguo
  if ((!priceMin || !priceMax) && fallbackPrice) {
    return formatter.format(fallbackPrice);
  }

  // Si faltan los valores, retornar mensaje de error amigable
  if (!priceMin || !priceMax) {
    return 'Precio no disponible';
  }

  // Si los precios son iguales, mostrar solo uno
  if (priceMin === priceMax) {
    return formatter.format(priceMin);
  }

  // Si son diferentes, mostrar el rango
  return `${formatter.format(priceMin)} - ${formatter.format(priceMax)}`;
};

