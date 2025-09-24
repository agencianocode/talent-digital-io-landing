export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'diseno-grafico',
    name: 'Diseño Gráfico',
    description: 'Logos, branding, material gráfico',
    icon: '🎨',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'desarrollo-web',
    name: 'Desarrollo Web',
    description: 'Sitios web, aplicaciones, e-commerce',
    icon: '💻',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'marketing-digital',
    name: 'Marketing Digital',
    description: 'Redes sociales, SEO, publicidad',
    icon: '📱',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'contenido',
    name: 'Contenido',
    description: 'Copywriting, blogs, videos',
    icon: '✍️',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'consultoria',
    name: 'Consultoría',
    description: 'Estrategia, procesos, optimización',
    icon: '💡',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'traduccion',
    name: 'Traducción',
    description: 'Idiomas, localización, interpretación',
    icon: '🌍',
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'fotografia',
    name: 'Fotografía',
    description: 'Productos, eventos, retratos',
    icon: '📸',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Edición, animación, motion graphics',
    icon: '🎬',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'audio',
    name: 'Audio',
    description: 'Podcasts, música, sonido',
    icon: '🎵',
    color: 'bg-teal-100 text-teal-800'
  },
  {
    id: 'ventas',
    name: 'Ventas',
    description: 'Closers, telemarketing, CRM',
    icon: '💰',
    color: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'soporte',
    name: 'Soporte Técnico',
    description: 'Help desk, mantenimiento, soporte',
    icon: '🔧',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    id: 'otros',
    name: 'Otros',
    description: 'Servicios diversos y especializados',
    icon: '🔮',
    color: 'bg-slate-100 text-slate-800'
  }
];

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(category => category.id === id);
};

export const getCategoryColor = (id: string): string => {
  const category = getCategoryById(id);
  return category?.color || 'bg-gray-100 text-gray-800';
};
