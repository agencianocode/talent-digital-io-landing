import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProfessionalCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface Industry {
  id: string;
  name: string;
  description: string;
}

export interface ProfileSuggestions {
  suggested_skills: string[];
  suggested_bio_template: string;
  suggested_title_examples: string[];
  industry_recommendations: string[];
}

export interface CompanyDirectory {
  id: string;
  name: string;
  industry_name: string | null;
  location: string | null;
  is_claimed: boolean;
  logo_url: string | null;
}

export const useProfessionalData = () => {
  const [categories, setCategories] = useState<ProfessionalCategory[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch professional categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.rpc('get_professional_categories');
      if (error) throw error;
      setCategories((data || []) as ProfessionalCategory[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías profesionales');
    }
  };

  // Fetch industries
  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase.rpc('get_industries');
      if (error) throw error;
      setIndustries(data || []);
    } catch (error) {
      console.error('Error fetching industries:', error);
      toast.error('Error al cargar las industrias');
    }
  };

  // Get profile suggestions based on category
  const getProfileSuggestions = useCallback(async (categoryId: string): Promise<ProfileSuggestions | null> => {
    try {
      const { data, error } = await supabase.rpc('get_profile_suggestions', {
        category_id: categoryId
      });
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting profile suggestions:', error);
      toast.error('Error al obtener sugerencias de perfil');
      return null;
    }
  }, []);

  // Search companies in directory
  const searchCompaniesDirectory = async (searchTerm: string = ''): Promise<CompanyDirectory[]> => {
    try {
      const { data, error } = await supabase.rpc('search_companies_directory', {
        search_term: searchTerm
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching companies directory:', error);
      toast.error('Error al buscar empresas');
      return [];
    }
  };

  // Add company to directory
  const addCompanyToDirectory = async (
    companyName: string,
    industryId?: string,
    location?: string,
    website?: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('add_company_to_directory', {
        company_name: companyName,
        company_industry_id: industryId || null,
        company_location: location || null,
        company_website: website || null
      });
      if (error) throw error;
      toast.success('Empresa agregada al directorio');
      return data;
    } catch (error) {
      console.error('Error adding company to directory:', error);
      toast.error('Error al agregar empresa al directorio');
      return null;
    }
  };

  // Claim company from directory
  const claimCompanyFromDirectory = async (
    directoryCompanyId: string,
    userId: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('claim_company_from_directory', {
        directory_company_id: directoryCompanyId,
        user_uuid: userId
      });
      if (error) throw error;
      toast.success('Empresa reclamada exitosamente');
      return data;
    } catch (error) {
      console.error('Error claiming company:', error);
      toast.error('Error al reclamar empresa');
      return null;
    }
  };

  // Update profile completeness
  const updateProfileCompleteness = async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('update_profile_completeness', {
        user_uuid: userId
      });
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error updating profile completeness:', error);
      return 0;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchIndustries()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    categories,
    industries,
    loading,
    getProfileSuggestions,
    searchCompaniesDirectory,
    addCompanyToDirectory,
    claimCompanyFromDirectory,
    updateProfileCompleteness,
    refetchCategories: fetchCategories,
    refetchIndustries: fetchIndustries
  };
};