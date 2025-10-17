import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Youtube, 
  Facebook, 
  Github, 
  MessageCircle, 
  Mail,
  Globe
} from 'lucide-react';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { SocialLinkFormData, SOCIAL_PLATFORMS } from '@/types/profile';

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkId?: string; // If provided, we're editing
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  other: <Globe className="h-4 w-4" />
};

export const SocialLinksModal: React.FC<SocialLinksModalProps> = ({ 
  isOpen, 
  onClose, 
  linkId 
}) => {
  const { socialLinks, addSocialLink, updateSocialLink, validateSocialLink } = useSocialLinks();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SocialLinkFormData>({
    platform: 'linkedin',
    url: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!linkId;
  const currentLink = socialLinks.find(link => link.id === linkId);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentLink) {
        setFormData({
          platform: currentLink.platform,
          url: currentLink.url
        });
      } else {
        setFormData({
          platform: 'linkedin',
          url: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, currentLink]);

  const handleInputChange = (field: keyof SocialLinkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateSocialLink(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (isEditing && linkId) {
        success = await updateSocialLink(linkId, formData);
      } else {
        success = await addSocialLink(formData);
      }

      if (success) {
        // Small delay to ensure state updates before closing
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving social link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const getPlatformIcon = (platform: string) => {
    return PLATFORM_ICONS[platform] || <Globe className="h-4 w-4" />;
  };

  const getAvailablePlatforms = () => {
    const usedPlatforms = socialLinks.map(link => link.platform);
    return SOCIAL_PLATFORMS.filter(platform => 
      !usedPlatforms.includes(platform.value) || (isEditing && currentLink?.platform === platform.value)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon(formData.platform)}
            {isEditing ? 'Editar Red Social' : 'Agregar Red Social'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selection */}
          <div>
            <Label htmlFor="platform">Plataforma *</Label>
            <Select
              value={formData.platform}
              onValueChange={(value: any) => handleInputChange('platform', value)}
            >
              <SelectTrigger className={errors.platform ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailablePlatforms().map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center gap-2">
                      {platform.icon}
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-sm text-red-500 mt-1">{errors.platform}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <Label htmlFor="url">URL *</Label>
            <div className="relative">
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://..."
                className={`pr-10 ${errors.url ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => {
                  if (formData.url) {
                    window.open(formData.url, '_blank');
                  }
                }}
                disabled={!formData.url}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            {errors.url && (
              <p className="text-sm text-red-500 mt-1">{errors.url}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: https://linkedin.com/in/tu-perfil
            </p>
          </div>

          {/* Preview */}
          {formData.platform && formData.url && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</h4>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getPlatformIcon(formData.platform)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {SOCIAL_PLATFORMS.find(p => p.value === formData.platform)?.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{formData.url}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Enlace
                </Badge>
              </div>
            </div>
          )}

          {/* Platform Examples */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Ejemplos de URLs válidas:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• LinkedIn: https://linkedin.com/in/tu-perfil</li>
              <li>• Twitter: https://twitter.com/tu-usuario</li>
              <li>• Instagram: https://instagram.com/tu-usuario</li>
              <li>• YouTube: https://youtube.com/c/tu-canal</li>
              <li>• GitHub: https://github.com/tu-usuario</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Agregar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
