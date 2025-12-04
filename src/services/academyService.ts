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

      // Apply status filter - map UI status values to database status values
      // Note: pending_invitations filter is handled after fetching data
      if (filters?.status && filters.status !== 'all' && filters.status !== 'pending_invitations') {
        // Map 'active' to 'enrolled' for database query
        let dbStatus = filters.status;
        if (filters.status === 'active') {
          dbStatus = 'enrolled';
        }
        query = query.eq('status', dbStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener nombres reales y avatares para TODOS los estudiantes
      const isEmail = (str: string | null) => {
        if (!str) return false;
        return str.includes('@') && str.includes('.');
      };
      
      const allStudentEmails = (data || []).map(s => s.student_email);
      let namesMap = new Map<string, string>();
      let avatarsMap = new Map<string, string | null>();
      let userProfiles: Array<{ 
        email: string; 
        user_id: string; 
        full_name: string | null;
        avatar_url: string | null;
      }> | null = null;
      
      if (allStudentEmails.length > 0) {
        console.log('🔍 Getting data for ALL students:', allStudentEmails.length);
        console.log('📧 All student emails:', allStudentEmails);
        
        const { data: profilesData, error: rpcError } = await supabase
          .rpc('get_user_ids_by_emails', { 
            user_emails: allStudentEmails
          }) as { 
            data: Array<{ 
              email: string; 
              user_id: string; 
              full_name: string | null;
              avatar_url: string | null;
            }> | null;
            error: any;
          };
        
        if (rpcError) {
          console.error('❌ Error calling get_user_ids_by_emails:', rpcError);
        }
        
        userProfiles = profilesData;
        console.log('📊 RPC Response for all students:', userProfiles);
        
        // Mapa de nombres solo para los que necesitan reemplazo
        namesMap = new Map(
          userProfiles?.filter(p => p.full_name)
            .map(p => [p.email, p.full_name || p.email]) || []
        );
        
        // Mapa de avatares para TODOS
        avatarsMap = new Map(
          userProfiles?.map(p => [p.email, p.avatar_url]) || []
        );
        
        console.log('✅ Names Map:', Array.from(namesMap.entries()));
        console.log('✅ Avatars Map:', Array.from(avatarsMap.entries()));
      }

      // Create a set of emails that have user_ids (registered users)
      const registeredEmails = new Set(
        userProfiles?.map(p => p.email) || []
      );
      
      // Transform data to match AcademyStudent type
      const students: AcademyStudent[] = (data || []).map(student => {
        // Check if this is a pending invitation (email not in registeredEmails means not registered yet)
        const isPendingInvitation = !registeredEmails.has(student.student_email);
        
        // Map 'enrolled' to 'active' for type compatibility, but handle pending invitations
        let mappedStatus: 'active' | 'graduated' | 'inactive' | 'paused' | 'suspended' | 'pending_invitations' = 'active';
        if (isPendingInvitation) {
          mappedStatus = 'pending_invitations';
        } else if (student.status === 'graduated') {
          mappedStatus = 'graduated';
        } else if (student.status === 'inactive') {
          mappedStatus = 'inactive';
        } else if (student.status === 'paused') {
          mappedStatus = 'paused';
        } else if (student.status === 'suspended') {
          mappedStatus = 'suspended';
        } else {
          mappedStatus = 'active'; // 'enrolled' maps to 'active'
        }
        
        // Usar nombre real si student_name es un email
        // Para invitaciones pendientes, mostrar solo el email si no hay nombre
        let displayName = student.student_name;
        if (!displayName || isEmail(displayName)) {
          displayName = namesMap.get(student.student_email) || student.student_email;
        }
        
        const avatarUrl = avatarsMap.get(student.student_email);
        
        console.log(`👤 Student ${student.student_email}:`, {
          student_name: student.student_name,
          displayName,
          avatarUrl,
          foundInMap: namesMap.has(student.student_email),
          isPendingInvitation,
          isRegistered: registeredEmails.has(student.student_email)
        });
        
        return {
          id: student.id,
          academy_id: student.academy_id,
          user_id: student.student_email,
          status: mappedStatus,
          joined_at: student.enrollment_date || student.created_at,
          graduation_date: student.graduation_date || undefined,
          certificate_url: undefined,
          talent_profiles: {
            full_name: displayName,
            email: student.student_email,
            avatar_url: avatarUrl === null ? undefined : avatarUrl
          }
        };
      });

      // Apply status filter (after determining status)
      let filteredStudents = students;
      if (filters?.status === 'pending_invitations') {
        // Solo invitaciones pendientes
        filteredStudents = students.filter(student => student.status === 'pending_invitations');
      } else if (filters?.status === 'active') {
        // Solo estudiantes activos (excluir invitaciones pendientes)
        filteredStudents = students.filter(student => student.status === 'active');
      } else if (filters?.status === 'graduated') {
        // Solo graduados
        filteredStudents = students.filter(student => student.status === 'graduated');
      } else if (filters?.status === 'inactive') {
        // Solo inactivos
        filteredStudents = students.filter(student => student.status === 'inactive');
      } else if (filters?.status === 'paused') {
        // Solo pausados
        filteredStudents = students.filter(student => student.status === 'paused');
      } else if (filters?.status === 'suspended') {
        filteredStudents = students.filter(student => student.status === 'suspended');
      }
      // Si es 'all', incluye todo (incluyendo pending_invitations)

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredStudents = filteredStudents.filter(student => 
          student.talent_profiles?.full_name?.toLowerCase().includes(searchLower) ||
          student.talent_profiles?.email?.toLowerCase().includes(searchLower)
        );
      }

      return filteredStudents;
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

      // Obtener todos los emails para obtener nombres y avatares
      const allStudentEmails = students?.map(s => s.student_email) || [];
      let profilesMap = new Map<string, string>();
      let avatarsMap = new Map<string, string | null>();
      
      if (allStudentEmails.length > 0) {
        console.log('📧 Fetching profiles for emails:', allStudentEmails);
        const { data: userProfiles, error: profilesError } = await supabase
          .rpc('get_user_ids_by_emails', { 
            user_emails: allStudentEmails
          }) as { 
            data: Array<{ 
              email: string; 
              user_id: string; 
              full_name: string | null;
              avatar_url: string | null;
            }> | null;
            error: any;
          };
        
        if (profilesError) {
          console.error('❌ Error getting user profiles:', profilesError);
        }
        
        profilesMap = new Map(
          userProfiles?.map(p => [p.email, p.full_name || p.email]) || []
        );
        
        avatarsMap = new Map(
          userProfiles?.map(p => [p.email, p.avatar_url]) || []
        );
        
        console.log('✅ Profiles map:', Array.from(profilesMap.entries()));
        console.log('✅ Avatars map:', Array.from(avatarsMap.entries()));
      }

      const activities: AcademyActivity[] = (students || []).map(student => {
        // Función auxiliar para detectar si un string es un email
        const isEmail = (str: string | null) => {
          if (!str) return false;
          return str.includes('@') && str.includes('.');
        };
        
        // Si student_name es un email, usar el nombre del perfil
        let displayName = student.student_name;
        if (!displayName || isEmail(displayName)) {
          displayName = profilesMap.get(student.student_email) || student.student_email;
        }
        
        const avatarUrl = avatarsMap.get(student.student_email);
        
        console.log(`👤 Student: ${student.student_email} -> Display name: ${displayName}, Avatar: ${avatarUrl}`);
        
        // Siempre mostrar solo "se unió a la academia", no importa si tiene graduation_date
        return {
          id: student.id,
          academy_id: academyId,
          type: 'new_member', // Siempre es una unión, no mostramos graduaciones
          description: `${displayName} se unió a la academia`,
          user_id: student.student_email,
          created_at: student.created_at, // Usar siempre la fecha de creación (unión)
          metadata: { 
            status: student.status,
            avatar_url: avatarUrl || undefined
          }
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
