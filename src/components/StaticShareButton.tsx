import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Share2, 
  Link, 
  MessageCircle, 
  Linkedin, 
  Twitter, 
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface StaticShareButtonProps {
  opportunityId: string;
  opportunityTitle: string;
}

const StaticShareButton: React.FC<StaticShareButtonProps> = ({ 
  opportunityId, 
  opportunityTitle
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const generatePublicUrl = (opportunityId: string) => {
    // Use Supabase Storage URL - serves HTML with correct Content-Type for social media crawlers
    return `https://wyrieetebfzmgffxecpz.supabase.co/storage/v1/object/public/share-pages/opportunity-${opportunityId}.html`;
  };

  // Ensure share page exists by calling Edge Function
  const ensureSharePageExists = async (opportunityId: string) => {
    try {
      await fetch(
        `https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/opportunity-share/${opportunityId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error('Error ensuring share page exists:', error);
    }
  };

  const handleShare = async (shareType: 'link' | 'whatsapp' | 'linkedin' | 'twitter' | 'email') => {
    // First ensure the share page exists in Storage
    await ensureSharePageExists(opportunityId);
    
    const shareUrl = generatePublicUrl(opportunityId);
    
    try {
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
          setIsDialogOpen(false);
          break;
      }
      
      if (shareType !== 'link') {
        toast.success(`Oportunidad compartida por ${shareType}`);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error al compartir la oportunidad');
    }
  };

  const shareOptions = [
    {
      type: 'link' as const,
      label: 'Copiar Enlace',
      icon: Link,
      description: 'Copia el enlace directo'
    },
    {
      type: 'whatsapp' as const,
      label: 'WhatsApp',
      icon: MessageCircle,
      description: 'Compartir por WhatsApp'
    },
    {
      type: 'linkedin' as const,
      label: 'LinkedIn',
      icon: Linkedin,
      description: 'Compartir en LinkedIn'
    },
    {
      type: 'twitter' as const,
      label: 'Twitter',
      icon: Twitter,
      description: 'Compartir en Twitter'
    },
    {
      type: 'email' as const,
      label: 'Email',
      icon: Mail,
      description: 'Enviar por email'
    }
  ];

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsDialogOpen(true)}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Compartir
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir Oportunidad</DialogTitle>
            <DialogDescription>
              Comparte "{opportunityTitle}" en tus redes sociales o copia el enlace directo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.type}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => handleShare(option.type)}
              >
                <option.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StaticShareButton; 