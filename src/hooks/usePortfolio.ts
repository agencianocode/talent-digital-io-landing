import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  TalentPortfolio, 
  PortfolioFormData 
} from '@/types/profile';
import { toast } from 'sonner';

export const usePortfolio = () => {
  const { user } = useSupabaseAuth();
  const [portfolios, setPortfolios] = useState<TalentPortfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    if (!user) return;
    
    console.log('🔄 Fetching portfolios for user:', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('talent_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('📊 Fetched portfolios:', data);
      setPortfolios(data || []);
    } catch (err: any) {
      console.error('Error fetching portfolios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addPortfolio = useCallback(async (data: PortfolioFormData): Promise<boolean> => {
    if (!user) return false;
    
    console.log('➕ Adding portfolio:', data);
    
    try {
      // If this is being set as primary, unset other primary portfolios
      if (data.is_primary) {
        await supabase
          .from('talent_portfolios')
          .update({ is_primary: false })
          .eq('user_id', user.id);
      }

      const { data: insertedData, error } = await supabase
        .from('talent_portfolios')
        .insert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Portfolio added successfully:', insertedData);
      toast.success('Portfolio agregado exitosamente');
      
      // Update state immediately with the new data
      setPortfolios(prev => {
        const newPortfolios = [...prev, insertedData];
        console.log('🔄 Updated portfolios state:', newPortfolios);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { 
          detail: { count: newPortfolios.length } 
        }));
        
        return newPortfolios;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error adding portfolio:', err);
      toast.error('Error al agregar portfolio: ' + err.message);
      return false;
    }
  }, [user]);

  const updatePortfolio = useCallback(async (id: string, data: Partial<PortfolioFormData>): Promise<boolean> => {
    if (!user) return false;
    
    console.log('✏️ Updating portfolio:', id, data);
    
    try {
      // If this is being set as primary, unset other primary portfolios
      if (data.is_primary) {
        await supabase
          .from('talent_portfolios')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { data: updatedData, error } = await supabase
        .from('talent_portfolios')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Portfolio updated successfully:', updatedData);
      toast.success('Portfolio actualizado exitosamente');
      
      // Update state immediately with the updated data
      setPortfolios(prev => {
        const newPortfolios = prev.map(portfolio => 
          portfolio.id === id ? { ...portfolio, ...updatedData } : portfolio
        );
        console.log('🔄 Updated portfolios state:', newPortfolios);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { 
          detail: { count: newPortfolios.length } 
        }));
        
        return newPortfolios;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating portfolio:', err);
      toast.error('Error al actualizar portfolio: ' + err.message);
      return false;
    }
  }, [user]);

  const deletePortfolio = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    console.log('🗑️ Deleting portfolio:', id);
    
    try {
      const { error } = await supabase
        .from('talent_portfolios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Portfolio deleted successfully');
      toast.success('Portfolio eliminado exitosamente');
      
      // Update state immediately by removing the deleted item
      setPortfolios(prev => {
        const newPortfolios = prev.filter(portfolio => portfolio.id !== id);
        console.log('🔄 Updated portfolios state:', newPortfolios);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { 
          detail: { count: newPortfolios.length } 
        }));
        
        return newPortfolios;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting portfolio:', err);
      toast.error('Error al eliminar portfolio: ' + err.message);
      return false;
    }
  }, [user]);

  const setPrimaryPortfolio = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Unset all primary portfolios first
      await supabase
        .from('talent_portfolios')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Set the selected one as primary
      const { error } = await supabase
        .from('talent_portfolios')
        .update({ is_primary: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Primary portfolio updated successfully');
      toast.success('Portfolio principal actualizado');
      
      // Update state immediately by updating all portfolios
      setPortfolios(prev => {
        const newPortfolios = prev.map(portfolio => ({
          ...portfolio,
          is_primary: portfolio.id === id
        }));
        console.log('🔄 Updated portfolios state:', newPortfolios);
        
        // Dispatch custom event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { 
          detail: { count: newPortfolios.length } 
        }));
        
        return newPortfolios;
      });
      
      return true;
    } catch (err: any) {
      console.error('Error setting primary portfolio:', err);
      toast.error('Error al establecer portfolio principal: ' + err.message);
      return false;
    }
  }, [user]);

  const validatePortfolio = useCallback((data: PortfolioFormData): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.title || data.title.trim().length < 2) {
      errors.title = 'El título debe tener al menos 2 caracteres';
    }

    if (!data.url || !isValidUrl(data.url)) {
      errors.url = 'URL no válida';
    }

    if (!data.type) {
      errors.type = 'Debes seleccionar un tipo de portfolio';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getPrimaryPortfolio = useCallback((): TalentPortfolio | null => {
    return portfolios.find(p => p.is_primary) || portfolios[0] || null;
  }, [portfolios]);

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user?.id]); // Solo depende del ID del usuario, no de la función

  return {
    portfolios,
    loading,
    error,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    setPrimaryPortfolio,
    validatePortfolio,
    getPrimaryPortfolio,
    refreshPortfolios: fetchPortfolios
  };
};
