import { useState, useEffect, useRef } from 'react';
import { academyService } from '@/services/academyService';
import { 
  Academy, 
  AcademyStudent, 
  AcademyInvitation, 
  AcademyActivity, 
  AcademyOpportunity, 
  AcademyStats,
  PublicDirectoryStudent 
} from '@/types/academy';

interface UseAcademyDataReturn {
  academy: Academy | null;
  stats: AcademyStats;
  students: AcademyStudent[];
  invitations: AcademyInvitation[];
  activity: AcademyActivity[];
  exclusiveOpportunities: AcademyOpportunity[];
  publicDirectory: PublicDirectoryStudent[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  loadStudents: (filters?: { status?: string; search?: string }) => Promise<void>;
  removeStudent: (userId: string) => Promise<boolean>;
  sendInvitations: (emails: string[], message?: string) => Promise<boolean>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
}

export const useAcademyData = (academyId: string): UseAcademyDataReturn => {
  const isMountedRef = useRef(true);
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [stats, setStats] = useState<AcademyStats>({
    total_students: 0,
    active_students: 0,
    graduated_students: 0,
    pending_invitations: 0,
    total_applications: 0,
    exclusive_opportunities: 0,
    recent_activity_count: 0
  });
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [invitations, setInvitations] = useState<AcademyInvitation[]>([]);
  const [activity, setActivity] = useState<AcademyActivity[]>([]);
  const [exclusiveOpportunities, setExclusiveOpportunities] = useState<AcademyOpportunity[]>([]);
  const [publicDirectory, setPublicDirectory] = useState<PublicDirectoryStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAcademyData = async () => {
    if (!academyId || !isMountedRef.current) return;

    try {
      if (isMountedRef.current) {
        setIsLoading(true);
        setError(null);
      }

      const [academyData, statsData] = await Promise.all([
        academyService.getAcademy(academyId),
        academyService.getAcademyStats(academyId)
      ]);

      if (isMountedRef.current) {
        setAcademy(academyData);
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading academy data:', err);
      if (isMountedRef.current) {
        setError('Error al cargar datos de la academia');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const loadStudents = async (filters?: { status?: string; search?: string }) => {
    if (!academyId || !isMountedRef.current) return;

    try {
      const studentsData = await academyService.getStudents(academyId, filters);
      if (isMountedRef.current) {
        setStudents(studentsData);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      if (isMountedRef.current) {
        setError('Error al cargar estudiantes');
      }
    }
  };

  const loadInvitations = async () => {
    if (!academyId || !isMountedRef.current) return;

    try {
      const invitationsData = await academyService.getInvitations(academyId);
      if (isMountedRef.current) {
        setInvitations(invitationsData);
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
      if (isMountedRef.current) {
        setError('Error al cargar invitaciones');
      }
    }
  };

  const loadActivity = async () => {
    if (!academyId || !isMountedRef.current) return;

    try {
      const activityData = await academyService.getActivity(academyId);
      if (isMountedRef.current) {
        setActivity(activityData);
      }
    } catch (err) {
      console.error('Error loading activity:', err);
      if (isMountedRef.current) {
        setError('Error al cargar actividad');
      }
    }
  };

  const loadExclusiveOpportunities = async () => {
    if (!academyId || !isMountedRef.current) return;

    try {
      const opportunitiesData = await academyService.getExclusiveOpportunities(academyId);
      if (isMountedRef.current) {
        setExclusiveOpportunities(opportunitiesData);
      }
    } catch (err) {
      console.error('Error loading exclusive opportunities:', err);
      if (isMountedRef.current) {
        setError('Error al cargar oportunidades exclusivas');
      }
    }
  };

  const loadPublicDirectory = async () => {
    if (!academyId || !isMountedRef.current) return;

    try {
      const directoryData = await academyService.getPublicDirectory(academyId);
      if (isMountedRef.current) {
        setPublicDirectory(directoryData);
      }
    } catch (err) {
      console.error('Error loading public directory:', err);
      if (isMountedRef.current) {
        setError('Error al cargar directorio público');
      }
    }
  };

  const refreshData = async () => {
    await Promise.all([
      loadAcademyData(),
      loadStudents(),
      loadInvitations(),
      loadActivity(),
      loadExclusiveOpportunities(),
      loadPublicDirectory()
    ]);
  };

  const removeStudent = async (userId: string): Promise<boolean> => {
    try {
      const success = await academyService.removeStudent(academyId, userId);
      if (success) {
        await loadStudents();
        await loadAcademyData(); // Refresh stats
      }
      return success;
    } catch (err) {
      console.error('Error removing student:', err);
      return false;
    }
  };

  const sendInvitations = async (emails: string[], message?: string): Promise<boolean> => {
    try {
      const success = await academyService.sendInvitations(academyId, { emails, message });
      if (success) {
        await loadInvitations();
        await loadAcademyData(); // Refresh stats
      }
      return success;
    } catch (err) {
      console.error('Error sending invitations:', err);
      return false;
    }
  };

  const cancelInvitation = async (invitationId: string): Promise<boolean> => {
    try {
      const success = await academyService.cancelInvitation(invitationId);
      if (success) {
        await loadInvitations();
        await loadAcademyData(); // Refresh stats
      }
      return success;
    } catch (err) {
      console.error('Error canceling invitation:', err);
      return false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    if (academyId) {
      refreshData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [academyId]);

  return {
    academy,
    stats,
    students,
    invitations,
    activity,
    exclusiveOpportunities,
    publicDirectory,
    isLoading,
    error,
    refreshData,
    loadStudents,
    removeStudent,
    sendInvitations,
    cancelInvitation
  };
};
