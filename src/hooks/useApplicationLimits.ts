import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth, UserRole, isBusinessRole } from '@/contexts/SupabaseAuthContext';

export interface ApplicationLimit {
  limit: number;
  current: number;
  remaining: number;
  canApply: boolean;
}

/**
 * Función utilitaria para verificar el límite de postulaciones mensuales de un talento
 * Puede ser usada directamente sin ser un hook
 */
export const checkTalentApplicationLimit = async (
  userId: string,
  userRole: UserRole | null
): Promise<ApplicationLimit> => {
  if (!userId || !userRole) {
    return { limit: 0, current: 0, remaining: 0, canApply: true };
  }

  try {
    // Determinar si es premium o freemium
    const isPremium = userRole === 'premium_talent';
    // Si es 'talent' sin prefijo, tratarlo como freemium
    const isFreemium = userRole === 'talent' || userRole === 'freemium_talent';
    
    if (!isFreemium && !isPremium) {
      // Si no es talento, permitir aplicaciones sin límite
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }

    // Obtener límite desde admin_settings
    const limitKey = isPremium 
      ? 'max_applications_per_month_talent_premium'
      : 'max_applications_per_month_talent_freemium';

    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('key, value')
      .eq('category', 'system')
      .eq('key', limitKey)
      .maybeSingle();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching application limit:', settingsError);
      // En caso de error, permitir aplicaciones (fail open)
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }

    const limit = settings ? parseInt(settings.value || '0', 10) : 0;

    // Si el límite es 0, significa ilimitado
    if (limit === 0) {
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }

    // Contar postulaciones del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { count, error: countError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (countError) {
      console.error('Error counting applications:', countError);
      // En caso de error, permitir aplicaciones (fail open)
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }

    const current = count || 0;
    const remaining = Math.max(0, limit - current);
    const canApply = current < limit;

    return { limit, current, remaining, canApply };
  } catch (error) {
    console.error('Error checking application limit:', error);
    // En caso de error, permitir aplicaciones (fail open)
    return { limit: 0, current: 0, remaining: 0, canApply: true };
  }
};

/**
 * Función utilitaria para verificar el límite de postulaciones mensuales de una empresa
 * Puede ser usada directamente sin ser un hook
 */
export const checkCompanyApplicationLimit = async (
  companyId: string,
  userRole?: UserRole | null
): Promise<ApplicationLimit> => {
    if (!companyId) {
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }

    try {
      // Determinar si la empresa es premium o freemium basándose en el rol del usuario
      // Si no se proporciona el rol, intentar obtenerlo del usuario asociado a la empresa
      let companyUserRole = userRole;
      
      if (!companyUserRole) {
        // Buscar el rol del usuario dueño de la empresa
        const { data: companyData } = await supabase
          .from('companies')
          .select('user_id')
          .eq('id', companyId)
          .maybeSingle();

        if (companyData?.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', companyData.user_id)
            .maybeSingle();
          
          companyUserRole = profile?.role as UserRole | null;
        }
      }

      // Determinar si es premium o freemium
      const isPremium = companyUserRole === 'premium_business';
      const isFreemium = companyUserRole === 'freemium_business' || 
                         companyUserRole === 'business' || 
                         companyUserRole === 'academy_premium';

      // Si no es un rol de empresa conocido, usar freemium por defecto
      const limitKey = isPremium 
        ? 'max_applications_per_month_company_premium'
        : 'max_applications_per_month_company_freemium';

      // Obtener límite desde admin_settings
      const { data: settings, error: settingsError } = await supabase
        .from('admin_settings')
        .select('key, value')
        .eq('category', 'system')
        .eq('key', limitKey)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching application limit:', settingsError);
        // En caso de error, permitir aplicaciones (fail open)
        return { limit: 0, current: 0, remaining: 0, canApply: true };
      }

      const limit = settings ? parseInt(settings.value || '0', 10) : 0;

      // Si el límite es 0, significa ilimitado
      if (limit === 0) {
        return { limit: 0, current: 0, remaining: 0, canApply: true };
      }

      // Contar postulaciones recibidas por la empresa en el mes actual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { count, error: countError } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities!inner(company_id)
        `, { count: 'exact', head: true })
        .eq('opportunities.company_id', companyId)
        .gte('created_at', startOfMonth.toISOString());

      if (countError) {
        console.error('Error counting applications:', countError);
        // En caso de error, permitir aplicaciones (fail open)
        return { limit: 0, current: 0, remaining: 0, canApply: true };
      }

      const current = count || 0;
      const remaining = Math.max(0, limit - current);
      const canApply = current < limit;

      return { limit, current, remaining, canApply };
    } catch (error) {
      console.error('Error checking company application limit:', error);
      // En caso de error, permitir aplicaciones (fail open)
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }
};

/**
 * Hook para usar las funciones de verificación de límites
 * Útil si necesitas el estado de carga o si quieres usar el hook directamente
 */
export const useApplicationLimits = () => {
  const { user, userRole } = useSupabaseAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkTalentLimit = useCallback(async (): Promise<ApplicationLimit> => {
    if (!user || !userRole) {
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }

    setIsChecking(true);
    try {
      return await checkTalentApplicationLimit(user.id, userRole);
    } finally {
      setIsChecking(false);
    }
  }, [user, userRole]);

  const checkCompanyLimit = useCallback(async (companyId: string, companyUserRole?: UserRole | null): Promise<ApplicationLimit> => {
    if (!companyId) {
      return { limit: 0, current: 0, remaining: 0, canApply: true };
    }

    setIsChecking(true);
    try {
      // Usar el rol proporcionado o el rol del usuario actual si es de tipo business
      const roleToUse = companyUserRole || (isBusinessRole(userRole) ? userRole : null);
      return await checkCompanyApplicationLimit(companyId, roleToUse);
    } finally {
      setIsChecking(false);
    }
  }, [userRole]);

  return {
    checkTalentApplicationLimit: checkTalentLimit,
    checkCompanyApplicationLimit: checkCompanyLimit,
    isChecking
  };
};

