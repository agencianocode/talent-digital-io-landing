import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  TalentSocialLink, 
  SocialLinkFormData 
} from '@/types/profile';
import { toast } from 'sonner';

export const useSocialLinks = () => {
  const { user } = useSupabaseAuth();
  const [socialLinks, setSocialLinks] = useState<TalentSocialLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSocialLinks = useCallback(async () => {
    if (!user) return;
    
    console.log('🔄 Fetching social links for user:', user.id);
    setLoading(true);
    try {
      // @ts-ignore - talent_social_links table exists but types not yet generated
      const { data, error } = await supabase
        .from('talent_social_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('📊 Fetched social links:', data);
      setSocialLinks(data as any || []);
    } catch (err: any) {
      console.error('Error fetching social links:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addSocialLink = useCallback(async (data: SocialLinkFormData): Promise<boolean> => {
    if (!user) return false;
    
    console.log('➕ Adding social link:', data);
    
    try {
      // @ts-ignore - talent_social_links table exists but types not yet generated
      const { data: insertedData, error } = await supabase
        .from('talent_social_links')
        .insert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Social link added successfully:', insertedData);
      toast.success('Red social agregada exitosamente');
      
      // Update state immediately with the new data
      setSocialLinks(prev => {
        const newSocialLinks = [...prev, insertedData];
        console.log('🔄 Updated social links state:', newSocialLinks);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('socialLinksUpdated', { 
          detail: { count: newSocialLinks.length } 
        }));
        
        return newSocialLinks;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error adding social link:', err);
      toast.error('Error al agregar red social: ' + err.message);
      return false;
    }
  }, [user]);

  const updateSocialLink = useCallback(async (id: string, data: Partial<SocialLinkFormData>): Promise<boolean> => {
    if (!user) return false;
    
    console.log('✏️ Updating social link:', id, data);
    
    try {
      // @ts-ignore - talent_social_links table exists but types not yet generated
      const { data: updatedData, error } = await supabase
        .from('talent_social_links')
        .update(data as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Social link updated successfully:', updatedData);
      toast.success('Red social actualizada exitosamente');
      
      // Update state immediately with the updated data
      setSocialLinks(prev => {
        const newSocialLinks = prev.map(link => 
          link.id === id ? { ...link, ...updatedData } : link
        );
        console.log('🔄 Updated social links state:', newSocialLinks);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('socialLinksUpdated', { 
          detail: { count: newSocialLinks.length } 
        }));
        
        return newSocialLinks;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating social link:', err);
      toast.error('Error al actualizar red social: ' + err.message);
      return false;
    }
  }, [user]);

  const deleteSocialLink = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    console.log('🗑️ Deleting social link:', id);
    
    try {
      // @ts-ignore - talent_social_links table exists but types not yet generated
      const { error } = await supabase
        .from('talent_social_links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Social link deleted successfully');
      toast.success('Red social eliminada exitosamente');
      
      // Update state immediately by removing the deleted item
      setSocialLinks(prev => {
        const newSocialLinks = prev.filter(link => link.id !== id);
        console.log('🔄 Updated social links state:', newSocialLinks);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('socialLinksUpdated', { 
          detail: { count: newSocialLinks.length } 
        }));
        
        return newSocialLinks;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting social link:', err);
      toast.error('Error al eliminar red social: ' + err.message);
      return false;
    }
  }, [user]);

  const validateSocialLink = useCallback((data: SocialLinkFormData): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.platform) {
      errors.platform = 'Debes seleccionar una plataforma';
    }

    if (!data.url || !isValidSocialUrl(data.url, data.platform)) {
      errors.url = 'URL no válida para esta plataforma';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const isValidSocialUrl = (url: string, platform: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      const platformDomains: Record<string, string[]> = {
        'linkedin': ['linkedin.com', 'www.linkedin.com'],
        'twitter': ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
        'instagram': ['instagram.com', 'www.instagram.com'],
        'youtube': ['youtube.com', 'www.youtube.com', 'youtu.be'],
        'facebook': ['facebook.com', 'www.facebook.com', 'fb.com', 'www.fb.com'],
        'github': ['github.com', 'www.github.com'],
        'behance': ['behance.net', 'www.behance.net'],
        'dribbble': ['dribbble.com', 'www.dribbble.com'],
        'other': [] // Allow any URL for 'other'
      };

      const validDomains = platformDomains[platform] || [];
      
      if (platform === 'other') {
        return true; // Allow any URL for 'other'
      }

      return validDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    } catch {
      return false;
    }
  };

  const getSocialLinkByPlatform = useCallback((platform: string): TalentSocialLink | null => {
    return socialLinks.find(link => link.platform === platform) || null;
  }, [socialLinks]);

  const getAvailablePlatforms = useCallback((): string[] => {
    const allPlatforms = ['linkedin', 'twitter', 'instagram', 'youtube', 'facebook', 'github', 'behance', 'dribbble', 'other'];
    const usedPlatforms = socialLinks.map(link => link.platform);
    return allPlatforms.filter(platform => !usedPlatforms.includes(platform));
  }, [socialLinks]);

  useEffect(() => {
    if (user) {
      fetchSocialLinks();
    }
  }, [user?.id]); // Solo depende del ID del usuario, no de la función

  return {
    socialLinks,
    loading,
    error,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    validateSocialLink,
    getSocialLinkByPlatform,
    getAvailablePlatforms,
    refreshSocialLinks: fetchSocialLinks
  };
};
