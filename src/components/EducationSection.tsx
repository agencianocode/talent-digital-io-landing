import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GraduationCap, 
  Calendar,
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

  const handleAddEducation = () => {
    setEditingEducation(undefined);
    setIsModalOpen(true);
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
    <div className="space-y-4">

      {/* Education List */}
      {education.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No tienes educación agregada
            </h4>
            <p className="text-sm text-gray-600 text-center mb-4">
              Agrega tu formación académica para completar tu perfil profesional
            </p>
            <Button onClick={handleAddEducation}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar tu Primera Educación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <Card key={edu.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{edu.institution}</CardTitle>
                      <p className="text-sm text-gray-600">{edu.degree}</p>
                      {edu.field && (
                        <p className="text-xs text-gray-500">{edu.field}</p>
                      )}
                    </div>
                    {edu.current && (
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
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Duration */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(edu.start_date)} - {edu.current ? 'Presente' : formatDate(edu.end_date || '')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getDuration(edu.start_date, edu.end_date, edu.current)}
                    </Badge>
                  </div>

                  {/* Description */}
                  {edu.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {edu.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
