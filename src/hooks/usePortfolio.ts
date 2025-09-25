import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  TalentPortfolio, 
  PortfolioFormData 
} from '@/types/profile';
import { toast } from 'sonner';

// Temporary hook that works with current database structure
// This will be replaced once the new tables are created
export const usePortfolio = () => {
  const { user } = useSupabaseAuth();
  const [portfolios, setPortfolios] = useState<TalentPortfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, return empty portfolios until new tables are created
  const fetchPortfolios = useCallback(async () => {
    setPortfolios([]);
  }, []);

  const addPortfolio = useCallback(async (data: PortfolioFormData): Promise<boolean> => {
    toast.info('Funcionalidad de portfolios estará disponible pronto');
    return false;
  }, []);

  const updatePortfolio = useCallback(async (id: string, data: Partial<PortfolioFormData>): Promise<boolean> => {
    toast.info('Funcionalidad de portfolios estará disponible pronto');
    return false;
  }, []);

  const deletePortfolio = useCallback(async (id: string): Promise<boolean> => {
    toast.info('Funcionalidad de portfolios estará disponible pronto');
    return false;
  }, []);

  const setPrimaryPortfolio = useCallback(async (id: string): Promise<boolean> => {
    toast.info('Funcionalidad de portfolios estará disponible pronto');
    return false;
  }, []);

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
    fetchPortfolios();
  }, [fetchPortfolios]);

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
