import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface AcademyInfo {
  isAcademyStudent: boolean;
  academyName: string | null;
  programName: string | null;
}

export const useAcademyInvitation = () => {
  const { user } = useSupabaseAuth();
  const [academyInfo, setAcademyInfo] = useState<AcademyInfo>({
    isAcademyStudent: false,
    academyName: null,
    programName: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchAcademyInfo = async () => {
      try {
        setLoading(true);

        // Check if user is registered as an academy student
        const { data: studentData, error } = await supabase
          .from('academy_students')
          .select(`
            program_name,
            academy_id,
            academies:academy_id (
              name
            )
          `)
          .eq('student_email', user.email!)
          .eq('status', 'enrolled')
          .maybeSingle();

        if (error) throw error;

        if (studentData) {
          setAcademyInfo({
            isAcademyStudent: true,
            academyName: (studentData as any).academies?.name || null,
            programName: studentData.program_name
          });
        }
      } catch (error) {
        console.error('Error fetching academy info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademyInfo();
  }, [user?.email]);

  return {
    ...academyInfo,
    loading
  };
};
