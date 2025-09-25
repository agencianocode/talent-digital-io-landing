import { useState, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ProfileShareData } from '@/types/profile';
import { toast } from 'sonner';

export const useProfileSharing = () => {
  const { user } = useSupabaseAuth();
  const [shareData, setShareData] = useState<ProfileShareData | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate public profile URL
  const generatePublicUrl = useCallback((): string => {
    if (!user?.id) return '';
    return `https://talentodigital.io/profile/${user.id}`;
  }, [user?.id]);

  // Copy URL to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      toast.success('URL copiada al portapapeles');
      return true;
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast.error('Error al copiar URL');
      return false;
    }
  }, []);

  // Share via native share API
  const shareViaNative = useCallback(async (url: string, title: string = 'Mi Perfil de Talento'): Promise<boolean> => {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title,
        text: 'Mira mi perfil profesional en TalentoDigital.io',
        url
      });
      
      toast.success('Perfil compartido correctamente');
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        toast.error('Error al compartir perfil');
      }
      return false;
    }
  }, []);

  // Share via social media
  const shareViaSocial = useCallback((platform: string, url: string, title: string = 'Mi Perfil de Talento'): void => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent('Mira mi perfil profesional en TalentoDigital.io');

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`
    };

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }, []);

  // Generate QR code (placeholder - would need a QR library)
  const generateQRCode = useCallback(async (url: string): Promise<string | null> => {
    try {
      // This is a placeholder - in a real implementation, you'd use a QR code library
      // For now, we'll return a placeholder URL
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      return qrApiUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  }, []);

  // Get share data
  const getShareData = useCallback(async (): Promise<ProfileShareData> => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    try {
      const publicUrl = generatePublicUrl();
      const qrCode = await generateQRCode(publicUrl);

      const data: ProfileShareData = {
        public_url: publicUrl,
        qr_code: qrCode || undefined,
        share_count: 0 // This would come from analytics in a real implementation
      };

      setShareData(data);
      return data;
    } catch (err: any) {
      console.error('Error getting share data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, generatePublicUrl, generateQRCode]);

  // Share profile with all options
  const shareProfile = useCallback(async (method: 'copy' | 'native' | 'social', platform?: string): Promise<boolean> => {
    try {
      const url = generatePublicUrl();
      const title = 'Mi Perfil de Talento';

      switch (method) {
        case 'copy':
          return await copyToClipboard(url);
        
        case 'native':
          return await shareViaNative(url, title);
        
        case 'social':
          if (platform) {
            shareViaSocial(platform, url, title);
            return true;
          }
          return false;
        
        default:
          return false;
      }
    } catch (err) {
      console.error('Error sharing profile:', err);
      return false;
    }
  }, [generatePublicUrl, copyToClipboard, shareViaNative, shareViaSocial]);

  // Check if native sharing is supported
  const isNativeShareSupported = useCallback((): boolean => {
    return !!navigator.share;
  }, []);

  // Check if clipboard is supported
  const isClipboardSupported = useCallback((): boolean => {
    return !!(navigator.clipboard && window.isSecureContext);
  }, []);

  return {
    shareData,
    loading,
    generatePublicUrl,
    copyToClipboard,
    shareViaNative,
    shareViaSocial,
    generateQRCode,
    getShareData,
    shareProfile,
    isNativeShareSupported,
    isClipboardSupported
  };
};
