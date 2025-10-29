export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
}

// Using the same categories as opportunities for consistency
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'ventas', name: 'Ventas', description: 'Closers, telemarketing, CRM' },
  { id: 'marketing', name: 'Marketing', description: 'Digital, redes sociales, SEO, publicidad' },
  { id: 'creativo', name: 'Creativo', description: 'Diseño, contenido, video, audio' },
  { id: 'atencion-cliente', name: 'Atención al Cliente', description: 'Soporte, help desk, servicio' },
  { id: 'desarrollo', name: 'Desarrollo', description: 'Web, apps, software' },
  { id: 'datos', name: 'Datos y Análisis', description: 'Análisis, BI, data science' },
  { id: 'diseno', name: 'Diseño', description: 'Gráfico, UX/UI, branding' },
  { id: 'contenido', name: 'Contenido', description: 'Copywriting, blogs, redes' },
  { id: 'traduccion', name: 'Traducción', description: 'Idiomas, localización' },
  { id: 'consultoria', name: 'Consultoría', description: 'Estrategia, procesos, optimización' },
  { id: 'video-fotografia', name: 'Video y Fotografía', description: 'Producción, edición, fotografía' },
  { id: 'audio', name: 'Audio', description: 'Podcasts, música, sonido' },
  { id: 'soporte-tecnico', name: 'Soporte Técnico', description: 'IT, mantenimiento, infraestructura' },
  { id: 'otros', name: 'Otros', description: 'Servicios diversos y especializados' }
];

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(category => category.id === id);
};
