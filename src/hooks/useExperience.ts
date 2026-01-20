import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  TalentExperience, 
  ExperienceFormData 
} from '@/types/profile';
import { toast } from 'sonner';

export const useExperience = () => {
  const { user } = useSupabaseAuth();
  const [experiences, setExperiences] = useState<TalentExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    if (!user) {
      console.warn('⚠️ fetchExperiences: No user found');
      return;
    }
    
    console.log('🔄 Fetching experiences for user:', user.id, user.email);
    setLoading(true);
    try {
      // @ts-ignore - talent_experiences table exists but types not yet generated
      const { data, error } = await supabase
        .from('talent_experiences' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching experiences:', error);
        throw error;
      }
      
      console.log('📊 Fetched experiences for user', user.id, ':', data?.length || 0, 'items');
      console.log('📊 Experiences data:', data);
      
      setExperiences(data as any || []);
    } catch (err: any) {
      console.error('Error fetching experiences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addExperience = useCallback(async (data: ExperienceFormData): Promise<boolean> => {
    if (!user) return false;
    
    console.log('➕ Adding experience:', data);
    
    try {
      // @ts-ignore - talent_experiences table exists but types not yet generated
      const { data: insertedData, error } = await supabase
        .from('talent_experiences' as any)
        .insert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Experience added successfully:', insertedData);
      toast.success('Experiencia agregada exitosamente');
      
      // Track activity
      try {
        await supabase.rpc('update_last_activity');
      } catch (e) { /* silent */ }
      
      // Update state immediately with the new data
      setExperiences(prev => {
        const newExperiences = [...prev, insertedData as any];
        console.log('🔄 Updated experiences state:', newExperiences);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('experienceUpdated', { 
          detail: { count: newExperiences.length } 
        }));
        
        return newExperiences;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error adding experience:', err);
      toast.error('Error al agregar experiencia: ' + err.message);
      return false;
    }
  }, [user]);

  const updateExperience = useCallback(async (id: string, data: Partial<ExperienceFormData>): Promise<boolean> => {
    if (!user) return false;
    
    console.log('✏️ Updating experience:', id, data);
    
    try {
      // @ts-ignore - talent_experiences table exists but types not yet generated
      const { data: updatedData, error } = await supabase
        .from('talent_experiences' as any)
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Experience updated successfully:', updatedData);
      toast.success('Experiencia actualizada exitosamente');
      
      // Update state immediately with the updated data
      setExperiences(prev => {
        const newExperiences = prev.map(exp => 
          exp.id === id ? { ...exp, ...(updatedData as any) } : exp
        );
        console.log('🔄 Updated experiences state:', newExperiences);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('experienceUpdated', { 
          detail: { count: newExperiences.length } 
        }));
        
        return newExperiences;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating experience:', err);
      toast.error('Error al actualizar experiencia: ' + err.message);
      return false;
    }
  }, [user]);

  const deleteExperience = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    console.log('🗑️ Deleting experience:', id);
    
    try {
      // @ts-ignore - talent_experiences table exists but types not yet generated
      const { error } = await supabase
        .from('talent_experiences' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Experience deleted successfully');
      toast.success('Experiencia eliminada exitosamente');
      
      // Update state immediately by removing the deleted item
      setExperiences(prev => {
        const newExperiences = prev.filter(exp => exp.id !== id);
        console.log('🔄 Updated experiences state:', newExperiences);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('experienceUpdated', { 
          detail: { count: newExperiences.length } 
        }));
        
        return newExperiences;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting experience:', err);
      toast.error('Error al eliminar experiencia: ' + err.message);
      return false;
    }
  }, [user]);

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

    if (!data.current && (!data.end_date || data.end_date.trim() === '')) {
      errors.end_date = 'La fecha de fin es requerida si no es trabajo actual';
    }

    if (data.start_date && data.end_date && data.end_date.trim() !== '' && new Date(data.start_date) > new Date(data.end_date)) {
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
    if (user) {
      fetchExperiences();
    }
  }, [user?.id]); // Solo depende del ID del usuario, no de la función

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
