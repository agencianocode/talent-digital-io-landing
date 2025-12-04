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

