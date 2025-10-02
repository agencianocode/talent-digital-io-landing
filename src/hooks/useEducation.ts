import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  TalentEducation, 
  EducationFormData 
} from '@/types/profile';
import { toast } from 'sonner';

export const useEducation = () => {
  const { user } = useSupabaseAuth();
  const [education, setEducation] = useState<TalentEducation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEducation = useCallback(async () => {
    if (!user) return;
    
    console.log('🔄 Fetching education for user:', user.id);
    setLoading(true);
    try {
      // @ts-ignore - talent_education table exists but types not yet generated
      const { data, error } = await supabase
        .from('talent_education' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      console.log('📊 Fetched education:', data);
      setEducation((data as TalentEducation[]) || []);
    } catch (err: any) {
      console.error('Error fetching education:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addEducation = useCallback(async (data: EducationFormData): Promise<boolean> => {
    if (!user) return false;
    
    console.log('➕ Adding education:', data);
    
    try {
      // @ts-ignore - talent_education table exists but types not yet generated
      const { data: insertedData, error } = await supabase
        .from('talent_education' as any)
        .insert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Education added successfully:', insertedData);
      toast.success('Educación agregada exitosamente');
      
      // Update state immediately with the new data
      setEducation(prev => {
        const newEducation = [...prev, insertedData as TalentEducation];
        console.log('🔄 Updated education state:', newEducation);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('educationUpdated', { 
          detail: { count: newEducation.length } 
        }));
        
        return newEducation;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error adding education:', err);
      toast.error('Error al agregar educación: ' + err.message);
      return false;
    }
  }, [user]);

  const updateEducation = useCallback(async (id: string, data: Partial<EducationFormData>): Promise<boolean> => {
    if (!user) return false;
    
    console.log('✏️ Updating education:', id, data);
    
    try {
      // @ts-ignore - talent_education table exists but types not yet generated
      const { data: updatedData, error } = await supabase
        .from('talent_education' as any)
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Education updated successfully:', updatedData);
      toast.success('Educación actualizada exitosamente');
      
      // Update state immediately with the updated data
      setEducation(prev => {
        const newEducation = prev.map(edu => 
          edu.id === id ? { ...edu, ...(updatedData as TalentEducation) } : edu
        );
        console.log('🔄 Updated education state:', newEducation);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('educationUpdated', { 
          detail: { count: newEducation.length } 
        }));
        
        return newEducation;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating education:', err);
      toast.error('Error al actualizar educación: ' + err.message);
      return false;
    }
  }, [user]);

  const deleteEducation = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    console.log('🗑️ Deleting education:', id);
    
    try {
      // @ts-ignore - talent_education table exists but types not yet generated
      const { error } = await supabase
        .from('talent_education' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Education deleted successfully');
      toast.success('Educación eliminada exitosamente');
      
      // Update state immediately by removing the deleted item
      setEducation(prev => {
        const newEducation = prev.filter(edu => edu.id !== id);
        console.log('🔄 Updated education state:', newEducation);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('educationUpdated', { 
          detail: { count: newEducation.length } 
        }));
        
        return newEducation;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting education:', err);
      toast.error('Error al eliminar educación: ' + err.message);
      return false;
    }
  }, [user]);

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

    if (!data.current && (!data.end_date || data.end_date.trim() === '')) {
      errors.end_date = 'La fecha de fin es requerida si no es educación actual';
    }

    if (data.start_date && data.end_date && data.end_date.trim() !== '' && new Date(data.start_date) > new Date(data.end_date)) {
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
    if (user) {
      fetchEducation();
    }
  }, [user?.id]); // Solo depende del ID del usuario, no de la función

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
