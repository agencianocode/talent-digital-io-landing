import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  TalentSocialLink, 
  SocialLinkFormData 
} from '@/types/profile';
import { toast } from 'sonner';

// Temporary hook that works with current database structure
// This will be replaced once the new tables are created
export const useSocialLinks = () => {
  const { user } = useSupabaseAuth();
  const [socialLinks, setSocialLinks] = useState<TalentSocialLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, return empty social links until new tables are created
  const fetchSocialLinks = useCallback(async () => {
    setSocialLinks([]);
  }, []);

  const addSocialLink = useCallback(async (data: SocialLinkFormData): Promise<boolean> => {
    toast.info('Funcionalidad de redes sociales estará disponible pronto');
    return false;
  }, []);

  const updateSocialLink = useCallback(async (id: string, data: Partial<SocialLinkFormData>): Promise<boolean> => {
    toast.info('Funcionalidad de redes sociales estará disponible pronto');
    return false;
  }, []);

  const deleteSocialLink = useCallback(async (id: string): Promise<boolean> => {
    toast.info('Funcionalidad de redes sociales estará disponible pronto');
    return false;
  }, []);

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
    fetchSocialLinks();
  }, [fetchSocialLinks]);

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
