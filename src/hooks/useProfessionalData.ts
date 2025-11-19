import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProfessionalCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface Industry {
  id: string;
  name: string;
  description: string;
}

export interface ProfileSuggestions {
  suggested_skills: string[];
  suggested_bio_template: string;
  suggested_title_examples: string[];
  industry_recommendations: string[];
}

export interface CompanyDirectory {
  id: string;
  name: string;
  industry_name: string | null;
  location: string | null;
  is_claimed: boolean;
  logo_url: string | null;
}

export interface JobTitle {
  id: string;
  title: string;
  category: string | null;
  usage_count: number;
}

export const useProfessionalData = () => {
  const [categories, setCategories] = useState<ProfessionalCategory[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch professional categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.rpc('get_professional_categories');
      if (error) throw error;
      
      // Eliminar duplicados basándose en el id
      const uniqueCategories = (data || []).reduce((acc: ProfessionalCategory[], category: ProfessionalCategory) => {
        if (!acc.find(c => c.id === category.id)) {
          acc.push(category);
        }
        return acc;
      }, [] as ProfessionalCategory[]);
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to hardcoded categories if database is not available
      const fallbackCategories: ProfessionalCategory[] = [
        {
          id: 'ventas',
          name: 'Ventas',
          description: 'Especialistas en ventas, cierre de negocios y desarrollo comercial',
          icon: 'trending-up',
          subcategories: [
            { id: 'closer', name: 'Closer', description: 'Especialista en cierre de ventas y negociaciones' },
            { id: 'sdr', name: 'SDR', description: 'Desarrollo de leads y prospección comercial' },
            { id: 'account-manager', name: 'Account Manager', description: 'Gestión de cuentas y relaciones comerciales' },
            { id: 'business-development', name: 'Business Development', description: 'Desarrollo de negocios y expansión comercial' }
          ]
        },
        {
          id: 'marketing',
          name: 'Marketing',
          description: 'Expertos en marketing digital, estrategias de marca y comunicación',
          icon: 'megaphone',
          subcategories: [
            { id: 'media-buyer', name: 'Media Buyer', description: 'Especialista en compra de medios publicitarios' },
            { id: 'content-creator', name: 'Content Creator', description: 'Creador de contenido para marketing y redes sociales' },
            { id: 'social-media', name: 'Social Media Manager', description: 'Gestión de redes sociales y comunidades' },
            { id: 'seo-specialist', name: 'SEO Specialist', description: 'Especialista en optimización para motores de búsqueda' },
            { id: 'email-marketing', name: 'Email Marketing', description: 'Especialista en marketing por correo electrónico' },
            { id: 'brand-manager', name: 'Brand Manager', description: 'Gestión de marca e identidad corporativa' }
          ]
        },
        {
          id: 'creativo',
          name: 'Creativo',
          description: 'Profesionales creativos en diseño, arte y contenido visual',
          icon: 'palette',
          subcategories: [
            { id: 'disenador-grafico', name: 'Diseñador Gráfico', description: 'Diseño visual y comunicación gráfica' },
            { id: 'ui-ux-designer', name: 'UI/UX Designer', description: 'Diseño de interfaces y experiencia de usuario' },
            { id: 'video-editor', name: 'Video Editor', description: 'Edición y producción de video' },
            { id: 'fotografo', name: 'Fotógrafo', description: 'Fotografía profesional y artística' },
            { id: 'ilustrador', name: 'Ilustrador', description: 'Ilustración y arte digital' },
            { id: 'copywriter', name: 'Copywriter', description: 'Redacción creativa y publicitaria' }
          ]
        },
        {
          id: 'atencion-cliente',
          name: 'Atención al Cliente',
          description: 'Especialistas en servicio al cliente y experiencia del usuario',
          icon: 'headphones',
          subcategories: [
            { id: 'customer-success', name: 'Customer Success', description: 'Gestión del éxito del cliente y retención' },
            { id: 'support-agent', name: 'Support Agent', description: 'Agente de soporte técnico y atención' },
            { id: 'community-manager', name: 'Community Manager', description: 'Gestión de comunidades y relaciones públicas' },
            { id: 'customer-experience', name: 'Customer Experience', description: 'Especialista en experiencia del cliente' }
          ]
        },
        {
          id: 'operaciones',
          name: 'Operaciones',
          description: 'Profesionales en gestión operacional, procesos y eficiencia',
          icon: 'settings',
          subcategories: [
            { id: 'project-manager', name: 'Project Manager', description: 'Gestión de proyectos y equipos' },
            { id: 'operations-manager', name: 'Operations Manager', description: 'Gestión operacional y procesos' },
            { id: 'data-analyst', name: 'Data Analyst', description: 'Análisis de datos y business intelligence' },
            { id: 'process-improvement', name: 'Process Improvement', description: 'Mejora de procesos y eficiencia operacional' },
            { id: 'supply-chain', name: 'Supply Chain', description: 'Gestión de cadena de suministro' },
            { id: 'quality-assurance', name: 'Quality Assurance', description: 'Aseguramiento de calidad y control' }
          ]
        },
        {
          id: 'tecnologia-automatizaciones',
          name: 'Tecnología y Automatizaciones',
          description: 'Expertos en tecnología, automatización y sistemas',
          icon: 'cpu',
          subcategories: [
            { id: 'desarrollador-frontend', name: 'Desarrollador Frontend', description: 'Desarrollo de interfaces de usuario' },
            { id: 'desarrollador-backend', name: 'Desarrollador Backend', description: 'Desarrollo de servidores y APIs' },
            { id: 'devops-engineer', name: 'DevOps Engineer', description: 'Ingeniería de desarrollo y operaciones' },
            { id: 'data-engineer', name: 'Data Engineer', description: 'Ingeniería de datos y pipelines' },
            { id: 'automation-specialist', name: 'Automation Specialist', description: 'Especialista en automatización de procesos' },
            { id: 'system-administrator', name: 'System Administrator', description: 'Administración de sistemas y infraestructura' },
            { id: 'cybersecurity', name: 'Cybersecurity', description: 'Especialista en seguridad informática' }
          ]
        },
        {
          id: 'soporte-profesional',
          name: 'Soporte Profesional',
          description: 'Asistentes administrativos, contadores, abogados y otros profesionales de apoyo',
          icon: 'briefcase',
          subcategories: [
            { id: 'asistente-administrativo', name: 'Asistente Administrativo', description: 'Soporte administrativo y gestión' },
            { id: 'contador', name: 'Contador', description: 'Contabilidad y finanzas' },
            { id: 'abogado', name: 'Abogado', description: 'Servicios legales y asesoría jurídica' },
            { id: 'recursos-humanos', name: 'Recursos Humanos', description: 'Gestión de talento y RRHH' },
            { id: 'virtual-assistant', name: 'Virtual Assistant', description: 'Asistente virtual y soporte remoto' },
            { id: 'bookkeeper', name: 'Bookkeeper', description: 'Contabilidad y registro de transacciones' }
          ]
        }
      ];
      setCategories(fallbackCategories);
      console.log('Using fallback categories');
    }
  };

  // Fetch industries
  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase.rpc('get_industries');
      if (error) throw error;
      setIndustries(data || []);
    } catch (error) {
      console.error('Error fetching industries:', error);
      toast.error('Error al cargar las industrias');
    }
  };

  // Get profile suggestions based on category
  const getProfileSuggestions = useCallback(async (categoryId: string): Promise<ProfileSuggestions | null> => {
    try {
      const { data, error } = await supabase.rpc('get_profile_suggestions', {
        category_id: categoryId
      });
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting profile suggestions:', error);
      // Fallback to hardcoded suggestions
      const fallbackSuggestions: Record<string, ProfileSuggestions> = {
        'ventas': {
          suggested_title_examples: ['Especialista en Ventas', 'Closer de Ventas', 'Sales Development Representative'],
          suggested_bio_template: 'Soy un profesional especializado en ventas con experiencia sólida en el sector. Mi enfoque se centra en generar resultados y construir relaciones comerciales duraderas. Estoy comprometido con la excelencia y el crecimiento continuo.',
          suggested_skills: ['Liderazgo', 'Trabajo en equipo', 'Comunicación efectiva', 'Resolución de problemas', 'Adaptabilidad'],
          industry_recommendations: ['Tecnología', 'E-commerce', 'Servicios Financieros']
        },
        'marketing': {
          suggested_title_examples: ['Especialista en Marketing Digital', 'Media Buyer', 'Content Creator'],
          suggested_bio_template: 'Soy un profesional especializado en marketing digital con experiencia sólida en el sector. Mi enfoque se centra en crear estrategias efectivas y campañas que generen resultados. Estoy comprometido con la excelencia y el crecimiento continuo.',
          suggested_skills: ['Creatividad', 'Análisis de datos', 'Comunicación', 'Pensamiento estratégico', 'Adaptabilidad'],
          industry_recommendations: ['E-commerce', 'Tecnología', 'Entretenimiento']
        },
        'creativo': {
          suggested_title_examples: ['Diseñador Gráfico', 'UI/UX Designer', 'Video Editor'],
          suggested_bio_template: 'Soy un profesional creativo especializado en diseño con experiencia sólida en el sector. Mi enfoque se centra en crear soluciones visuales innovadoras y atractivas. Estoy comprometido con la excelencia y el crecimiento continuo.',
          suggested_skills: ['Creatividad', 'Atención al detalle', 'Comunicación visual', 'Pensamiento innovador', 'Adaptabilidad'],
          industry_recommendations: ['Publicidad', 'Entretenimiento', 'E-commerce']
        },
        'atencion-cliente': {
          suggested_title_examples: ['Especialista en Atención al Cliente', 'Customer Success Manager', 'Support Agent'],
          suggested_bio_template: 'Soy un profesional especializado en atención al cliente con experiencia sólida en el sector. Mi enfoque se centra en brindar un servicio excepcional y resolver problemas de manera efectiva. Estoy comprometido con la excelencia y el crecimiento continuo.',
          suggested_skills: ['Empatía', 'Comunicación', 'Resolución de problemas', 'Paciencia', 'Adaptabilidad'],
          industry_recommendations: ['Tecnología', 'E-commerce', 'Servicios Financieros']
        },
        'operaciones': {
          suggested_title_examples: ['Project Manager', 'Operations Manager', 'Data Analyst'],
          suggested_bio_template: 'Soy un profesional especializado en operaciones con experiencia sólida en el sector. Mi enfoque se centra en optimizar procesos y mejorar la eficiencia operacional. Estoy comprometido con la excelencia y el crecimiento continuo.',
          suggested_skills: ['Liderazgo', 'Análisis', 'Organización', 'Resolución de problemas', 'Adaptabilidad'],
          industry_recommendations: ['Tecnología', 'Manufactura', 'Servicios']
        },
        'tecnologia-automatizaciones': {
          suggested_title_examples: ['Desarrollador Full Stack', 'DevOps Engineer', 'Data Engineer'],
          suggested_bio_template: 'Soy un profesional especializado en tecnología con experiencia sólida en el sector. Mi enfoque se centra en crear soluciones tecnológicas innovadoras y automatizar procesos. Estoy comprometido con la excelencia y el crecimiento continuo.',
          suggested_skills: ['Pensamiento lógico', 'Resolución de problemas', 'Aprendizaje continuo', 'Trabajo en equipo', 'Adaptabilidad'],
          industry_recommendations: ['Tecnología', 'Fintech', 'E-commerce']
        },
        'soporte-profesional': {
          suggested_title_examples: ['Asistente Administrativo', 'Contador', 'Virtual Assistant'],
          suggested_bio_template: 'Soy un profesional especializado en soporte administrativo con experiencia sólida en el sector. Mi enfoque se centra en brindar apoyo eficiente y mantener la organización operacional. Estoy comprometido con la excelencia y el crecimiento continuo.',
          suggested_skills: ['Organización', 'Atención al detalle', 'Comunicación', 'Eficiencia', 'Adaptabilidad'],
          industry_recommendations: ['Servicios Financieros', 'Consultoría', 'Tecnología']
        }
      };
      
      return fallbackSuggestions[categoryId] || {
        suggested_title_examples: ['Profesional Especializado'],
        suggested_bio_template: 'Soy un profesional especializado con experiencia sólida en el sector. Estoy comprometido con la excelencia y el crecimiento continuo.',
        suggested_skills: ['Liderazgo', 'Trabajo en equipo', 'Comunicación efectiva', 'Resolución de problemas', 'Adaptabilidad'],
        industry_recommendations: ['Tecnología', 'Servicios', 'E-commerce']
      };
    }
  }, []);

  // Search companies in directory
  const searchCompaniesDirectory = async (searchTerm: string = ''): Promise<CompanyDirectory[]> => {
    try {
      const { data, error } = await supabase.rpc('search_companies_directory', {
        search_term: searchTerm
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching companies directory:', error);
      toast.error('Error al buscar empresas');
      return [];
    }
  };

  // Add company to directory
  const addCompanyToDirectory = async (
    companyName: string,
    industryId?: string,
    location?: string,
    website?: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('add_company_to_directory', {
        company_name: companyName,
        company_industry_id: industryId || undefined,
        company_location: location || undefined,
        company_website: website || undefined
      });
      if (error) throw error;
      toast.success('Empresa agregada al directorio');
      return data;
    } catch (error) {
      console.error('Error adding company to directory:', error);
      toast.error('Error al agregar empresa al directorio');
      return null;
    }
  };

  // Claim company from directory
  const claimCompanyFromDirectory = async (
    directoryCompanyId: string,
    userId: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('claim_company_from_directory', {
        directory_company_id: directoryCompanyId,
        user_uuid: userId
      });
      if (error) throw error;
      toast.success('Empresa reclamada exitosamente');
      return data;
    } catch (error) {
      console.error('Error claiming company:', error);
      toast.error('Error al reclamar empresa');
      return null;
    }
  };

  // Search job titles
  const searchJobTitles = async (searchTerm: string = ''): Promise<JobTitle[]> => {
    try {
      const { data, error } = await supabase.rpc('search_job_titles', {
        search_term: searchTerm
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching job titles:', error);
      toast.error('Error al buscar puestos de trabajo');
      return [];
    }
  };

  // Increment job title usage (when user selects/creates a job title)
  const incrementJobTitleUsage = async (jobTitle: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('increment_job_title_usage', {
        job_title_text: jobTitle
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error incrementing job title usage:', error);
      return null;
    }
  };

  // Update profile completeness
  const updateProfileCompleteness = async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('update_profile_completeness', {
        user_uuid: userId
      });
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error updating profile completeness:', error);
      return 0;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchIndustries()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    categories,
    industries,
    loading,
    getProfileSuggestions,
    searchCompaniesDirectory,
    addCompanyToDirectory,
    claimCompanyFromDirectory,
    searchJobTitles,
    incrementJobTitleUsage,
    updateProfileCompleteness,
    refetchCategories: fetchCategories,
    refetchIndustries: fetchIndustries
  };
};