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

export const academyService = {
  // Academy Management
  async getAcademy(academyId: string): Promise<Academy | null> {
    // Mock data for now
    return {
      id: academyId,
      name: 'Academia de Desarrollo Digital',
      description: 'Academia especializada en desarrollo web y móvil',
      website: 'https://academia.example.com',
      logo_url: undefined,
      contact_email: 'contacto@academia.example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };
  },

  async getAcademyByUserId(_userId: string): Promise<Academy | null> {
    // Mock data for now
    return {
      id: 'mock-academy-id',
      name: 'Academia de Desarrollo Digital',
      description: 'Academia especializada en desarrollo web y móvil',
      website: 'https://academia.example.com',
      logo_url: undefined,
      contact_email: 'contacto@academia.example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };
  },

  // Academy Stats
  async getAcademyStats(_academyId: string): Promise<AcademyStats> {
    // Mock data for now
    return {
      total_students: 25,
      active_students: 18,
      graduated_students: 7,
      pending_invitations: 3,
      total_applications: 12,
      exclusive_opportunities: 5,
      recent_activity_count: 8
    };
  },

  // Students Management
  async getStudents(_academyId: string, filters?: { status?: string; search?: string }): Promise<AcademyStudent[]> {
    // Mock data for now
    const mockStudents: AcademyStudent[] = [
      {
        id: '1',
        academy_id: _academyId,
        user_id: 'user1',
        status: 'active',
        joined_at: '2024-01-15T10:00:00Z',
        graduation_date: undefined,
        talent_profiles: {
          full_name: 'María García',
          avatar_url: undefined,
          email: 'maria@example.com',
          city: 'Madrid',
          country: 'España'
        }
      },
      {
        id: '2',
        academy_id: _academyId,
        user_id: 'user2',
        status: 'graduated',
        joined_at: '2023-12-01T10:00:00Z',
        graduation_date: '2024-01-10T10:00:00Z',
        talent_profiles: {
          full_name: 'Juan Pérez',
          avatar_url: undefined,
          email: 'juan@example.com',
          city: 'Barcelona',
          country: 'España'
        }
      }
    ];

    let filtered = mockStudents;

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(student => student.status === filters.status);
    }

    if (filters?.search) {
      filtered = filtered.filter(student => 
        student.talent_profiles?.full_name?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        student.talent_profiles?.email?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return filtered;
  },

  async removeStudent(_academyId: string, _userId: string): Promise<boolean> {
    // Mock implementation
    console.log('Removing student:', _userId, 'from academy:', _academyId);
    return true;
  },

  // Invitations Management
  async getInvitations(_academyId: string): Promise<AcademyInvitation[]> {
    // Mock data for now
    return [
      {
        id: '1',
        academy_id: _academyId,
        email: 'estudiante1@example.com',
        status: 'pending',
        invited_at: '2024-01-20T10:00:00Z',
        expires_at: '2024-01-27T10:00:00Z'
      },
      {
        id: '2',
        academy_id: _academyId,
        email: 'estudiante2@example.com',
        status: 'accepted',
        invited_at: '2024-01-18T10:00:00Z',
        expires_at: '2024-01-25T10:00:00Z',
        accepted_at: '2024-01-19T14:00:00Z'
      }
    ];
  },

  async sendInvitations(_academyId: string, invitationData: InvitationRequest): Promise<boolean> {
    // Mock implementation
    console.log('Sending invitations for academy:', _academyId, 'to emails:', invitationData.emails);
    return true;
  },

  async cancelInvitation(invitationId: string): Promise<boolean> {
    // Mock implementation
    console.log('Canceling invitation:', invitationId);
    return true;
  },

  // Activity Feed
  async getActivity(_academyId: string, _limit: number = 20): Promise<AcademyActivity[]> {
    // Mock data for now
    return [
      {
        id: '1',
        academy_id: _academyId,
        type: 'application',
        description: 'María García aplicó a Desarrollador Frontend en TechCorp',
        user_id: 'user1',
        opportunity_id: 'opp1',
        created_at: '2024-01-20T14:00:00Z',
        metadata: {
          opportunity_title: 'Desarrollador Frontend',
          company_name: 'TechCorp'
        }
      },
      {
        id: '2',
        academy_id: _academyId,
        type: 'new_member',
        description: 'Juan Pérez se unió a la academia',
        user_id: 'user2',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: '3',
        academy_id: _academyId,
        type: 'graduation',
        description: 'Ana López completó el curso de Desarrollo Web',
        user_id: 'user3',
        created_at: '2024-01-19T16:00:00Z',
        metadata: {
          course_name: 'Desarrollo Web'
        }
      }
    ];
  },

  // Exclusive Opportunities
  async getExclusiveOpportunities(_academyId: string): Promise<AcademyOpportunity[]> {
    // Mock data for now
    return [
      {
        id: '1',
        academy_id: _academyId,
        opportunity_id: 'opp1',
        created_at: '2024-01-20T10:00:00Z',
        opportunities: {
          id: 'opp1',
          title: 'Desarrollador Frontend Senior',
          description: 'Buscamos un desarrollador frontend con experiencia en React...',
          status: 'active',
          created_at: '2024-01-20T10:00:00Z',
          companies: {
            name: 'TechCorp',
            logo_url: undefined
          }
        }
      }
    ];
  },

  // Public Directory
  async getPublicDirectory(_academyId: string): Promise<PublicDirectoryStudent[]> {
    // Mock data for now
    return [
      {
        id: '1',
        full_name: 'María García',
        avatar_url: undefined,
        graduation_date: '2024-01-15T10:00:00Z',
        certificate_url: 'https://example.com/certificate1.pdf',
        skills: ['React', 'TypeScript', 'Node.js'],
        location: 'Madrid, España'
      },
      {
        id: '2',
        full_name: 'Juan Pérez',
        avatar_url: undefined,
        graduation_date: '2024-01-10T10:00:00Z',
        certificate_url: 'https://example.com/certificate2.pdf',
        skills: ['Python', 'Django', 'PostgreSQL'],
        location: 'Barcelona, España'
      }
    ];
  }
};