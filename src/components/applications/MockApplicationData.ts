// Mock data para postulaciones y candidatos
export interface MockApplication {
  id: string;
  opportunity_id: string;
  talent_id: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'interviewed' | 'hired' | 'rejected';
  rating: number; // 1-5 estrellas
  cover_letter: string;
  salary_expectation?: number;
  availability: string;
  created_at: string;
  updated_at: string;
  // Información del talento (join simulado)
  talent: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    title: string;
    experience_level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
    location: string;
    country: string;
    skills: string[];
    bio: string;
    profile_image?: string;
    has_video: boolean;
    has_portfolio: boolean;
    linkedin_url?: string;
    portfolio_url?: string;
  };
  // Respuestas a preguntas específicas
  application_answers: {
    question: string;
    answer: string;
  }[];
}

export const mockApplicationsData: MockApplication[] = [
  {
    id: 'app-1',
    opportunity_id: '1', // Developer Full Stack
    talent_id: 'talent-1',
    status: 'pending',
    rating: 0,
    cover_letter: 'Estimado equipo, me emociona la oportunidad de unirme como Developer Full Stack. Con 5 años de experiencia en React y Node.js, he desarrollado aplicaciones escalables que impactan positivamente a miles de usuarios. Mi pasión por las tecnologías modernas y metodologías ágiles me convierte en el candidato ideal para este rol.',
    salary_expectation: 4000,
    availability: 'Inmediata',
    created_at: '2025-01-28T10:30:00Z',
    updated_at: '2025-01-28T10:30:00Z',
    talent: {
      id: 'talent-1',
      full_name: 'Carlos Mendoza',
      email: 'carlos.mendoza@email.com',
      phone: '+34 612 345 678',
      title: 'Senior Full Stack Developer',
      experience_level: 'Avanzado',
      location: 'Madrid, España',
      country: 'España',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
      bio: 'Desarrollador full stack con 5+ años creando aplicaciones web modernas. Especializado en React, Node.js y arquitecturas cloud.',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      has_video: true,
      has_portfolio: true,
      linkedin_url: 'https://linkedin.com/in/carlosmendoza',
      portfolio_url: 'https://carlosmendoza.dev'
    },
    application_answers: [
      {
        question: '¿Cuál es tu experiencia con React?',
        answer: '5 años desarrollando con React, desde versiones con clases hasta hooks modernos. He trabajado con Redux, Context API y React Query para gestión de estado.'
      },
      {
        question: '¿Tienes experiencia con metodologías ágiles?',
        answer: 'Sí, he trabajado con Scrum durante 3 años como desarrollador senior y líder técnico en equipos de 6-8 personas.'
      }
    ]
  },
  {
    id: 'app-2',
    opportunity_id: '1', // Developer Full Stack
    talent_id: 'talent-2',
    status: 'reviewed',
    rating: 4,
    cover_letter: 'Hola! Soy desarrolladora con 3 años de experiencia en tecnologías web modernas. Me apasiona crear interfaces de usuario intuitivas y APIs robustas. Estoy buscando un equipo donde pueda crecer profesionalmente mientras aporto mi experiencia en desarrollo full stack.',
    salary_expectation: 3200,
    availability: '2 semanas',
    created_at: '2025-01-27T14:15:00Z',
    updated_at: '2025-01-28T09:20:00Z',
    talent: {
      id: 'talent-2',
      full_name: 'Ana García',
      email: 'ana.garcia@email.com',
      phone: '+52 55 1234 5678',
      title: 'Full Stack Developer',
      experience_level: 'Intermedio',
      location: 'Ciudad de México, México',
      country: 'México',
      skills: ['React', 'Node.js', 'JavaScript', 'MySQL', 'Git', 'REST APIs'],
      bio: 'Desarrolladora apasionada por crear soluciones web eficientes. Me enfoco en escribir código limpio y mantenible.',
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b898?w=150&h=150&fit=crop&crop=face',
      has_video: false,
      has_portfolio: true,
      linkedin_url: 'https://linkedin.com/in/anagarcia',
      portfolio_url: 'https://anagarcia.portfolio.com'
    },
    application_answers: [
      {
        question: '¿Cuál es tu experiencia con React?',
        answer: '3 años trabajando con React. He desarrollado SPAs complejas y tengo experiencia con hooks, context y testing con Jest.'
      },
      {
        question: '¿Tienes experiencia con metodologías ágiles?',
        answer: 'He trabajado con metodología Scrum en mis últimos 2 proyectos, participando activamente en dailys y retrospectivas.'
      }
    ]
  },
  {
    id: 'app-3',
    opportunity_id: '2', // Marketing Digital
    talent_id: 'talent-3',
    status: 'contacted',
    rating: 5,
    cover_letter: 'Estimados, como especialista en marketing digital con 4 años de experiencia, he liderado campañas que aumentaron el ROI en un 300%. Mi experiencia abarca desde SEO hasta paid advertising, y estoy emocionado por la posibilidad de trabajar en modalidad remota con su equipo.',
    salary_expectation: 2500,
    availability: 'Inmediata',
    created_at: '2025-01-26T16:45:00Z',
    updated_at: '2025-01-28T11:30:00Z',
    talent: {
      id: 'talent-3',
      full_name: 'Diego Rodríguez',
      email: 'diego.rodriguez@email.com',
      phone: '+54 11 2345 6789',
      title: 'Especialista en Marketing Digital',
      experience_level: 'Avanzado',
      location: 'Buenos Aires, Argentina',
      country: 'Argentina',
      skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Analytics', 'Content Marketing', 'Email Marketing'],
      bio: 'Especialista en marketing digital con enfoque en performance. Experto en optimización de campañas y análisis de datos.',
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      has_video: true,
      has_portfolio: false,
      linkedin_url: 'https://linkedin.com/in/diegorodriguez'
    },
    application_answers: [
      {
        question: '¿Cuál es tu experiencia con Google Ads?',
        answer: '4 años gestionando cuentas con presupuestos de hasta $50k/mes. Certificado en Google Ads y especializado en campañas de búsqueda y display.'
      },
      {
        question: '¿Tienes experiencia trabajando remotamente?',
        answer: 'Sí, los últimos 2 años he trabajado 100% remoto, gestionando equipos distribuidos y utilizando herramientas como Slack, Asana y Google Workspace.'
      }
    ]
  },
  {
    id: 'app-4',
    opportunity_id: '3', // Diseñador UX/UI
    talent_id: 'talent-4',
    status: 'interviewed',
    rating: 4,
    cover_letter: 'Hola equipo! Soy diseñadora UX/UI con 2 años de experiencia creando experiencias digitales centradas en el usuario. Me motiva resolver problemas complejos a través del diseño y crear interfaces que realmente mejoren la vida de las personas.',
    salary_expectation: 2000,
    availability: '1 mes',
    created_at: '2025-01-25T12:20:00Z',
    updated_at: '2025-01-28T15:45:00Z',
    talent: {
      id: 'talent-4',
      full_name: 'Sofía Martínez',
      email: 'sofia.martinez@email.com',
      phone: '+57 300 123 4567',
      title: 'UX/UI Designer',
      experience_level: 'Intermedio',
      location: 'Bogotá, Colombia',
      country: 'Colombia',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'],
      bio: 'Diseñadora UX/UI enfocada en crear experiencias memorables. Combino investigación de usuarios con diseño visual para resolver problemas reales.',
      profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      has_video: true,
      has_portfolio: true,
      linkedin_url: 'https://linkedin.com/in/sofiamartinez',
      portfolio_url: 'https://sofiamartinez.design'
    },
    application_answers: [
      {
        question: '¿Cuál es tu proceso de diseño?',
        answer: 'Sigo un proceso centrado en el usuario: investigación, definición de personas, wireframes, prototyping, testing y iteración basada en feedback.'
      },
      {
        question: '¿Tienes experiencia con design systems?',
        answer: 'Sí, he creado y mantenido design systems para 2 productos, asegurando consistencia visual y eficiencia en el desarrollo.'
      }
    ]
  },
  {
    id: 'app-5',
    opportunity_id: '4', // Consultor Ventas B2B
    talent_id: 'talent-5',
    status: 'rejected',
    rating: 2,
    cover_letter: 'Estimados, tengo experiencia en ventas retail y me gustaría hacer la transición a ventas B2B. Aunque no tengo experiencia directa, estoy muy motivado para aprender y aportar mi energía y dedicación al equipo.',
    salary_expectation: 1500,
    availability: 'Inmediata',
    created_at: '2025-01-24T09:30:00Z',
    updated_at: '2025-01-27T14:20:00Z',
    talent: {
      id: 'talent-5',
      full_name: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      phone: '+51 987 654 321',
      title: 'Ejecutivo de Ventas',
      experience_level: 'Principiante',
      location: 'Lima, Perú',
      country: 'Perú',
      skills: ['Atención al Cliente', 'Ventas', 'Comunicación', 'CRM Básico'],
      bio: 'Profesional en ventas con experiencia en retail, buscando crecer en el área de ventas B2B. Altamente motivado y con ganas de aprender.',
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      has_video: false,
      has_portfolio: false,
      linkedin_url: 'https://linkedin.com/in/robertosilva'
    },
    application_answers: [
      {
        question: '¿Cuál es tu experiencia en ventas B2B?',
        answer: 'No tengo experiencia directa en B2B, pero en retail he desarrollado habilidades de negociación y manejo de objeciones que creo son transferibles.'
      },
      {
        question: '¿Tienes experiencia con CRM?',
        answer: 'He usado sistemas básicos de punto de venta, pero estoy dispuesto a aprender cualquier CRM que utilicen.'
      }
    ]
  },
  {
    id: 'app-6',
    opportunity_id: '5', // Content Manager
    talent_id: 'talent-6',
    status: 'hired',
    rating: 5,
    cover_letter: 'Hola! Como content manager con 3 años de experiencia, he desarrollado estrategias de contenido que incrementaron el engagement en un 250%. Mi especialidad es crear narrativas que conecten emocionalmente con las audiencias mientras cumplen objetivos de negocio.',
    salary_expectation: 1800,
    availability: 'Inmediata',
    created_at: '2025-01-23T08:15:00Z',
    updated_at: '2025-01-28T16:00:00Z',
    talent: {
      id: 'talent-6',
      full_name: 'Valentina López',
      email: 'valentina.lopez@email.com',
      phone: '+56 9 8765 4321',
      title: 'Content Marketing Manager',
      experience_level: 'Intermedio',
      location: 'Santiago, Chile',
      country: 'Chile',
      skills: ['Content Strategy', 'Copywriting', 'Social Media', 'SEO', 'WordPress', 'Canva'],
      bio: 'Content manager especializada en storytelling digital. Creo contenido que educa, entretiene y convierte, siempre con foco en el ROI.',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      has_video: true,
      has_portfolio: true,
      linkedin_url: 'https://linkedin.com/in/valentinalopez',
      portfolio_url: 'https://valentinalopez.com'
    },
    application_answers: [
      {
        question: '¿Cuál es tu experiencia con SEO?',
        answer: '3 años optimizando contenido para SEO. He logrado posicionar artículos en top 3 de Google para keywords competitivas, aumentando el tráfico orgánico en 180%.'
      },
      {
        question: '¿Tienes experiencia gestionando múltiples canales?',
        answer: 'Sí, he gestionado estrategias integradas para blog, redes sociales, email marketing y YouTube, manteniendo coherencia en el mensaje de marca.'
      }
    ]
  }
];

// Funciones utilitarias
export const getApplicationsByOpportunity = (opportunityId: string): MockApplication[] => {
  return mockApplicationsData.filter(app => app.opportunity_id === opportunityId);
};

export const getApplicationById = (applicationId: string): MockApplication | undefined => {
  return mockApplicationsData.find(app => app.id === applicationId);
};

export const getApplicationStats = (opportunityId: string) => {
  const applications = getApplicationsByOpportunity(opportunityId);
  
  return {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    contacted: applications.filter(app => app.status === 'contacted').length,
    interviewed: applications.filter(app => app.status === 'interviewed').length,
    hired: applications.filter(app => app.status === 'hired').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    averageRating: applications.filter(app => app.rating > 0).reduce((acc, app) => acc + app.rating, 0) / applications.filter(app => app.rating > 0).length || 0
  };
};

export const updateApplicationStatus = (applicationId: string, newStatus: MockApplication['status']): MockApplication | null => {
  const appIndex = mockApplicationsData.findIndex(app => app.id === applicationId);
  if (appIndex !== -1) {
    const app = mockApplicationsData[appIndex];
    if (app) {
      app.status = newStatus;
      app.updated_at = new Date().toISOString();
      return app;
    }
  }
  return null;
};

export const updateApplicationRating = (applicationId: string, rating: number): MockApplication | null => {
  const appIndex = mockApplicationsData.findIndex(app => app.id === applicationId);
  if (appIndex !== -1) {
    const app = mockApplicationsData[appIndex];
    if (app) {
      app.rating = Math.max(0, Math.min(5, rating));
      app.updated_at = new Date().toISOString();
      return app;
    }
  }
  return null;
};
