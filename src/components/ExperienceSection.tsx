import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  Calendar,
  MapPin,
  MoreVertical,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExperienceModal } from './ExperienceModal';
import { useExperience } from '@/hooks/useExperience';
import { toast } from 'sonner';

export const ExperienceSection: React.FC = () => {
  const { experiences, deleteExperience } = useExperience();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<string | undefined>();

  const handleAddExperience = () => {
    setEditingExperience(undefined);
    setIsModalOpen(true);
  };

  const handleEditExperience = (experienceId: string) => {
    setEditingExperience(experienceId);
    setIsModalOpen(true);
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta experiencia?')) {
      const success = await deleteExperience(experienceId);
      if (success) {
        toast.success('Experiencia eliminada correctamente');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getDuration = (startDate: string, endDate: string | null, current: boolean) => {
    const start = new Date(startDate);
    const end = current ? new Date() : new Date(endDate || '');
    
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    
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
    <div className="space-y-4">

      {/* Experience List */}
      {experiences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No tienes experiencia agregada
            </h4>
            <p className="text-sm text-gray-600 text-center mb-4">
              Agrega tu experiencia laboral para mostrar tu trayectoria profesional
            </p>
            <Button onClick={handleAddExperience}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar tu Primera Experiencia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <Card key={experience.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{experience.company}</CardTitle>
                      <p className="text-sm text-gray-600">{experience.position}</p>
                    </div>
                    {experience.current && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Actual
                      </Badge>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditExperience(experience.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Duration */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(experience.start_date)} - {experience.current ? 'Presente' : formatDate(experience.end_date || '')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getDuration(experience.start_date, experience.end_date, experience.current)}
                    </Badge>
                  </div>

                  {/* Location */}
                  {experience.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{experience.location}</span>
                    </div>
                  )}

                  {/* Description */}
                  {experience.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {experience.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        experienceId={editingExperience}
      />
    </div>
  );
};
