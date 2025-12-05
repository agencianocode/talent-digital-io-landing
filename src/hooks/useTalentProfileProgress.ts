import { useState, useEffect, useMemo } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TalentProfileData {
  user_id: string;
  title: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_level: string | null;
  video_presentation_url: string | null;
}

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
}

interface TaskStatus {
  id: string;
  title: string;
  completed: boolean;
  route?: string;
  description?: string;
}

export const useTalentProfileProgress = () => {
  const { user } = useSupabaseAuth();
  const [talentProfile, setTalentProfile] = useState<TalentProfileData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasExperience, setHasExperience] = useState(false);
  const [hasEducation, setHasEducation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Obtener perfil de talento
        const { data: talentData, error: talentError } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (talentError && talentError.code !== 'PGRST116') {
          console.error('Error fetching talent profile:', talentError);
        } else if (talentData) {
          setTalentProfile(talentData);
        }

        // Obtener perfil de usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, country, city')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        } else if (profileData) {
          setUserProfile(profileData);
        }

        // Verificar experiencia laboral
        const { data: experienceData, error: expError } = await supabase
          .from('talent_experiences')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!expError && experienceData && experienceData.length > 0) {
          setHasExperience(true);
        }

        // Verificar educación
        const { data: educationData, error: eduError } = await supabase
          .from('talent_education')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!eduError && educationData && educationData.length > 0) {
          setHasEducation(true);
        }

      } catch (error) {
        console.error('Error fetching talent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Verificar avatar desde ambas fuentes: profiles.avatar_url y user_metadata.avatar_url
  const hasAvatar = useMemo(() => {
    const profileAvatar = userProfile?.avatar_url;
    const metadataAvatar = user?.user_metadata?.avatar_url;
    return !!(profileAvatar || metadataAvatar);
  }, [userProfile?.avatar_url, user?.user_metadata?.avatar_url]);

  const getTasksStatus = (): TaskStatus[] => {
    if (!userProfile || !talentProfile) {
      return [];
    }

    return [
      {
        id: 'basic-info',
        title: 'Información Básica',
        completed: !!(userProfile.full_name && userProfile.country),
        route: '/talent-dashboard/profile',
        description: 'Completa tu nombre y ubicación'
      },
      {
        id: 'profile-photo',
        title: 'Foto de Perfil',
        completed: hasAvatar,
        route: '/talent-dashboard/profile',
        description: 'Agrega una foto profesional'
      },
      {
        id: 'title-bio',
        title: 'Título y Biografía',
        completed: !!(talentProfile.title && talentProfile.bio && talentProfile.bio.length >= 50),
        route: '/talent-dashboard/profile',
        description: 'Define tu título profesional y escribe tu biografía (mín. 50 caracteres)'
      },
      {
        id: 'skills',
        title: 'Habilidades',
        completed: !!(talentProfile.skills && talentProfile.skills.length >= 3),
        route: '/talent-dashboard/profile',
        description: 'Agrega al menos 3 habilidades'
      },
      {
        id: 'experience',
        title: 'Experiencia Laboral',
        completed: hasExperience,
        route: '/talent-dashboard/profile',
        description: 'Agrega al menos una experiencia laboral'
      },
      {
        id: 'education',
        title: 'Formación Académica',
        completed: hasEducation,
        route: '/talent-dashboard/profile',
        description: 'Agrega al menos un título o certificación'
      },
      {
        id: 'video',
        title: 'Video de Presentación',
        completed: !!talentProfile.video_presentation_url,
        route: '/talent-dashboard/profile',
        description: 'Agrega un video para destacar tu perfil'
      }
    ];
  };

  const getCompletionPercentage = (): number => {
    const tasks = getTasksStatus();
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getNextIncompleteTask = (): TaskStatus | null => {
    const tasks = getTasksStatus();
    return tasks.find(task => !task.completed) || null;
  };

  return {
    talentProfile,
    userProfile,
    loading,
    getTasksStatus,
    getCompletionPercentage,
    getNextIncompleteTask
  };
};
