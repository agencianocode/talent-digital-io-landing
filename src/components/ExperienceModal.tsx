import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Building, Briefcase, Clock } from 'lucide-react';
import { useExperience } from '@/hooks/useExperience';
import { ExperienceFormData } from '@/types/profile';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceId?: string; // If provided, we're editing
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({ 
  isOpen, 
  onClose, 
  experienceId 
}) => {
  const { experiences, addExperience, updateExperience, validateExperience } = useExperience();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    current: false,
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!experienceId;
  const currentExperience = experiences.find(exp => exp.id === experienceId);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentExperience) {
        setFormData({
          company: currentExperience.company,
          position: currentExperience.position,
          start_date: currentExperience.start_date,
          end_date: currentExperience.end_date || '',
          description: currentExperience.description || '',
          current: currentExperience.current,
          location: currentExperience.location || ''
        });
      } else {
        setFormData({
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          description: '',
          current: false,
          location: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, currentExperience]);

  const handleInputChange = (field: keyof ExperienceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up form data before validation
    const cleanedFormData = {
      ...formData,
      end_date: formData.current ? null : (formData.end_date || null)
    };
    
    console.log('🧹 ExperienceModal - Cleaned form data:', cleanedFormData);
    
    // Validate form data
    const validation = validateExperience(cleanedFormData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (isEditing && experienceId) {
        success = await updateExperience(experienceId, cleanedFormData);
      } else {
        success = await addExperience(cleanedFormData);
      }

      if (success) {
        // Small delay to ensure state updates before closing
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDuration = () => {
    if (!formData.start_date) return '';
    
    const startDate = new Date(formData.start_date);
    const endDate = formData.current ? new Date() : new Date(formData.end_date || '');
    
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    
    let duration = '';
    if (years > 0) {
      duration += `${years} año${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (duration) duration += ' y ';
      duration += `${months} mes${months > 1 ? 'es' : ''}`;
    }
    
    return duration || 'Menos de 1 mes';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {isEditing ? 'Editar Experiencia' : 'Agregar Experiencia'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Empresa */}
          <div>
            <Label htmlFor="company">Empresa *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Nombre de la empresa"
                className={`pl-10 ${errors.company ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.company && (
              <p className="text-sm text-red-500 mt-1">{errors.company}</p>
            )}
          </div>

          {/* Puesto */}
          <div>
            <Label htmlFor="position">Puesto *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Tu puesto o rol"
                className={`pl-10 ${errors.position ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.position && (
              <p className="text-sm text-red-500 mt-1">{errors.position}</p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <Label htmlFor="location">Ubicación</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad, País"
                className="pl-10"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Fecha de Inicio *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={`pl-10 ${errors.start_date ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.start_date && (
                <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  disabled={formData.current}
                  className={`pl-10 ${errors.end_date ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.end_date && (
                <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Trabajo Actual */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <Label htmlFor="current" className="text-sm font-medium">
                  Trabajo Actual
                </Label>
                <p className="text-xs text-gray-500">
                  Marca si actualmente trabajas aquí
                </p>
              </div>
            </div>
            <Switch
              id="current"
              checked={formData.current}
              onCheckedChange={(checked) => handleInputChange('current', checked)}
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe tus responsabilidades, logros y tecnologías utilizadas..."
              rows={4}
            />
          </div>

          {/* Preview */}
          {formData.company && formData.position && formData.start_date && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formData.company}</span>
                  {formData.current && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Actual
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {formatDate(formData.start_date)} - {formData.current ? 'Presente' : formatDate(formData.end_date || '')}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {getDuration()}
                  </Badge>
                </div>
                {formData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formData.location}</span>
                  </div>
                )}
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
