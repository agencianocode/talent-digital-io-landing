import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  TalentExperience, 
  ExperienceFormData 
} from '@/types/profile';
import { toast } from 'sonner';

// Temporary hook that works with current database structure
// This will be replaced once the new tables are created
export const useExperience = () => {
  const { user } = useSupabaseAuth();
  const [experiences, setExperiences] = useState<TalentExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, return empty experiences until new tables are created
  const fetchExperiences = useCallback(async () => {
    setExperiences([]);
  }, []);

  const addExperience = useCallback(async (data: ExperienceFormData): Promise<boolean> => {
    toast.info('Funcionalidad de experiencia estará disponible pronto');
    return false;
  }, []);

  const updateExperience = useCallback(async (id: string, data: Partial<ExperienceFormData>): Promise<boolean> => {
    toast.info('Funcionalidad de experiencia estará disponible pronto');
    return false;
  }, []);

  const deleteExperience = useCallback(async (id: string): Promise<boolean> => {
    toast.info('Funcionalidad de experiencia estará disponible pronto');
    return false;
  }, []);

  const validateExperience = useCallback((data: ExperienceFormData): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.company || data.company.trim().length < 2) {
      errors.company = 'El nombre de la empresa debe tener al menos 2 caracteres';
    }

    if (!data.position || data.position.trim().length < 2) {
      errors.position = 'El puesto debe tener al menos 2 caracteres';
    }

    if (!data.start_date) {
      errors.start_date = 'La fecha de inicio es requerida';
    }

    if (!data.current && !data.end_date) {
      errors.end_date = 'La fecha de fin es requerida si no es trabajo actual';
    }

    if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
      errors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const getCurrentExperience = useCallback((): TalentExperience | null => {
    return experiences.find(exp => exp.current) || null;
  }, [experiences]);

  const getTotalYearsExperience = useCallback((): number => {
    if (experiences.length === 0) return 0;

    let totalMonths = 0;

    experiences.forEach(exp => {
      const startDate = new Date(exp.start_date);
      const endDate = exp.current ? new Date() : new Date(exp.end_date!);
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      
      totalMonths += months;
    });

    return Math.round(totalMonths / 12);
  }, [experiences]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  return {
    experiences,
    loading,
    error,
    addExperience,
    updateExperience,
    deleteExperience,
    validateExperience,
    getCurrentExperience,
    getTotalYearsExperience,
    refreshExperiences: fetchExperiences
  };
};
