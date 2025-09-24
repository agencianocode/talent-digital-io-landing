import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Star, ThumbsUp, Copy, Check, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PublishJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishToFeed: () => void;
  onKeepPrivate: () => void;
}

const PublishJobModal: React.FC<PublishJobModalProps> = ({
  isOpen,
  onClose,
  onPublishToFeed,
  onKeepPrivate
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header with illustration */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 pb-4">
          <div className="flex justify-center mb-4">
            {/* Illustration area - horizontal layout like image 2 */}
            <div className="bg-white rounded-lg px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600">RECOMENDADOS</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mb-3">Nuevos Candidatos</div>
              
              {/* Real people avatars - horizontal line layout */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex -space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face" 
                    alt="Profile 1" 
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face" 
                    alt="Profile 2" 
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face" 
                    alt="Profile 3" 
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face" 
                    alt="Profile 4" 
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                </div>
                
                {/* Action buttons - on the right side */}
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="h-3 w-3 text-gray-600" />
                  </button>
                  <button className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors">
                    <ThumbsUp className="h-3 w-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Publica tu oferta en el feed de trabajo de Talento Digital
            </DialogTitle>
            <p className="text-sm text-gray-600 leading-relaxed">
              Publicar tu oferta de empleo en el feed te ayudará atraer a los mejores talentos y 
              recibir candidatos seleccionados. Si no la publicas, tendrás que 
              compartirla manualmente e invitar a candidatos de tu red.
            </p>
          </DialogHeader>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={onPublishToFeed}
              className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium"
            >
              Publicar en el feed
            </Button>
            
            <Button
              onClick={onKeepPrivate}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Mantener solo por invitación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Modal para mostrar enlace de invitación
interface InvitationLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationLink: string;
  opportunityTitle: string;
}

export const InvitationLinkModal: React.FC<InvitationLinkModalProps> = ({
  isOpen,
  onClose,
  invitationLink,
  opportunityTitle
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success('¡Enlace copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `¡Oportunidad laboral interesante! ${opportunityTitle}`;
    const url = invitationLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Hola,\n\nTe comparto esta oportunidad laboral que puede interesarte: ${opportunityTitle}\n\n${url}\n\n¡Saludos!`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
              ¡Enlace de invitación generado!
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              Comparte este enlace para invitar candidatos directamente a tu oportunidad
            </p>
          </div>

          {/* Enlace de invitación */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace de invitación
            </label>
            <div className="flex gap-2">
              <Input
                value={invitationLink}
                readOnly
                className="flex-1 bg-gray-50 text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Opciones de compartir */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Compartir en redes sociales</p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOnSocial('facebook')}
                className="flex flex-col items-center p-3 h-auto"
              >
                <Facebook className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-xs">Facebook</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOnSocial('twitter')}
                className="flex flex-col items-center p-3 h-auto"
              >
                <Twitter className="h-5 w-5 text-blue-400 mb-1" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOnSocial('linkedin')}
                className="flex flex-col items-center p-3 h-auto"
              >
                <Linkedin className="h-5 w-5 text-blue-700 mb-1" />
                <span className="text-xs">LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOnSocial('email')}
                className="flex flex-col items-center p-3 h-auto"
              >
                <Mail className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Este enlace te permitirá recibir aplicaciones directas sin que la oportunidad aparezca en el feed público. Perfecto para reclutamiento directo.
            </p>
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublishJobModal;
