// Types for Talent Profile System
export interface TalentProfile {
  id: string;
  user_id: string;
  title: string | null;
  specialty: string | null;
  bio: string | null;
  skills: string[] | null;
  years_experience: number | null;
  experience_level: string | null;
  primary_category_id: string | null;
  secondary_category_id: string | null;
  availability: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  currency: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  video_presentation_url: string | null;
  industries_of_interest: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  position?: string | null;
  linkedin?: string | null;
  created_at: string;
  updated_at: string;
}

// Portfolio Types
export interface TalentPortfolio {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  type: 'website' | 'behance' | 'dribbble' | 'github' | 'other';
  thumbnail_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioFormData {
  title: string;
  url: string;
  description?: string;
  type: 'website' | 'behance' | 'dribbble' | 'github' | 'other';
  is_primary: boolean;
}

// Experience Types
export interface TalentExperience {
  id: string;
  user_id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  current: boolean;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExperienceFormData {
  company: string;
  position: string;
  start_date: string;
  end_date?: string | null;
  description?: string;
  current: boolean;
  location?: string;
}

// Education Types
export interface TalentEducation {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string;
  end_date: string | null;
  description: string | null;
  current: boolean;
  created_at: string;
  updated_at: string;
}

export interface EducationFormData {
  institution: string;
  degree: string;
  field?: string;
  start_date: string;
  end_date?: string | null;
  description?: string;
  current: boolean;
}

// Social Links Types
export interface TalentSocialLink {
  id: string;
  user_id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'facebook' | 'github' | 'behance' | 'dribbble' | 'other';
  url: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLinkFormData {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'facebook' | 'github' | 'behance' | 'dribbble' | 'other';
  url: string;
}

// Profile Edit Types
export interface ProfileEditData {
  full_name: string;
  title: string;
  bio: string;
  skills: string[];
  location: string;
  country: string;
  city: string;
  phone: string;
  video_presentation_url: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
  currency: string;
  availability: string;
  social_links?: any;
  primary_category_id?: string;
  secondary_category_id?: string;
  experience_level?: string;
  industries_of_interest?: string[];
  portfolio_url?: string;
}

// Video Presentation Types
export interface VideoPresentationData {
  url: string;
  platform: 'youtube' | 'loom' | 'vimeo' | 'other';
  title?: string;
  description?: string;
}

// Share Profile Types
export interface ProfileShareData {
  public_url: string;
  qr_code?: string;
  share_count: number;
}

// Form Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Portfolio Platform Types
export const PORTFOLIO_PLATFORMS = [
  { value: 'website', label: 'Sitio Web', icon: '🌐' },
  { value: 'behance', label: 'Behance', icon: '🎨' },
  { value: 'dribbble', label: 'Dribbble', icon: '🏀' },
  { value: 'github', label: 'GitHub', icon: '💻' },
  { value: 'other', label: 'Otro', icon: '🔗' }
] as const;

// Social Media Platforms
export const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'text-blue-600' },
  { value: 'twitter', label: 'Twitter', icon: '🐦', color: 'text-blue-400' },
  { value: 'instagram', label: 'Instagram', icon: '📷', color: 'text-pink-500' },
  { value: 'youtube', label: 'YouTube', icon: '📺', color: 'text-red-600' },
  { value: 'facebook', label: 'Facebook', icon: '👥', color: 'text-blue-700' },
  { value: 'github', label: 'GitHub', icon: '💻', color: 'text-gray-800' },
  { value: 'behance', label: 'Behance', icon: '🎨', color: 'text-blue-500' },
  { value: 'dribbble', label: 'Dribbble', icon: '🏀', color: 'text-pink-400' },
  { value: 'other', label: 'Otro', icon: '🔗', color: 'text-gray-600' }
] as const;

// Video Platforms
export const VIDEO_PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: '📺', color: 'text-red-600' },
  { value: 'loom', label: 'Loom', icon: '🎥', color: 'text-purple-600' },
  { value: 'vimeo', label: 'Vimeo', icon: '🎬', color: 'text-blue-500' },
  { value: 'other', label: 'Otro', icon: '📹', color: 'text-gray-600' }
] as const;
