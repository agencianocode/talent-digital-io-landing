import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AcademyAffiliation {
  academy_id: string;
  academy_name: string;
  status: 'enrolled' | 'graduated';
  graduation_date?: string;
  program_name?: string;
  logo_url?: string;
  brand_color?: string;
}

/**
 * Hook para obtener las afiliaciones de Academia de un usuario
 * basándose en su email
 */
export const useAcademyAffiliations = (userEmail: string | undefined) => {
  const [affiliations, setAffiliations] = useState<AcademyAffiliation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      console.log('⚠️ useAcademyAffiliations: No email provided');
      setAffiliations([]);
      return;
    }

    console.log('🔍 useAcademyAffiliations: Fetching for email:', userEmail);

    const fetchAffiliations = async () => {
      try {
        setIsLoading(true);

        // Buscar en academy_students por email y hacer JOIN con companies para obtener info de la academia
        const { data, error } = await supabase
          .from('academy_students')
          .select(`
            academy_id,
            status,
            graduation_date,
            program_name,
            companies!academy_students_academy_id_fkey (
              name,
              logo_url,
              brand_color
            )
          `)
          .eq('student_email', userEmail);

        if (error) {
          console.error('❌ useAcademyAffiliations error:', error);
          return;
        }

        console.log('✅ useAcademyAffiliations data:', data);

        if (data && data.length > 0) {
          const formatted: AcademyAffiliation[] = data.map(item => ({
            academy_id: item.academy_id,
            academy_name: (item.companies as any)?.name || 'Academia',
            status: item.status as 'enrolled' | 'graduated',
            graduation_date: item.graduation_date || undefined,
            program_name: item.program_name || undefined,
            logo_url: (item.companies as any)?.logo_url || undefined,
            brand_color: (item.companies as any)?.brand_color || undefined,
          }));

          console.log('🎓 useAcademyAffiliations formatted:', formatted);
          setAffiliations(formatted);
        } else {
          console.log('⚠️ useAcademyAffiliations: No affiliations found');
          setAffiliations([]);
        }
      } catch (error) {
        console.error('❌ Error in useAcademyAffiliations:', error);
        setAffiliations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliations();
  }, [userEmail]);

  return {
    affiliations,
    isLoading,
    hasAcademy: affiliations.length > 0,
    isGraduated: affiliations.some(a => a.status === 'graduated'),
  };
};

