import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useOpportunitySharing } from '@/hooks/useOpportunitySharing';
import { 
  Share2, 
  Link, 
  MessageCircle, 
  Linkedin, 
  Twitter, 
  Mail
} from 'lucide-react';

interface ShareOpportunityProps {
  opportunityId: string;
  opportunityTitle: string;
  opportunitySlug?: string;
  variant?: 'button' | 'dropdown' | 'card';
}

const ShareOpportunity: React.FC<ShareOpportunityProps> = React.memo(({ 
  opportunityId, 
  opportunityTitle,
  opportunitySlug,
  variant = 'button' 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { shareOpportunity, isLoading } = useOpportunitySharing();

  const handleShare = async (shareType: 'link' | 'whatsapp' | 'linkedin' | 'twitter' | 'email') => {
    try {
      await shareOpportunity(opportunityId, shareType, undefined, opportunitySlug);
      if (shareType === 'link') {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error sharing:', error);
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

  const ShareButton = () => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setIsDialogOpen(true)}
      disabled={isLoading}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Compartir
    </Button>
  );

  const ShareDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shareOptions.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onClick={() => handleShare(option.type)}
            disabled={isLoading}
          >
            <option.icon className="h-4 w-4 mr-2" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ShareDialog = () => (
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
              disabled={isLoading}
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
  );

  // Render based on variant
  switch (variant) {
    case 'dropdown':
      return (
        <>
          <ShareDropdown />
          <ShareDialog />
        </>
      );
    default:
      return (
        <>
          <ShareButton />
          <ShareDialog />
        </>
      );
  }
});

export default ShareOpportunity; 