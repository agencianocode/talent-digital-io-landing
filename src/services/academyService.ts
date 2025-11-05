import { supabase } from '@/integrations/supabase/client';
import { 
  Academy, 
  AcademyStudent, 
  AcademyInvitation, 
  AcademyActivity, 
  AcademyOpportunity, 
  AcademyStats,
  InvitationRequest,
  PublicDirectoryStudent 
} from '@/types/academy';

// Real Academy Service connected to Supabase
export const academyService = {
  // Get academy details by ID (company acts as academy)
  async getAcademy(academyId: string): Promise<Academy | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', academyId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        website: data.website || undefined,
        logo_url: data.logo_url || undefined,
        contact_email: undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching academy:', error);
      return null;
    }
  },

  // Get academy by user ID (get user's company)
  async getAcademyByUserId(userId: string): Promise<Academy | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        website: data.website || undefined,
        logo_url: data.logo_url || undefined,
        contact_email: undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching academy by user:', error);
      return null;
    }
  },

  // Get academy statistics
  async getAcademyStats(academyId: string): Promise<AcademyStats> {
    try {
      // Get total students
      const { count: totalStudents } = await supabase
        .from('academy_students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      // Get active students
      const { count: activeStudents } = await supabase
        .from('academy_students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'enrolled');

      // Get graduated students
      const { count: graduatedStudents } = await supabase
        .from('academy_students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'graduated');

      return {
        total_students: totalStudents || 0,
        active_students: activeStudents || 0,
        graduated_students: graduatedStudents || 0,
        pending_invitations: 0,
        total_applications: 0,
        exclusive_opportunities: 0,
        recent_activity_count: 0
      };
    } catch (error) {
      console.error('Error fetching academy stats:', error);
      return {
        total_students: 0,
        active_students: 0,
        graduated_students: 0,
        pending_invitations: 0,
        total_applications: 0,
        exclusive_opportunities: 0,
        recent_activity_count: 0
      };
    }
  },

  // Get students with optional filters
  async getStudents(
    academyId: string, 
    filters?: { status?: string; search?: string }
  ): Promise<AcademyStudent[]> {
    try {
      let query = supabase
        .from('academy_students')
        .select('*')
        .eq('academy_id', academyId);

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match AcademyStudent type
      const students: AcademyStudent[] = (data || []).map(student => {
        // Map 'enrolled' to 'active' for type compatibility
        let mappedStatus: 'active' | 'graduated' | 'paused' | 'suspended' = 'active';
        if (student.status === 'graduated') mappedStatus = 'graduated';
        else if (student.status === 'paused') mappedStatus = 'paused';
        else if (student.status === 'suspended') mappedStatus = 'suspended';
        else mappedStatus = 'active'; // 'enrolled' maps to 'active'
        
        return {
          id: student.id,
          academy_id: student.academy_id,
          user_id: student.student_email,
          status: mappedStatus,
          joined_at: student.enrollment_date || student.created_at,
          graduation_date: student.graduation_date || undefined,
          certificate_url: undefined,
          talent_profiles: {
            full_name: student.student_name || 'Estudiante',
            email: student.student_email
          }
        };
      });

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return students.filter(student => 
          student.talent_profiles?.full_name?.toLowerCase().includes(searchLower) ||
          student.talent_profiles?.email?.toLowerCase().includes(searchLower)
        );
      }

      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Remove a student from the academy
  async removeStudent(academyId: string, studentEmail: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('academy_students')
        .delete()
        .eq('academy_id', academyId)
        .eq('student_email', studentEmail);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing student:', error);
      return false;
    }
  },

  // Get pending and sent invitations
  async getInvitations(_academyId: string): Promise<AcademyInvitation[]> {
    // TODO: Implement invitations table if needed
    return [];
  },

  // Send bulk invitations - adds students directly to academy
  async sendInvitations(academyId: string, invitationData: InvitationRequest): Promise<boolean> {
    try {
      const students = invitationData.emails.map(email => ({
        academy_id: academyId,
        student_email: email.trim(),
        student_name: null,
        status: 'enrolled',
        program_name: invitationData.message || null,
        enrollment_date: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('academy_students')
        .insert(students);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending invitations:', error);
      return false;
    }
  },

  // Cancel an invitation - removes pending student
  async cancelInvitation(studentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('academy_students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      return false;
    }
  },

  // Get recent activity feed
  async getActivity(academyId: string, limit: number = 20): Promise<AcademyActivity[]> {
    try {
      // Get recent students joined
      const { data: students, error } = await supabase
        .from('academy_students')
        .select('id, student_name, student_email, enrollment_date, graduation_date, status, created_at')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Obtener los nombres completos desde profiles para estudiantes sin student_name
      const studentsWithoutName = students?.filter(s => !s.student_name) || [];
      let profilesMap = new Map<string, string>();
      
      if (studentsWithoutName.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email, full_name')
          .in('email', studentsWithoutName.map(s => s.student_email));
        
        profilesMap = new Map(profiles?.map(p => [p.email, p.full_name]) || []);
      }

      const activities: AcademyActivity[] = (students || []).map(student => {
        // Usar el nombre del perfil si student_name está vacío
        const displayName = student.student_name || profilesMap.get(student.student_email) || student.student_email;
        
        return {
        id: student.id,
        academy_id: academyId,
        type: student.graduation_date ? 'graduation' : 'new_member',
        description: student.graduation_date 
            ? `${displayName} completó su programa`
            : `${displayName} se unió a la academia`,
        user_id: student.student_email,
        created_at: student.graduation_date || student.created_at,
        metadata: { status: student.status }
        };
      });

      return activities;
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  },

  // Get exclusive opportunities for academy
  async getExclusiveOpportunities(academyId: string): Promise<AcademyOpportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          companies:company_id (
            name,
            logo_url
          )
        `)
        .eq('company_id', academyId)
        .eq('is_academy_exclusive', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(opp => ({
        id: opp.id,
        academy_id: academyId,
        opportunity_id: opp.id,
        created_at: opp.created_at,
        expires_at: undefined,
        opportunities: {
          id: opp.id,
          title: opp.title,
          description: opp.description,
          status: opp.status || 'draft',
          created_at: opp.created_at,
          companies: Array.isArray(opp.companies) && opp.companies.length > 0
            ? {
                name: opp.companies[0].name,
                logo_url: opp.companies[0].logo_url || undefined
              }
            : undefined
        }
      }));
    } catch (error) {
      console.error('Error fetching exclusive opportunities:', error);
      return [];
    }
  },

  // Get public directory of graduates (respects privacy settings)
  async getPublicDirectory(academyId: string, statusFilter: 'all' | 'enrolled' | 'graduated' = 'all'): Promise<PublicDirectoryStudent[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_public_academy_directory', {
          p_academy_id: academyId,
          p_status_filter: statusFilter
        });

      if (error) throw error;

      return (data || []).map((student: any) => ({
        id: student.student_id,
        full_name: student.student_name || 'Graduado',
        avatar_url: student.avatar_url,
        graduation_date: student.graduation_date!,
        certificate_url: student.certificate_url,
        skills: [],
        location: [student.city, student.country].filter(Boolean).join(', ')
      }));
    } catch (error) {
      console.error('Error fetching public directory:', error);
      return [];
    }
  }
};
