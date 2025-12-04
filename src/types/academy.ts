export interface Academy {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  contact_email?: string;
  brand_color?: string;
  secondary_color?: string;
  academy_tagline?: string;
  academy_slug?: string;
  public_directory_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademyStudent {
  id: string;
  academy_id: string;
  user_id: string;
  status: 'active' | 'graduated' | 'paused' | 'suspended' | 'pending_invitations';
  joined_at: string;
  graduation_date?: string;
  certificate_url?: string;
  premium_until?: string;
  talent_profiles?: {
    full_name: string;
    avatar_url?: string;
    email?: string;
    city?: string;
    country?: string;
  };
}

export interface AcademyInvitation {
  id: string;
  academy_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
}

export interface AcademyActivity {
  id: string;
  academy_id: string;
  type: 'application' | 'new_member' | 'graduation' | 'invitation_sent' | 'profile_update';
  description: string;
  user_id?: string;
  opportunity_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface AcademyOpportunity {
  id: string;
  academy_id: string;
  opportunity_id: string;
  created_at: string;
  expires_at?: string;
  opportunities?: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    companies?: {
      name: string;
      logo_url?: string;
    };
  };
}

export interface AcademyStats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  pending_invitations: number;
  total_applications: number;
  exclusive_opportunities: number;
  recent_activity_count: number;
}

export interface InvitationRequest {
  emails: string[];
  message?: string;
}

export interface PublicDirectoryStudent {
  id: string;
  full_name: string;
  avatar_url?: string;
  graduation_date: string;
  certificate_url?: string;
  skills: string[];
  location?: string;
}

export interface AcademyCertification {
  academy_id: string;
  academy_name: string;
  certification_date: string;
  program: string;
  badge_color: string;
}
