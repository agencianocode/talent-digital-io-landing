import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProfessionalData } from './useProfessionalData';
import { supabase } from '@/integrations/supabase/client';

export interface CompletenessBreakdown {
  basic_info: number;
  professional_info: number;
  skills_and_bio: number;
  total: number;
  missing_fields: string[];
  suggestions: string[];
}

export const useProfileCompleteness = () => {
  const { user, profile } = useSupabaseAuth();
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const { updateProfileCompleteness } = useProfessionalData();
  const [completeness, setCompleteness] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<CompletenessBreakdown>({
    basic_info: 0,
    professional_info: 0,
    skills_and_bio: 0,
    total: 0,
    missing_fields: [],
    suggestions: []
  });
  const [loading, setLoading] = useState(false);

  const calculateDetailedCompleteness = () => {
    if (!profile || !user) {
      setCompleteness(0);
      setBreakdown({
        basic_info: 0,
        professional_info: 0,
        skills_and_bio: 0,
        total: 0,
        missing_fields: ['Perfil no encontrado'],
        suggestions: ['Completa tu perfil básico para comenzar']
      });
      return;
    }

    let basicInfo = 0;
    let professionalInfo = 0;
    let skillsAndBio = 0;
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    // Basic Info (40% total)
    if (profile.full_name) {
      basicInfo += 10;
    } else {
      missingFields.push('Nombre completo');
      suggestions.push('Agrega tu nombre completo para que otros puedan encontrarte');
    }

    if (profile.avatar_url) {
      basicInfo += 5;
    } else {
      missingFields.push('Foto de perfil');
      suggestions.push('Sube una foto profesional para mejorar tu perfil');
    }

    if (profile.phone) {
      basicInfo += 5;
    } else {
      missingFields.push('Teléfono');
      suggestions.push('Agrega tu número de teléfono para contacto directo');
    }

    const profileData = profile as any;
    if (profileData?.country) {
      basicInfo += 5;
    } else {
      missingFields.push('País');
      suggestions.push('Indica tu ubicación para oportunidades locales');
    }

    if (profileData?.city) {
      basicInfo += 5;
    } else {
      missingFields.push('Ciudad');
      suggestions.push('Especifica tu ciudad para oportunidades cercanas');
    }

    if (profileData?.social_links && Object.keys(profileData.social_links || {}).length > 0) {
      basicInfo += 10;
    } else {
      missingFields.push('Redes sociales');
      suggestions.push('Conecta tus redes profesionales como LinkedIn');
    }

    // Professional Info (35% total)
    if (talentProfile) {
      if (talentProfile.primary_category_id) {
        professionalInfo += 15;
      } else {
        missingFields.push('Categoría profesional');
        suggestions.push('Selecciona tu área de especialización principal');
      }

      if (talentProfile.title) {
        professionalInfo += 10;
      } else {
        missingFields.push('Título profesional');
        suggestions.push('Define un título que represente tu rol actual');
      }

      if (talentProfile.experience_level) {
        professionalInfo += 10;
      } else {
        missingFields.push('Nivel de experiencia');
        suggestions.push('Indica tu nivel de experiencia profesional');
      }
    } else {
      missingFields.push('Perfil de talento');
      suggestions.push('Completa tu perfil profesional para mostrar tus habilidades');
    }

    // Skills and Bio (25% total)
    if (talentProfile) {
      if (talentProfile.bio) {
        skillsAndBio += 10;
      } else {
        missingFields.push('Biografía profesional');
        suggestions.push('Escribe una descripción atractiva de tu experiencia');
      }

      if (talentProfile.skills && talentProfile.skills.length > 0) {
        skillsAndBio += 10;
      } else {
        missingFields.push('Habilidades');
        suggestions.push('Lista las habilidades que te destacan');
      }

      if (talentProfile.industries_of_interest && talentProfile.industries_of_interest.length > 0) {
        skillsAndBio += 5;
      } else {
        missingFields.push('Industrias de interés');
        suggestions.push('Selecciona las industrias donde quieres trabajar');
      }
    }

    const total = Math.min(basicInfo + professionalInfo + skillsAndBio, 100);

    setBreakdown({
      basic_info: basicInfo,
      professional_info: professionalInfo,
      skills_and_bio: skillsAndBio,
      total,
      missing_fields: missingFields,
      suggestions
    });

    setCompleteness(total);
  };

  const refreshCompleteness = async () => {
    if (!user?.id) {
      console.warn('Cannot refresh completeness: user ID not available');
      return;
    }
    
    setLoading(true);
    try {
      const score = await updateProfileCompleteness(user.id);
      setCompleteness(score || 0);
      calculateDetailedCompleteness();
    } catch (error) {
      console.error('Error refreshing completeness:', error);
      // Set default values on error
      setCompleteness(0);
      setBreakdown({
        basic_info: 0,
        professional_info: 0,
        skills_and_bio: 0,
        total: 0,
        missing_fields: ['Error al cargar datos'],
        suggestions: ['Intenta recargar la página']
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch talent profile
  useEffect(() => {
    const fetchTalentProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setTalentProfile(data);
      } catch (error) {
        console.error('Error fetching talent profile:', error);
      }
    };

    fetchTalentProfile();
  }, [user?.id]);

  useEffect(() => {
    calculateDetailedCompleteness();
  }, [profile, talentProfile, user]);

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCompletenessLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy bueno';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Incompleto';
  };

  return {
    completeness,
    breakdown,
    loading,
    refreshCompleteness,
    getCompletenessColor,
    getCompletenessLabel
  };
};