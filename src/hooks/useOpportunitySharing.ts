import { useState, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

export interface OpportunityShare {
  id: string;
  opportunity_id: string;
  shared_by: string;
  share_type: 'link' | 'whatsapp' | 'linkedin' | 'twitter' | 'email';
  share_url?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShareStats {
  total_shares: number;
  total_views: number;
  shares_by_type: {
    link: number;
    whatsapp: number;
    linkedin: number;
    twitter: number;
    email: number;
  };
}

export const useOpportunitySharing = () => {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Generate public URL for opportunity - uses Edge Function for proper OG meta tags
  const generatePublicUrl = useCallback((opportunityId: string) => {
    // Use Edge Function URL for sharing - this returns proper OG meta tags for social media crawlers
    return `https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/opportunity-share/${opportunityId}`;
  }, []);

  // Share opportunity
  const shareOpportunity = useCallback(async (
    opportunityId: string, 
    shareType: 'link' | 'whatsapp' | 'linkedin' | 'twitter' | 'email',
    customUrl?: string
  ) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const shareUrl = customUrl || generatePublicUrl(opportunityId);
      
      console.log('Sharing opportunity:', { opportunityId, shareType, shareUrl });

      // Handle different share types
      switch (shareType) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`¡Mira esta oportunidad! ${shareUrl}`)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Mira esta oportunidad! ${shareUrl}`)}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent('Oportunidad de trabajo')}&body=${encodeURIComponent(`¡Mira esta oportunidad! ${shareUrl}`)}`, '_blank');
          break;
        case 'link':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Enlace copiado al portapapeles');
          break;
      }

      toast.success(`Oportunidad compartida por ${shareType}`);
      return shareUrl;

    } catch (error) {
      console.error('Error sharing opportunity:', error);
      toast.error('Error al compartir la oportunidad');
      return '';
    } finally {
      setIsLoading(false);
    }
  }, [user, generatePublicUrl]);

  // Get share statistics
  const getShareStats = useCallback(async (): Promise<ShareStats | null> => {
    // For now, return mock data until table is created
    return {
      total_shares: 0,
      total_views: 0,
      shares_by_type: {
        link: 0,
        whatsapp: 0,
        linkedin: 0,
        twitter: 0,
        email: 0,
      }
    };
  }, []);

  // Get public opportunity by URL
  const getPublicOpportunity = useCallback(async (publicUrl: string) => {
    // TODO: Implement when table is created
    console.log('Getting public opportunity for:', publicUrl);
    return null;
  }, []);

  return {
    isLoading,
    shareOpportunity,
    getShareStats,
    getPublicOpportunity,
    generatePublicUrl
  };
}; 