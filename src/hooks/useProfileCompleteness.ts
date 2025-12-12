import { useState, useEffect, useMemo } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
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
  const [hasEducation, setHasEducation] = useState(false);
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

  // Verificar avatar desde ambas fuentes
  const hasAvatar = useMemo(() => {
    const profileAvatar = profile?.avatar_url;
    const metadataAvatar = user?.user_metadata?.avatar_url;
    return !!(profileAvatar || metadataAvatar);
  }, [profile?.avatar_url, user?.user_metadata?.avatar_url]);

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

    let total = 0;
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    // === CRITERIOS DE COMPLETITUD (11 campos = 100%) ===
    
    // 1. Foto de perfil (10%)
    if (hasAvatar) {
      total += 10;
    } else {
      missingFields.push('Foto de perfil');
      suggestions.push('Sube una foto profesional para mejorar tu perfil');
    }

    // 2. Nombre completo (10%)
    if (profile.full_name) {
      total += 10;
    } else {
      missingFields.push('Nombre completo');
      suggestions.push('Agrega tu nombre completo para que otros puedan encontrarte');
    }

    const profileData = profile as any;

    // 3. País (5%)
    if (profileData?.country) {
      total += 5;
    } else {
      missingFields.push('País');
      suggestions.push('Indica tu país para oportunidades locales');
    }

    // 4. Ciudad (5%)
    if (profileData?.city) {
      total += 5;
    } else {
      missingFields.push('Ciudad');
      suggestions.push('Especifica tu ciudad para oportunidades cercanas');
    }

    // Campos del talent_profile
    if (talentProfile) {
      // 5. Categoría principal (10%)
      if (talentProfile.primary_category_id) {
        total += 10;
      } else {
        missingFields.push('Categoría principal');
        suggestions.push('Selecciona tu área de especialización principal');
      }

      // 6. Título profesional (10%)
      if (talentProfile.title) {
        total += 10;
      } else {
        missingFields.push('Título profesional');
        suggestions.push('Define un título que represente tu rol actual');
      }

      // 7. Nivel de experiencia (10%)
      if (talentProfile.experience_level) {
        total += 10;
      } else {
        missingFields.push('Nivel de experiencia');
        suggestions.push('Indica tu nivel de experiencia profesional');
      }

      // 8. Skills - mínimo 3 (20%)
      if (talentProfile.skills && talentProfile.skills.length >= 3) {
        total += 20;
      } else {
        missingFields.push('Habilidades (mínimo 3)');
        suggestions.push('Agrega al menos 3 habilidades que te destacan');
      }

      // 9. Bio/descripción - mínimo 50 caracteres (15%)
      if (talentProfile.bio && talentProfile.bio.length >= 50) {
        total += 15;
      } else {
        missingFields.push('Biografía (mínimo 50 caracteres)');
        suggestions.push('Escribe una descripción atractiva de tu experiencia');
      }
    } else {
      missingFields.push('Perfil de talento');
      suggestions.push('Completa tu perfil profesional para mostrar tus habilidades');
    }

    // 11. Educación - al menos 1 registro (5%)
    if (hasEducation) {
      total += 5;
    } else {
      missingFields.push('Formación académica');
      suggestions.push('Agrega al menos un estudio o certificación');
    }

    // Calcular porcentajes por sección para el breakdown
    // Basic info: foto + nombre + país + ciudad = 30%
    let basicInfoScore = 0;
    if (hasAvatar) basicInfoScore += 33;
    if (profile.full_name) basicInfoScore += 34;
    if (profileData?.country) basicInfoScore += 16;
    if (profileData?.city) basicInfoScore += 17;

    // Professional info: categoría principal + título + nivel = 30%
    let professionalInfoScore = 0;
    if (talentProfile?.primary_category_id) professionalInfoScore += 34;
    if (talentProfile?.title) professionalInfoScore += 33;
    if (talentProfile?.experience_level) professionalInfoScore += 33;

    // Skills and bio: skills + bio + educación = 30%
    let skillsAndBioScore = 0;
    if (talentProfile?.skills && talentProfile.skills.length >= 3) skillsAndBioScore += 50;
    if (talentProfile?.bio && talentProfile.bio.length >= 50) skillsAndBioScore += 33;
    if (hasEducation) skillsAndBioScore += 17;

    setBreakdown({
      basic_info: Math.min(basicInfoScore, 100),
      professional_info: Math.min(professionalInfoScore, 100),
      skills_and_bio: Math.min(skillsAndBioScore, 100),
      total: Math.min(total, 100),
      missing_fields: missingFields,
      suggestions
    });

    setCompleteness(Math.min(total, 100));
  };

  const refreshCompleteness = async () => {
    if (!user?.id) {
      console.warn('Cannot refresh completeness: user ID not available');
      return;
    }
    
    setLoading(true);
    try {
      // Re-fetch talent profile data
      const { data: freshTalentProfile } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (freshTalentProfile) {
        setTalentProfile(freshTalentProfile);
      }

      // Re-fetch education
      const { data: educationData } = await supabase
        .from('talent_education')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      setHasEducation(!!(educationData && educationData.length > 0));
      
      // Force recalculation after state update
      setTimeout(() => {
        calculateDetailedCompleteness();
      }, 100);
      
    } catch (error) {
      console.error('Error refreshing completeness:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch talent profile
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const [talentResult, educationResult] = await Promise.all([
          supabase
            .from('talent_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('talent_education')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
        ]);

        if (talentResult.data) {
          setTalentProfile(talentResult.data);
        }
        
        setHasEducation(!!(educationResult.data && educationResult.data.length > 0));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, [user?.id]);

  // Calculate completeness when data changes
  useEffect(() => {
    if (profile) {
      calculateDetailedCompleteness();
    }
  }, [profile, talentProfile, hasEducation, hasAvatar]);

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
