import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star, Globe, Palette, Code, Briefcase } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioFormData, PORTFOLIO_PLATFORMS } from '@/types/profile';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId?: string; // If provided, we're editing
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  website: <Globe className="h-4 w-4" />,
  behance: <Palette className="h-4 w-4" />,
  dribbble: <Palette className="h-4 w-4" />,
  github: <Code className="h-4 w-4" />,
  other: <Briefcase className="h-4 w-4" />
};

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ 
  isOpen, 
  onClose, 
  portfolioId 
}) => {
  const { portfolios, addPortfolio, updatePortfolio, validatePortfolio } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: '',
    url: '',
    description: '',
    type: 'website',
    is_primary: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!portfolioId;
  const currentPortfolio = portfolios.find(p => p.id === portfolioId);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentPortfolio) {
        setFormData({
          title: currentPortfolio.title,
          url: currentPortfolio.url,
          description: currentPortfolio.description || '',
          type: currentPortfolio.type,
          is_primary: currentPortfolio.is_primary
        });
      } else {
        setFormData({
          title: '',
          url: '',
          description: '',
          type: 'website',
          is_primary: portfolios.length === 0 // First portfolio is primary by default
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, currentPortfolio, portfolios.length]);

  const handleInputChange = (field: keyof PortfolioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validatePortfolio(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (isEditing && portfolioId) {
        success = await updatePortfolio(portfolioId, formData);
      } else {
        success = await addPortfolio(formData);
      }

      if (success) {
        // Small delay to ensure state updates before closing
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const getPlatformIcon = (type: string) => {
    return PLATFORM_ICONS[type] || <Briefcase className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon(formData.type)}
            {isEditing ? 'Editar Portfolio' : 'Agregar Portfolio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Portfolio */}
          <div>
            <Label htmlFor="type">Tipo de Portfolio *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => handleInputChange('type', value)}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORTFOLIO_PLATFORMS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center gap-2">
                      {platform.icon}
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type}</p>
            )}
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: Mi Portfolio Web"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
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
                placeholder="https://mi-portfolio.com"
                className={errors.url ? 'border-red-500 pr-10' : 'pr-10'}
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
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe tu portfolio, tecnologías utilizadas, proyectos destacados..."
              rows={3}
            />
          </div>

          {/* Portfolio Principal */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <Label htmlFor="is_primary" className="text-sm font-medium">
                  Portfolio Principal
                </Label>
                <p className="text-xs text-gray-500">
                  Este será el portfolio que se muestre primero en tu perfil
                </p>
              </div>
            </div>
            <Switch
              id="is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => handleInputChange('is_primary', checked)}
            />
          </div>

          {/* Preview */}
          {formData.title && formData.url && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</h4>
              <div className="flex items-center gap-3">
                {getPlatformIcon(formData.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{formData.title}</p>
                  <p className="text-xs text-gray-500 truncate">{formData.url}</p>
                  {formData.is_primary && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      <Star className="h-3 w-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

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
