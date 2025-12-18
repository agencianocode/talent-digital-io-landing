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

  // Generate public URL for opportunity - uses slug if available
  const generatePublicUrl = useCallback((opportunityId: string, slug?: string) => {
    // Use slug for cleaner URLs if available, otherwise fall back to ID
    const identifier = slug || opportunityId;
    return `https://app.talentodigital.io/opportunity/${identifier}`;
  }, []);

  // Share opportunity
  const shareOpportunity = useCallback(async (
    opportunityId: string, 
    shareType: 'link' | 'whatsapp' | 'linkedin' | 'twitter' | 'email',
    customUrl?: string,
    slug?: string,
    title?: string
  ) => {
    setIsLoading(true);
    try {
      const shareUrl = customUrl || generatePublicUrl(opportunityId, slug);
      
      console.log('Sharing opportunity:', { opportunityId, shareType, shareUrl, title });

      // Handle different share types
      switch (shareType) {
        case 'whatsapp':
          const whatsappText = title 
            ? `🚀 *${title}*\n\n¡Mira esta oportunidad de trabajo!\n\n${shareUrl}`
            : `¡Mira esta oportunidad! ${shareUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          const twitterText = title
            ? `🚀 ${title} - ¡Mira esta oportunidad! ${shareUrl}`
            : `¡Mira esta oportunidad! ${shareUrl}`;
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`, '_blank');
          break;
        case 'email':
          const emailSubject = title ? `Oportunidad: ${title}` : 'Oportunidad de trabajo';
          const emailBody = title
            ? `¡Hola!\n\nTe comparto esta oportunidad de trabajo:\n\n📋 ${title}\n\n${shareUrl}\n\n¡Saludos!`
            : `¡Mira esta oportunidad! ${shareUrl}`;
          const mailtoLink = document.createElement('a');
          mailtoLink.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          mailtoLink.click();
          break;
        case 'link':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Enlace copiado al portapapeles');
          break;
      }

      if (shareType !== 'link') {
        toast.success(`Oportunidad compartida por ${shareType}`);
      }
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