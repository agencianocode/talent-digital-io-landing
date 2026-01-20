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
    const profileData = profile as any;

    // === CÁLCULO UNIFICADO DE COMPLETITUD (10 campos = 10% cada uno) ===
    // Misma lógica que get-all-users edge function
    
    // 1. Foto de perfil (10%)
    if (hasAvatar) {
      total += 10;
    } else {
      missingFields.push('Foto de perfil');
      suggestions.push('Sube una foto profesional para mejorar tu perfil');
    }

    // 2. Nombre real - no derivado del email (10%)
    const emailPrefix = user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    const nameWords = (profile.full_name || '').trim().split(/\s+/).filter((w: string) => w.length > 0);
    const cleanName = (profile.full_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const hasRealName = profile.full_name && 
      profile.full_name.trim() !== '' && 
      profile.full_name.toLowerCase() !== 'sin nombre' &&
      (nameWords.length >= 2 || cleanName !== emailPrefix);
    
    if (hasRealName) {
      total += 10;
    } else {
      missingFields.push('Nombre real (nombre y apellido)');
      suggestions.push('Agrega tu nombre y apellido completos');
    }

    // 3. País (10%)
    if (profileData?.country || talentProfile?.country) {
      total += 10;
    } else {
      missingFields.push('País');
      suggestions.push('Indica tu país para oportunidades locales');
    }

    // 4. Ciudad (10%)
    if (profileData?.city || talentProfile?.city) {
      total += 10;
    } else {
      missingFields.push('Ciudad');
      suggestions.push('Especifica tu ciudad para oportunidades cercanas');
    }

    // 5. Categoría principal (10%)
    if (talentProfile?.primary_category_id) {
      total += 10;
    } else {
      missingFields.push('Categoría principal');
      suggestions.push('Selecciona tu área de especialización principal');
    }

    // 6. Título profesional (10%)
    if (talentProfile?.title) {
      total += 10;
    } else {
      missingFields.push('Título profesional');
      suggestions.push('Define un título que represente tu rol actual');
    }

    // 7. Nivel de experiencia válido (10%)
    const validExperienceLevels = ['0-1', '1-3', '3-6', '6+'];
    if (talentProfile?.experience_level && validExperienceLevels.includes(talentProfile.experience_level)) {
      total += 10;
    } else {
      missingFields.push('Nivel de experiencia');
      suggestions.push('Indica tu nivel de experiencia profesional');
    }

    // 8. Skills - mínimo 3 (10%)
    if (talentProfile?.skills && talentProfile.skills.length >= 3) {
      total += 10;
    } else {
      missingFields.push('Habilidades (mínimo 3)');
      suggestions.push('Agrega al menos 3 habilidades que te destacan');
    }

    // 9. Bio - mínimo 50 caracteres (10%)
    if (talentProfile?.bio && talentProfile.bio.length >= 50) {
      total += 10;
    } else {
      missingFields.push('Biografía (mínimo 50 caracteres)');
      suggestions.push('Escribe una descripción atractiva de tu experiencia');
    }

    // 10. Educación académica - mínimo 1 registro (10%)
    if (hasEducation) {
      total += 10;
    } else {
      missingFields.push('Formación académica');
      suggestions.push('Agrega al menos un estudio o certificación');
    }

    // Calcular porcentajes por sección para el breakdown
    // Basic info: foto + nombre + país + ciudad = 40%
    let basicInfoScore = 0;
    if (hasAvatar) basicInfoScore += 25;
    if (hasRealName) basicInfoScore += 25;
    if (profileData?.country || talentProfile?.country) basicInfoScore += 25;
    if (profileData?.city || talentProfile?.city) basicInfoScore += 25;

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
