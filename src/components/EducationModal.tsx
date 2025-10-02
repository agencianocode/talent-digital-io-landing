import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, GraduationCap, BookOpen, Clock } from 'lucide-react';
import { useEducation } from '@/hooks/useEducation';
import { EducationFormData } from '@/types/profile';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationId?: string; // If provided, we're editing
}

const DEGREE_TYPES = [
  'Bachillerato',
  'Técnico',
  'Tecnólogo',
  'Pregrado',
  'Licenciatura',
  'Ingeniería',
  'Maestría',
  'Especialización',
  'Doctorado',
  'Postdoctorado',
  'Certificación',
  'Diplomado',
  'Curso',
  'Otro'
];

export const EducationModal: React.FC<EducationModalProps> = ({ 
  isOpen, 
  onClose, 
  educationId 
}) => {
  const { education, addEducation, updateEducation, validateEducation } = useEducation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EducationFormData>({
    institution: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: '',
    description: '',
    current: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!educationId;
  const currentEducation = education.find(edu => edu.id === educationId);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentEducation) {
        setFormData({
          institution: currentEducation.institution,
          degree: currentEducation.degree,
          field: currentEducation.field || '',
          start_date: currentEducation.start_date,
          end_date: currentEducation.end_date || '',
          description: currentEducation.description || '',
          current: currentEducation.current
        });
      } else {
        setFormData({
          institution: '',
          degree: '',
          field: '',
          start_date: '',
          end_date: '',
          description: '',
          current: false
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, currentEducation]);

  const handleInputChange = (field: keyof EducationFormData, value: any) => {
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
    
    // Validate form data
    const validation = validateEducation(cleanedFormData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (isEditing && educationId) {
        success = await updateEducation(educationId, cleanedFormData);
      } else {
        success = await addEducation(cleanedFormData);
      }

      if (success) {
        // Small delay to ensure state updates before closing
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving education:', error);
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
            <GraduationCap className="h-5 w-5" />
            {isEditing ? 'Editar Educación' : 'Agregar Educación'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Institución */}
          <div>
            <Label htmlFor="institution">Institución *</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                placeholder="Nombre de la universidad o institución"
                className={`pl-10 ${errors.institution ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.institution && (
              <p className="text-sm text-red-500 mt-1">{errors.institution}</p>
            )}
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="degree">Título *</Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                placeholder="Ej: Ingeniería de Sistemas"
                className={`pl-10 ${errors.degree ? 'border-red-500' : ''}`}
                list="degree-types"
              />
              <datalist id="degree-types">
                {DEGREE_TYPES.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
            {errors.degree && (
              <p className="text-sm text-red-500 mt-1">{errors.degree}</p>
            )}
          </div>

          {/* Campo de Estudio */}
          <div>
            <Label htmlFor="field">Campo de Estudio</Label>
            <Input
              id="field"
              value={formData.field}
              onChange={(e) => handleInputChange('field', e.target.value)}
              placeholder="Ej: Ciencias de la Computación, Marketing Digital"
            />
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
                  value={formData.end_date}
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

          {/* Educación Actual */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <Label htmlFor="current" className="text-sm font-medium">
                  Educación Actual
                </Label>
                <p className="text-xs text-gray-500">
                  Marca si actualmente estás estudiando
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
              placeholder="Menciona logros académicos, proyectos destacados, GPA, etc..."
              rows={3}
            />
          </div>

          {/* Preview */}
          {formData.institution && formData.degree && formData.start_date && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formData.institution}</span>
                  {formData.current && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Actual
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.degree}</span>
                  {formData.field && (
                    <span className="text-sm text-gray-500">- {formData.field}</span>
                  )}
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
