import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  MapPin,
  MoreVertical
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
  const [showAllExperiences, setShowAllExperiences] = useState(false);

  console.log('🎨 ExperienceSection render - experiences count:', experiences.length);

  // LinkedIn-style: show only first 3 experiences by default
  const MAX_INITIAL_EXPERIENCES = 3;
  const displayedExperiences = showAllExperiences 
    ? experiences 
    : experiences.slice(0, MAX_INITIAL_EXPERIENCES);
  const hasMoreExperiences = experiences.length > MAX_INITIAL_EXPERIENCES;

  const handleAddExperience = () => {
    setEditingExperience(undefined);
    setIsModalOpen(true);
  };

  const handleShowAllExperiences = () => {
    setShowAllExperiences(true);
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
    <div className="space-y-4 h-full">

      {/* Experience List */}
      {experiences.length === 0 ? (
        <Card className="border-dashed border-2 bg-gradient-to-br from-green-50/50 to-emerald-50/50 h-full">
          <CardContent className="flex flex-col items-center justify-center py-10 h-full">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <Building className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes experiencia agregada
            </h4>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
              Agrega tu experiencia laboral para mostrar tu trayectoria profesional
            </p>
            <Button onClick={handleAddExperience} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Experiencia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedExperiences.map((experience) => (
            <div key={experience.id} className="relative group border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              {/* Header compacto */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-1.5 bg-blue-50 rounded-md mt-0.5">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{experience.position}</h4>
                      {experience.current && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200">
                          Actual
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-blue-600 mt-0.5">{experience.company}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-3 w-3" />
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

              {/* Información compacta */}
              <div className="ml-7 space-y-1">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatDate(experience.start_date)} - {experience.current ? 'Presente' : formatDate(experience.end_date || '')}</span>
                  <span className="font-medium">{getDuration(experience.start_date, experience.end_date, experience.current)}</span>
                  {experience.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {experience.location}
                    </span>
                  )}
                </div>

                {/* Descripción truncada */}
                {experience.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                    {experience.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {/* Show All Experiences Button (LinkedIn-style) */}
          {hasMoreExperiences && !showAllExperiences && (
            <div className="text-center py-3">
              <button
                onClick={handleShowAllExperiences}
                className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 mx-auto transition-colors hover:underline"
              >
                <span>Mostrar todas las experiencias ({experiences.length})</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Add More Experience Button - Compact */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleAddExperience}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
            >
              <Plus className="h-4 w-4 group-hover:text-blue-600" />
              <span>Agregar experiencia</span>
            </button>
          </div>
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
