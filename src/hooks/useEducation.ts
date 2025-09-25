import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  TalentEducation, 
  EducationFormData 
} from '@/types/profile';
import { toast } from 'sonner';

// Temporary hook that works with current database structure
// This will be replaced once the new tables are created
export const useEducation = () => {
  const { user } = useSupabaseAuth();
  const [education, setEducation] = useState<TalentEducation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, return empty education until new tables are created
  const fetchEducation = useCallback(async () => {
    setEducation([]);
  }, []);

  const addEducation = useCallback(async (data: EducationFormData): Promise<boolean> => {
    toast.info('Funcionalidad de educación estará disponible pronto');
    return false;
  }, []);

  const updateEducation = useCallback(async (id: string, data: Partial<EducationFormData>): Promise<boolean> => {
    toast.info('Funcionalidad de educación estará disponible pronto');
    return false;
  }, []);

  const deleteEducation = useCallback(async (id: string): Promise<boolean> => {
    toast.info('Funcionalidad de educación estará disponible pronto');
    return false;
  }, []);

  const validateEducation = useCallback((data: EducationFormData): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.institution || data.institution.trim().length < 2) {
      errors.institution = 'El nombre de la institución debe tener al menos 2 caracteres';
    }

    if (!data.degree || data.degree.trim().length < 2) {
      errors.degree = 'El título debe tener al menos 2 caracteres';
    }

    if (!data.start_date) {
      errors.start_date = 'La fecha de inicio es requerida';
    }

    if (!data.current && !data.end_date) {
      errors.end_date = 'La fecha de fin es requerida si no es educación actual';
    }

    if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
      errors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const getCurrentEducation = useCallback((): TalentEducation | null => {
    return education.find(edu => edu.current) || null;
  }, [education]);

  const getHighestDegree = useCallback((): TalentEducation | null => {
    if (education.length === 0) return null;

    // Priority order: PhD > Master > Bachelor > Associate > Other
    const degreePriority = {
      'phd': 5,
      'doctorado': 5,
      'master': 4,
      'maestría': 4,
      'bachelor': 3,
      'licenciatura': 3,
      'associate': 2,
      'técnico': 2,
      'other': 1
    };

    return education.reduce((highest, current) => {
      const currentPriority = degreePriority[current.degree.toLowerCase() as keyof typeof degreePriority] || 1;
      const highestPriority = degreePriority[highest.degree.toLowerCase() as keyof typeof degreePriority] || 1;
      
      return currentPriority > highestPriority ? current : highest;
    });
  }, [education]);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  return {
    education,
    loading,
    error,
    addEducation,
    updateEducation,
    deleteEducation,
    validateEducation,
    getCurrentEducation,
    getHighestDegree,
    refreshEducation: fetchEducation
  };
};
