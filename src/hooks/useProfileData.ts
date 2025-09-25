import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  TalentProfile, 
  UserProfile, 
  ProfileEditData, 
  ValidationResult 
} from '@/types/profile';
import { toast } from 'sonner';

export const useProfileData = () => {
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch complete profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user profile from profiles table
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Fetch talent profile from talent_profiles table
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (talentError && talentError.code !== 'PGRST116') {
        console.warn('No talent profile found:', talentError);
      }

      // For now, we'll use the profiles table data as both user and talent profile
      // This will be updated once the new tables are created
      // Merge userData with user_metadata from onboarding
      if (userData || user?.user_metadata) {
        // Filter out blob URLs to prevent temporary URL issues, but keep valid URLs
        const rawAvatarUrl = user?.user_metadata?.avatar_url || userData?.avatar_url || user?.user_metadata?.profile_photo_url || (userData as any)?.profile_photo_url || null;
        const filteredAvatarUrl = rawAvatarUrl && !rawAvatarUrl.startsWith('blob:') ? rawAvatarUrl : null;
        
        console.log('🔍 useProfileData - Avatar URL filtering:', {
          rawAvatarUrl,
          filteredAvatarUrl,
          isBlobUrl: rawAvatarUrl?.startsWith('blob:')
        });
        
        const enrichedUserProfile = {
          ...userData,
          id: userData?.id || user?.id || '',
          user_id: userData?.user_id || user?.id || '',
          full_name: user?.user_metadata?.full_name || userData?.full_name || '',
          avatar_url: filteredAvatarUrl,
          phone: user?.user_metadata?.phone || userData?.phone || '',
          country: user?.user_metadata?.country || userData?.country || '',
          city: user?.user_metadata?.city || userData?.city || '',
          linkedin: user?.user_metadata?.linkedin_url || userData?.linkedin || '',
          created_at: userData?.created_at || new Date().toISOString(),
          updated_at: userData?.updated_at || new Date().toISOString()
        };
        
        console.log('🔍 useProfileData - Enriched user profile:', {
          original: userData,
          enriched: enrichedUserProfile,
          userMetadata: user?.user_metadata
        });
        setUserProfile(enrichedUserProfile);
      }
      
      // Create talent profile from available data
      if (userData || talentData || user?.user_metadata) {
        // Use talent_profiles data if available, otherwise fallback to userData + user_metadata
        const sourceData = talentData || userData;
        
        // Build location string from available data
        const country = (talentData as any)?.country || userData?.country || user?.user_metadata?.country || '';
        const city = user?.user_metadata?.city || (talentData as any)?.city || userData?.city || '';
        const state = user?.user_metadata?.state || '';
        
        console.log('🔍 useProfileData - City resolution:', {
          talentDataCity: (talentData as any)?.city,
          userDataCity: userData?.city,
          userMetadataCity: user?.user_metadata?.city,
          resolvedCity: city
        });
        
        console.log('🔍 useProfileData - Location data:', {
          talentData: talentData ? {
            country: (talentData as any).country,
            city: (talentData as any).city
          } : null,
          userData: userData ? {
            country: userData.country,
            city: userData.city
          } : null,
          userMetadata: {
            country: user?.user_metadata?.country,
            city: user?.user_metadata?.city,
            state: user?.user_metadata?.state
          },
          resolved: {
            country,
            city,
            state
          }
        });
        
        let fullLocation = '';
        if (city && country) {
          if (state) {
            fullLocation = `${city}, ${state}, ${country}`;
          } else {
            fullLocation = `${city}, ${country}`;
          }
        } else if (country) {
          fullLocation = country;
        }
        
        console.log('🔍 useProfileData - Built fullLocation:', fullLocation);

        const talentProfile: TalentProfile = {
          id: sourceData?.id || userData?.id || '',
          user_id: sourceData?.user_id || userData?.user_id || user.id,
          title: user?.user_metadata?.title || talentData?.title || userData?.position || null,
          specialty: talentData?.specialty || null,
          bio: user?.user_metadata?.bio || talentData?.bio || null,
          skills: user?.user_metadata?.skills || talentData?.skills || null,
          years_experience: talentData?.years_experience || user?.user_metadata?.experience_level || null,
          availability: talentData?.availability || user?.user_metadata?.availability || null,
          linkedin_url: talentData?.linkedin_url || userData?.linkedin || user?.user_metadata?.linkedin_url || null,
          portfolio_url: talentData?.portfolio_url || user?.user_metadata?.portfolio_url || null,
          hourly_rate_min: talentData?.hourly_rate_min || user?.user_metadata?.hourly_rate_min || null,
          hourly_rate_max: talentData?.hourly_rate_max || user?.user_metadata?.hourly_rate_max || null,
          currency: talentData?.currency || user?.user_metadata?.currency || null,
          location: (talentData as any)?.location || fullLocation || userData?.city || user?.user_metadata?.location || null,
          country: country || null,
          city: city || null,
          phone: (talentData as any)?.phone || userData?.phone || user?.user_metadata?.phone || null,
          video_presentation_url: (talentData as any)?.video_presentation_url || user?.user_metadata?.video_presentation_url || null,
          created_at: sourceData?.created_at || userData?.created_at || new Date().toISOString(),
          updated_at: sourceData?.updated_at || userData?.updated_at || new Date().toISOString()
        };
        
        console.log('🔍 useProfileData - Final talent profile:', talentProfile);
        setProfile(talentProfile);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Error al cargar el perfil');
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Update profile data
  const updateProfile = useCallback(async (data: Partial<ProfileEditData>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setError(null);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          title: data.title,
          bio: data.bio,
          skills: data.skills,
          location: data.location,
          country: data.country,
          city: data.city,
          phone: data.phone,
          video_presentation_url: data.video_presentation_url,
          hourly_rate_min: data.hourly_rate_min,
          hourly_rate_max: data.hourly_rate_max,
          currency: data.currency,
          availability: data.availability,
          updated_at: new Date().toISOString()
        }
      });

      if (metadataError) throw metadataError;

      // Update profiles table
      const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    user_id: user.id,
    full_name: data.full_name,
    phone: data.phone,
    city: data.city,
    country: data.country,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });

      if (profileError) throw profileError;

      // Update talent_profiles table
      const { error: talentError } = await supabase
  .from('talent_profiles')
  .upsert({
    user_id: user.id,
    title: data.title,
    bio: data.bio,
    skills: data.skills,
    location: data.location,
    phone: data.phone,
    country: data.country,
    city: data.city,
    video_presentation_url: data.video_presentation_url,
    hourly_rate_min: data.hourly_rate_min,
    hourly_rate_max: data.hourly_rate_max,
    currency: data.currency,
    availability: data.availability,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });

      if (talentError) throw talentError;

      // Refresh profile data
      await fetchProfile();
      toast.success('Perfil actualizado correctamente');
      return true;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error al actualizar el perfil');
      toast.error('Error al actualizar el perfil');
      return false;
    }
  }, [user?.id, fetchProfile]);

  // Update avatar
  const updateAvatar = useCallback(async (file: File): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setError(null);

      // Upload file to storage with proper folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }
      });

      if (metadataError) throw metadataError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Refresh profile data
      await fetchProfile();
      toast.success('Avatar actualizado correctamente');
      return true;
    } catch (err: any) {
      console.error('Error updating avatar:', err);
      setError(err.message || 'Error al actualizar el avatar');
      toast.error('Error al actualizar el avatar');
      return false;
    }
  }, [user?.id, fetchProfile]);

  // Validate profile data
  const validateProfile = useCallback((data: Partial<ProfileEditData>): ValidationResult => {
    const errors: Record<string, string> = {};

    if (data.full_name && data.full_name.trim().length < 2) {
      errors.full_name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (data.title && data.title.trim().length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (data.bio && data.bio.trim().length < 50) {
      errors.bio = 'La biografía debe tener al menos 50 caracteres';
    }

    if (data.skills && data.skills.length === 0) {
      errors.skills = 'Debes agregar al menos una habilidad';
    }

    if (data.hourly_rate_min && data.hourly_rate_max && data.hourly_rate_min > data.hourly_rate_max) {
      errors.hourly_rate = 'La tarifa mínima no puede ser mayor que la máxima';
    }

    if (data.video_presentation_url && !isValidVideoUrl(data.video_presentation_url)) {
      errors.video_presentation_url = 'URL de video no válida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Helper function to validate video URLs
  const isValidVideoUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      return (
        hostname.includes('youtube.com') ||
        hostname.includes('youtu.be') ||
        hostname.includes('loom.com') ||
        hostname.includes('vimeo.com')
      );
    } catch {
      return false;
    }
  };

  // Get profile completeness percentage
  const getProfileCompleteness = useCallback((): number => {
    if (!profile && !userProfile) return 0;

    let completed = 0;
    let total = 10;

    if (userProfile?.full_name) completed++;
    if (userProfile?.avatar_url) completed++;
    if (profile?.title) completed++;
    if (profile?.bio) completed++;
    if (profile?.skills && profile.skills.length > 0) completed++;
    if (profile?.location) completed++;
    if (profile?.phone) completed++;
    if (profile?.video_presentation_url) completed++;
    if (profile?.hourly_rate_min && profile?.hourly_rate_max) completed++;
    if (profile?.availability) completed++;

    return Math.round((completed / total) * 100);
  }, [profile, userProfile]);

  // Generate public profile URL
  const getPublicProfileUrl = useCallback((): string => {
    if (!user?.id) return '';
    return `https://talentodigital.io/profile/${user.id}`;
  }, [user?.id]);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    userProfile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    validateProfile,
    getProfileCompleteness,
    getPublicProfileUrl,
    refreshProfile: fetchProfile
  };
};
