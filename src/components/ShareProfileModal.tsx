import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  Mail,
  Download
} from 'lucide-react';
import { useProfileSharing } from '@/hooks/useProfileSharing';
import { toast } from 'sonner';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHARE_PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="h-4 w-4" />,
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <Twitter className="h-4 w-4" />,
    color: 'bg-blue-400 hover:bg-blue-500',
    textColor: 'text-white'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="h-4 w-4" />,
    color: 'bg-blue-700 hover:bg-blue-800',
    textColor: 'text-white'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <MessageCircle className="h-4 w-4" />,
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: <MessageCircle className="h-4 w-4" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white'
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="h-4 w-4" />,
    color: 'bg-gray-600 hover:bg-gray-700',
    textColor: 'text-white'
  }
];

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { 
    shareData, 
    generatePublicUrl, 
    copyToClipboard, 
    shareViaNative, 
    shareViaSocial,
    getShareData,
    isNativeShareSupported,
    isClipboardSupported
  } = useProfileSharing();

  const [publicUrl, setPublicUrl] = useState('');

  // Load share data when modal opens
  useEffect(() => {
    if (isOpen) {
      const url = generatePublicUrl();
      setPublicUrl(url);
      getShareData();
    }
  }, [isOpen, generatePublicUrl, getShareData]);

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(publicUrl);
    if (success) {
      toast.success('URL copiada al portapapeles');
    }
  };

  const handleNativeShare = async () => {
    const success = await shareViaNative(publicUrl, 'Mi Perfil de Talento');
    if (success) {
      toast.success('Perfil compartido correctamente');
    }
  };

  const handleSocialShare = (platform: string) => {
    shareViaSocial(platform, publicUrl, 'Mi Perfil de Talento');
    toast.success(`Compartiendo en ${platform}`);
  };

  const handleDownloadQR = () => {
    if (shareData?.qr_code) {
      const link = document.createElement('a');
      link.href = shareData.qr_code;
      link.download = 'mi-perfil-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Código QR descargado');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL del Perfil */}
          <div className="space-y-2">
            <Label htmlFor="profile-url">URL de tu Perfil</Label>
            <div className="flex gap-2">
              <Input
                id="profile-url"
                value={publicUrl}
                readOnly
                className="flex-1"
              />
              {typeof isClipboardSupported === 'function' ? isClipboardSupported() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                className="px-3"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Comparte este enlace para que otros puedan ver tu perfil profesional
            </p>
          </div>

          {/* Compartir Nativo */}
          {(typeof isNativeShareSupported === 'function' ? isNativeShareSupported() : isNativeShareSupported) && (
            <div className="space-y-2">
              <Label>Compartir con Apps</Label>
              <Button
                onClick={handleNativeShare}
                className="w-full"
                variant="outline"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir con Apps del Sistema
              </Button>
            </div>
          )}

          {/* Redes Sociales */}
          <div className="space-y-3">
            <Label>Compartir en Redes Sociales</Label>
            <div className="grid grid-cols-2 gap-2">
              {SHARE_PLATFORMS.map((platform) => (
                <Button
                  key={platform.id}
                  onClick={() => handleSocialShare(platform.id)}
                  className={`${platform.color} ${platform.textColor} justify-start`}
                  size="sm"
                >
                  {platform.icon}
                  <span className="ml-2">{platform.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Código QR */}
          {shareData?.qr_code && (
            <div className="space-y-3">
              <Label>Código QR</Label>
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-white border rounded-lg">
                  <img
                    src={shareData.qr_code}
                    alt="Código QR del perfil"
                    className="w-32 h-32"
                  />
                </div>
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar QR
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Escanea este código QR para acceder directamente a tu perfil
                </p>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          {shareData && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Estadísticas de Compartir
              </h4>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  <Share2 className="h-3 w-3 mr-1" />
                  {shareData.share_count} compartidos
                </Badge>
                <Badge variant="outline">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Perfil Público
                </Badge>
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Consejos para Compartir
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Comparte en LinkedIn para oportunidades profesionales</li>
              <li>• Usa el código QR en tarjetas de presentación</li>
              <li>• Incluye el enlace en tu firma de email</li>
              <li>• Comparte en redes sociales para mayor visibilidad</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
