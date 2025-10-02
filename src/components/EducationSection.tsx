import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GraduationCap, 
  MoreVertical,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EducationModal } from './EducationModal';
import { useEducation } from '@/hooks/useEducation';
import { toast } from 'sonner';

export const EducationSection: React.FC = () => {
  const { education, deleteEducation } = useEducation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<string | undefined>();
  const [showAllEducation, setShowAllEducation] = useState(false);

  console.log('🎨 EducationSection render - education count:', education.length);

  // LinkedIn-style: show only first 3 education entries by default
  const MAX_INITIAL_EDUCATION = 3;
  const displayedEducation = showAllEducation 
    ? education 
    : education.slice(0, MAX_INITIAL_EDUCATION);
  const hasMoreEducation = education.length > MAX_INITIAL_EDUCATION;

  const handleAddEducation = () => {
    setEditingEducation(undefined);
    setIsModalOpen(true);
  };

  const handleShowAllEducation = () => {
    setShowAllEducation(true);
  };

  const handleEditEducation = (educationId: string) => {
    setEditingEducation(educationId);
    setIsModalOpen(true);
  };

  const handleDeleteEducation = async (educationId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta educación?')) {
      const success = await deleteEducation(educationId);
      if (success) {
        toast.success('Educación eliminada correctamente');
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

      {/* Education List */}
      {education.length === 0 ? (
        <Card className="border-dashed border-2 bg-gradient-to-br from-purple-50/50 to-pink-50/50 h-full">
          <CardContent className="flex flex-col items-center justify-center py-10 h-full">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <GraduationCap className="h-10 w-10 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes educación agregada
            </h4>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
              Agrega tu formación académica para completar tu perfil profesional
            </p>
            <Button onClick={handleAddEducation} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Educación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedEducation.map((edu) => (
            <div key={edu.id} className="relative group border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              {/* Header compacto */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-1.5 bg-green-50 rounded-md mt-0.5">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{edu.institution}</h4>
                      {edu.current && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Actual
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-green-600 mt-0.5">{edu.degree}</p>
                    {edu.field && (
                      <p className="text-xs text-gray-500">{edu.field}</p>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditEducation(edu.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteEducation(edu.id)}
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
                  <span>{formatDate(edu.start_date)} - {edu.current ? 'Presente' : formatDate(edu.end_date || '')}</span>
                  <span className="font-medium">{getDuration(edu.start_date, edu.end_date, edu.current)}</span>
                </div>

                {/* Descripción truncada */}
                {edu.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                    {edu.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {/* Show All Education Button (LinkedIn-style) */}
          {hasMoreEducation && !showAllEducation && (
            <div className="text-center py-3">
              <button
                onClick={handleShowAllEducation}
                className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 mx-auto transition-colors hover:underline"
              >
                <span>Mostrar toda la educación ({education.length})</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Add More Education Button - Compact */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleAddEducation}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
            >
              <Plus className="h-4 w-4 group-hover:text-green-600" />
              <span>Agregar educación</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <EducationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        educationId={editingEducation}
      />
    </div>
  );
};
