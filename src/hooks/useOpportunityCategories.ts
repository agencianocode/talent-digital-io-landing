import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OpportunityCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useOpportunityCategories = () => {
  const [categories, setCategories] = useState<OpportunityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('opportunity_categories')
        .select('id, name, description, created_at, updated_at')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching opportunity categories:', err);
      setError(err.message);
      // Fallback to hardcoded categories if database is not available
      const fallbackCategories: OpportunityCategory[] = [
        { id: 'ventas', name: 'Ventas' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'creativo', name: 'Creativo' },
        { id: 'atencion-cliente', name: 'Atención al Cliente' },
        { id: 'operaciones', name: 'Operaciones' },
        { id: 'tecnologia-automatizaciones', name: 'Tecnología y Automatizaciones' },
        { id: 'soporte-profesional', name: 'Soporte Profesional' }
      ];
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

