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
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Fetch talent profile from talent_profiles table
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (talentError && talentError.code !== 'PGRST116') {
        console.warn('No talent profile found:', talentError);
      }

      // For now, we'll use the profiles table data as both user and talent profile
      // This will be updated once the new tables are created
      // Merge userData with user_metadata from onboarding
      if (userData || user?.user_metadata) {
        // Prioritize database avatar_url over user_metadata, filter out blob URLs
        const rawAvatarUrl = userData?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.profile_photo_url || (userData as any)?.profile_photo_url || null;
        const filteredAvatarUrl = rawAvatarUrl && !rawAvatarUrl.startsWith('blob:') ? rawAvatarUrl : null;
        
        console.log('🔍 useProfileData - Avatar URL filtering:', {
          userDataAvatarUrl: userData?.avatar_url,
          userMetadataAvatarUrl: user?.user_metadata?.avatar_url,
          userMetadataProfilePhotoUrl: user?.user_metadata?.profile_photo_url,
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
          experience_level: talentData?.experience_level || user?.user_metadata?.experience_level || null,
          primary_category_id: talentData?.primary_category_id || null,
          secondary_category_id: talentData?.secondary_category_id || null,
          industries_of_interest: talentData?.industries_of_interest || null,
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
          video_presentation_url: (talentData as any)?.video_presentation_url || userData?.video_presentation_url || user?.user_metadata?.video_presentation_url || null,
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

  // Recalculate profile completeness
  const recalculateProfileCompleteness = async (userId: string) => {
    try {
      // Fetch current data including education
      const [{ data: profileData }, { data: talentData }, { data: educationData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('talent_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('talent_education').select('id').eq('user_id', userId).limit(1)
      ]);
      
      if (!profileData) return;
      
      // === CÁLCULO UNIFICADO DE COMPLETITUD (10 campos = 100%) ===
      // Misma lógica que get-all-users edge function
      let score = 0;
      
      // 1. Foto de perfil (10%)
      const hasAvatar = !!profileData.avatar_url;
      if (hasAvatar) score += 10;
      
      // 2. Nombre real - no derivado del email (10%)
      const emailPrefix = user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      const nameWords = (profileData.full_name || '').trim().split(/\s+/).filter((w: string) => w.length > 0);
      const cleanName = (profileData.full_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const hasRealName = profileData.full_name && 
        profileData.full_name.trim() !== '' && 
        profileData.full_name.toLowerCase() !== 'sin nombre' &&
        (nameWords.length >= 2 || cleanName !== emailPrefix);
      if (hasRealName) score += 10;
      
      // 3. País (10%)
      if (profileData.country || talentData?.country) score += 10;
      
      // 4. Ciudad (10%)
      if (profileData.city || talentData?.city) score += 10;
      
      // 5. Categoría principal (10%)
      if (talentData?.primary_category_id) score += 10;
      
      // 6. Título profesional (10%)
      if (talentData?.title) score += 10;
      
      // 7. Nivel de experiencia válido (10%)
      const validExperienceLevels = ['0-1', '1-3', '3-6', '6+'];
      if (talentData?.experience_level && validExperienceLevels.includes(talentData.experience_level)) {
        score += 10;
      }
      
      // 8. Skills - mínimo 3 (10%)
      if (Array.isArray(talentData?.skills) && talentData.skills.length >= 3) {
        score += 10;
      }
      
      // 9. Bio - mínimo 50 caracteres (10%)
      if (talentData?.bio && talentData.bio.length >= 50) score += 10;
      
      // 10. Educación académica - mínimo 1 registro (10%)
      const hasEducation = educationData && educationData.length > 0;
      if (hasEducation) score += 10;
      
      // Update profile_completeness
      await supabase
        .from('profiles')
        .update({ profile_completeness: score })
        .eq('user_id', userId);
      
      console.log(`✅ Profile completeness recalculated: ${score}%`);
      console.log('📋 Campos completos:', {
        avatar: hasAvatar,
        real_name: hasRealName,
        country: !!(profileData.country || talentData?.country),
        city: !!(profileData.city || talentData?.city),
        primary_category: !!talentData?.primary_category_id,
        title: !!talentData?.title,
        experience_level: !!(talentData?.experience_level && validExperienceLevels.includes(talentData.experience_level)),
        skills_3: Array.isArray(talentData?.skills) && talentData.skills.length >= 3,
        bio_50: (talentData?.bio?.length || 0) >= 50,
        education: hasEducation
      });
    } catch (error) {
      console.error('Error recalculating profile completeness:', error);
    }
  };

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
          availability: data.availability,
          updated_at: new Date().toISOString()
        }
      });

      if (metadataError) throw metadataError;

      // Update profiles table
      const profileUpdatesData: any = {
        user_id: user.id,
        full_name: data.full_name,
        phone: data.phone,
        city: data.city,
        country: data.country,
        updated_at: new Date().toISOString()
      };
      
      // Agregar campos opcionales - usar !== undefined para permitir borrar valores
      if (data.social_links !== undefined) {
        profileUpdatesData.social_links = data.social_links || null;
      }
      if (data.video_presentation_url !== undefined) {
        profileUpdatesData.video_presentation_url = data.video_presentation_url || null;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileUpdatesData, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Update talent_profiles table - INCLUYENDO TODOS LOS CAMPOS CRÍTICOS
      const talentProfileData: any = {
        user_id: user.id,
        title: data.title,
        bio: data.bio,
        skills: data.skills,
        location: data.location,
        phone: data.phone,
        country: data.country,
        city: data.city,
        video_presentation_url: data.video_presentation_url || null,
        availability: data.availability,
        updated_at: new Date().toISOString()
      };
      
      // 🚀 AGREGAR CAMPOS FALTANTES CRÍTICOS
      if (data.primary_category_id) {
        talentProfileData.primary_category_id = data.primary_category_id;
      }
      if (data.secondary_category_id) {
        talentProfileData.secondary_category_id = data.secondary_category_id;
      }
      if (data.experience_level) {
        talentProfileData.experience_level = data.experience_level;
      }
      if (data.industries_of_interest) {
        talentProfileData.industries_of_interest = data.industries_of_interest;
      }
      if (data.portfolio_url) {
        talentProfileData.portfolio_url = data.portfolio_url;
      }
      if (data.hourly_rate_min !== undefined) {
        talentProfileData.hourly_rate_min = data.hourly_rate_min;
      }
      if (data.hourly_rate_max !== undefined) {
        talentProfileData.hourly_rate_max = data.hourly_rate_max;
      }
      if (data.currency) {
        talentProfileData.currency = data.currency;
      }
      
      const { error: talentError } = await supabase
        .from('talent_profiles')
        .upsert(talentProfileData, {
          onConflict: 'user_id'
        });

      if (talentError) throw talentError;

      // 🚀 RECALCULAR Y ACTUALIZAR PROFILE_COMPLETENESS
      await recalculateProfileCompleteness(user.id);

      // Refresh profile data
      await fetchProfile();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      // Track activity on profile update
      try {
        await supabase.rpc('update_last_activity');
      } catch (e) { /* silent */ }
      
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

      // Upload file to storage with unique name to avoid caching issues
      const fileExt = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const fileName = `${user.id}/avatar_${timestamp}.${fileExt}`;
      
      console.log('🔍 Uploading avatar:', {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id
      });
      
      // First, try to check if bucket exists and is accessible
      const { data: bucketList, error: listError } = await supabase.storage
        .from('avatars')
        .list();
      
      if (listError) {
        console.error('🔍 Bucket access error:', listError);
        throw new Error(`Error accediendo al bucket avatars: ${listError.message}`);
      }
      
      console.log('🔍 Bucket accessible, existing files:', bucketList);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('🔍 Upload error details:', uploadError);
        
        // Try alternative path if folder-based upload fails
        const alternativePath = `public/${user.id}_${Date.now()}.${fileExt}`;
        console.log('🔍 Trying alternative path:', alternativePath);
        
        const { error: altUploadError } = await supabase.storage
          .from('avatars')
          .upload(alternativePath, file, { upsert: true });
          
        if (altUploadError) {
          throw new Error(`Error de subida: ${uploadError.message}. Error alternativo: ${altUploadError.message}`);
        }
        
        // Use alternative path
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(alternativePath);
          
        console.log('🔍 Alternative upload successful:', publicUrl);
        
        // Update user metadata
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          }
        });

        if (metadataError) {
          console.error('🔍 Metadata update error:', metadataError);
          throw new Error(`Error actualizando metadatos: ${metadataError.message}`);
        }

        // Update profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error('🔍 Profile update error:', profileError);
          throw new Error(`Error actualizando perfil: ${profileError.message}`);
        }

      // Refresh profile data
      await fetchProfile();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      toast.success('Avatar actualizado correctamente');
      return true;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('🔍 Upload successful, public URL:', publicUrl);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }
      });

      if (metadataError) {
        console.error('🔍 Metadata update error:', metadataError);
        throw new Error(`Error actualizando metadatos: ${metadataError.message}`);
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('🔍 Profile update error:', profileError);
        throw new Error(`Error actualizando perfil: ${profileError.message}`);
      }

      // Refresh profile data
      await fetchProfile();
      
      // Dispatch event for other components  
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      toast.success('Avatar actualizado correctamente');
      return true;
    } catch (err: any) {
      console.error('🔍 Complete avatar update error:', err);
      setError(err.message || 'Error al actualizar el avatar');
      toast.error(`Error al actualizar el avatar: ${err.message}`);
      return false;
    }
  }, [user?.id, fetchProfile]);

  // Validate profile data
  const validateProfile = useCallback((data: Partial<ProfileEditData>): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validaciones CRÍTICAS para guardar cambios
    if (data.full_name && data.full_name.trim().length < 2) {
      errors.full_name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (data.hourly_rate_min && data.hourly_rate_max && data.hourly_rate_min > data.hourly_rate_max) {
      errors.hourly_rate = 'La tarifa mínima no puede ser mayor que la máxima';
    }

    if (data.video_presentation_url && !isValidVideoUrl(data.video_presentation_url)) {
      errors.video_presentation_url = 'URL de video no válida';
    }

    // NOTA: Estas validaciones NO bloquean el guardado, pero SÍ afectan:
    // - Perfil completo (banner)
    // - Aparecer en búsqueda de talento
    // - Poder aplicar a oportunidades
    // 
    // Campos requeridos para perfil completo:
    // ✓ Foto de perfil
    // ✓ Nombre y apellido
    // ✓ País y ciudad
    // ✓ Categoría principal
    // ✓ Categoría secundaria
    // ✓ Título
    // ✓ Nivel de experiencia
    // ✓ Skills (al menos 1)
    // ✓ Bio / descripción

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
      
      // Lista de dominios permitidos para videos
      const allowedDomains = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'loom.com',
        'drive.google.com',
        'dropbox.com',
        'streamable.com',
        'wistia.com',
        'vidyard.com',
        'cloudinary.com',
        'amazonaws.com',
        'supabase.co',
      ];
      
      return allowedDomains.some(domain => hostname.includes(domain));
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
