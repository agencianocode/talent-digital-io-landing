import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface AcademyAffiliation {
  academyId: string;
  academyName: string;
  academyLogoUrl: string | null;
  status: 'enrolled' | 'graduated' | 'paused' | 'suspended';
  enrollmentDate: string;
  graduationDate: string | null;
}

export const useStudentAcademy = () => {
  const { user } = useSupabaseAuth();
  const [academy, setAcademy] = useState<AcademyAffiliation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    loadAcademyAffiliation();
  }, [user?.email]);

  const loadAcademyAffiliation = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);

      // Get student record from academy_students
      const { data: studentData, error: studentError } = await supabase
        .from('academy_students')
        .select(`
          academy_id,
          status,
          enrollment_date,
          graduation_date,
          academy:companies!academy_students_academy_id_fkey(
            id,
            name,
            logo_url
          )
        `)
        .eq('student_email', user.email)
        .maybeSingle();

      if (studentError) {
        console.error('Error loading academy affiliation:', studentError);
        setAcademy(null);
        return;
      }

      if (studentData && (studentData as any).academy) {
        const academyInfo = (studentData as any).academy;
        setAcademy({
          academyId: studentData.academy_id,
          academyName: academyInfo.name,
          academyLogoUrl: academyInfo.logo_url,
          status: studentData.status as any,
          enrollmentDate: studentData.enrollment_date,
          graduationDate: studentData.graduation_date
        });
      } else {
        setAcademy(null);
      }
    } catch (error) {
      console.error('Error in loadAcademyAffiliation:', error);
      setAcademy(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    academy,
    isLoading,
    reload: loadAcademyAffiliation
  };
};

