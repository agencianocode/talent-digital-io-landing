import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface AcademyGraduateInfo {
  isGraduate: boolean;
  academyId: string | null;
  academyName: string | null;
  programName: string | null;
  graduationDate: string | null;
  hasPremium: boolean;
  premiumUntil: string | null;
  certificateUrl: string | null;
}

export const useAcademyGraduateStatus = () => {
  const { user } = useSupabaseAuth();
  const [info, setInfo] = useState<AcademyGraduateInfo>({
    isGraduate: false,
    academyId: null,
    academyName: null,
    programName: null,
    graduationDate: null,
    hasPremium: false,
    premiumUntil: null,
    certificateUrl: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    loadGraduateInfo();
  }, [user?.email]);

  const loadGraduateInfo = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('academy_students')
        .select(`
          academy_id,
          program_name,
          graduation_date,
          premium_until,
          certificate_url,
          companies:academy_id (
            name
          )
        `)
        .eq('student_email', user!.email!)
        .eq('status', 'graduated')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const premiumUntil = data.premium_until ? new Date(data.premium_until) : null;
        const hasPremium = premiumUntil ? premiumUntil > new Date() : false;

        setInfo({
          isGraduate: true,
          academyId: data.academy_id,
          academyName: (data as any).companies?.name || null,
          programName: data.program_name,
          graduationDate: data.graduation_date,
          hasPremium,
          premiumUntil: data.premium_until,
          certificateUrl: data.certificate_url,
        });
      } else {
        setInfo({
          isGraduate: false,
          academyId: null,
          academyName: null,
          programName: null,
          graduationDate: null,
          hasPremium: false,
          premiumUntil: null,
          certificateUrl: null,
        });
      }
    } catch (error) {
      console.error('Error loading graduate info:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...info,
    loading,
    refresh: loadGraduateInfo,
  };
};
