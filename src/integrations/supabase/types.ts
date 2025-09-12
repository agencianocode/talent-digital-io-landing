export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      academy_student_audit: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_at: string | null
          performed_by: string | null
          student_id: string | null
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          student_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_student_audit_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "academy_students"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_students: {
        Row: {
          academy_id: string
          created_at: string
          enrollment_date: string | null
          graduation_date: string | null
          id: string
          program_name: string | null
          status: string | null
          student_email: string
          student_name: string | null
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          enrollment_date?: string | null
          graduation_date?: string | null
          id?: string
          program_name?: string | null
          status?: string | null
          student_email: string
          student_name?: string | null
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          enrollment_date?: string | null
          graduation_date?: string | null
          id?: string
          program_name?: string | null
          status?: string | null
          student_email?: string
          student_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_students_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valid_academy_reference"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          contact_status: string | null
          contacted_at: string | null
          cover_letter: string | null
          created_at: string
          id: string
          internal_rating: number | null
          opportunity_id: string
          resume_url: string | null
          status: string
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          contact_status?: string | null
          contacted_at?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          internal_rating?: number | null
          opportunity_id: string
          resume_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          contact_status?: string | null
          contacted_at?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          internal_rating?: number | null
          opportunity_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          annual_revenue_range: string | null
          business_type: string | null
          created_at: string
          description: string | null
          employee_count_range: string | null
          gallery_urls: Json | null
          id: string
          industry: string | null
          industry_id: string | null
          location: string | null
          logo_url: string | null
          name: string
          size: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          annual_revenue_range?: string | null
          business_type?: string | null
          created_at?: string
          description?: string | null
          employee_count_range?: string | null
          gallery_urls?: Json | null
          id?: string
          industry?: string | null
          industry_id?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          size?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          annual_revenue_range?: string | null
          business_type?: string | null
          created_at?: string
          description?: string | null
          employee_count_range?: string | null
          gallery_urls?: Json | null
          id?: string
          industry?: string | null
          industry_id?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          size?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      company_directory: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          id: string
          industry_id: string | null
          is_claimed: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          industry_id?: string | null
          is_claimed?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          industry_id?: string | null
          is_claimed?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_directory_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      company_user_roles: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string
          id: string
          invitation_token: string | null
          invited_by: string | null
          invited_email: string | null
          role: Database["public"]["Enums"]["company_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          id?: string
          invitation_token?: string | null
          invited_by?: string | null
          invited_email?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          id?: string
          invitation_token?: string | null
          invited_by?: string | null
          invited_email?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          field_of_study: string | null
          graduation_year: number | null
          id: string
          institution: string
          talent_profile_id: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string | null
          field_of_study?: string | null
          graduation_year?: number | null
          id?: string
          institution: string
          talent_profile_id: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          field_of_study?: string | null
          graduation_year?: number | null
          id?: string
          institution?: string
          talent_profile_id?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_titles: {
        Row: {
          category: string | null
          created_at: string
          id: string
          industry_tags: string[] | null
          is_verified: boolean | null
          title: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          industry_tags?: string[] | null
          is_verified?: boolean | null
          title: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          industry_tags?: string[] | null
          is_verified?: boolean | null
          title?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          auto_saved_at: string | null
          category: string
          commission_percentage: number | null
          company_id: string
          contract_type: string | null
          created_at: string
          currency: string | null
          deadline_date: string | null
          description: string
          duration_type: string | null
          duration_unit: string | null
          duration_value: number | null
          experience_levels: string[] | null
          id: string
          is_academy_exclusive: boolean | null
          is_active: boolean | null
          location: string | null
          payment_type: string | null
          requirements: string | null
          salary_is_public: boolean | null
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          timezone_preference: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          auto_saved_at?: string | null
          category: string
          commission_percentage?: number | null
          company_id: string
          contract_type?: string | null
          created_at?: string
          currency?: string | null
          deadline_date?: string | null
          description: string
          duration_type?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          experience_levels?: string[] | null
          id?: string
          is_academy_exclusive?: boolean | null
          is_active?: boolean | null
          location?: string | null
          payment_type?: string | null
          requirements?: string | null
          salary_is_public?: boolean | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          timezone_preference?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          auto_saved_at?: string | null
          category?: string
          commission_percentage?: number | null
          company_id?: string
          contract_type?: string | null
          created_at?: string
          currency?: string | null
          deadline_date?: string | null
          description?: string
          duration_type?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          experience_levels?: string[] | null
          id?: string
          is_academy_exclusive?: boolean | null
          is_active?: boolean | null
          location?: string | null
          payment_type?: string | null
          requirements?: string | null
          salary_is_public?: boolean | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          timezone_preference?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_templates: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          example_data: Json | null
          id: string
          name: string
          suggestions: string[] | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          example_data?: Json | null
          id?: string
          name: string
          suggestions?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          example_data?: Json | null
          id?: string
          name?: string
          suggestions?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          full_name: string | null
          hide_location: boolean | null
          id: string
          linkedin: string | null
          phone: string | null
          position: string | null
          profile_completeness: number | null
          social_links: Json | null
          updated_at: string
          user_id: string
          video_presentation_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          hide_location?: boolean | null
          id?: string
          linkedin?: string | null
          phone?: string | null
          position?: string | null
          profile_completeness?: number | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
          video_presentation_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          hide_location?: boolean | null
          id?: string
          linkedin?: string | null
          phone?: string | null
          position?: string | null
          profile_completeness?: number | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          video_presentation_url?: string | null
        }
        Relationships: []
      }
      role_change_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_role: string
          old_role: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role: string
          old_role?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role?: string
          old_role?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string
          currency: string | null
          experience_level: string | null
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          industries_of_interest: string[] | null
          linkedin_url: string | null
          portfolio_url: string | null
          primary_category_id: string | null
          secondary_category_id: string | null
          skills: string[] | null
          specialty: string | null
          title: string | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          experience_level?: string | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          industries_of_interest?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          primary_category_id?: string | null
          secondary_category_id?: string | null
          skills?: string[] | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          experience_level?: string | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          industries_of_interest?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          primary_category_id?: string | null
          secondary_category_id?: string | null
          skills?: string[] | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_primary_category_id_fkey"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_profiles_secondary_category_id_fkey"
            columns: ["secondary_category_id"]
            isOneToOne: false
            referencedRelation: "professional_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      upgrade_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reason: string | null
          requested_role: Database["public"]["Enums"]["user_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_current_role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_role: Database["public"]["Enums"]["user_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_current_role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_role?: Database["public"]["Enums"]["user_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_current_role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upgrade_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          features: Json | null
          id: string
          started_at: string
          status: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          started_at?: string
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          started_at?: string
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          position: string
          start_date: string | null
          talent_profile_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          position: string
          start_date?: string | null
          talent_profile_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          position?: string
          start_date?: string | null
          talent_profile_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_company_to_directory: {
        Args: {
          company_industry_id?: string
          company_location?: string
          company_name: string
          company_website?: string
        }
        Returns: string
      }
      calculate_profile_completeness: {
        Args: { user_uuid: string }
        Returns: number
      }
      claim_company_from_directory: {
        Args: { directory_company_id: string; user_uuid: string }
        Returns: string
      }
      get_academy_students: {
        Args: { academy_uuid: string }
        Returns: {
          enrollment_date: string
          graduation_date: string
          id: string
          program_name: string
          status: string
          student_email: string
          student_name: string
        }[]
      }
      get_academy_students_secure: {
        Args: { academy_uuid: string }
        Returns: {
          created_at: string
          enrollment_date: string
          graduation_date: string
          id: string
          program_name: string
          status: string
          student_email: string
          student_name: string
        }[]
      }
      get_all_users_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }[]
      }
      get_industries: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          id: string
          name: string
        }[]
      }
      get_professional_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          icon: string
          id: string
          name: string
          subcategories: Json
        }[]
      }
      get_profile_suggestions: {
        Args: { category_id: string }
        Returns: {
          industry_recommendations: string[]
          suggested_bio_template: string
          suggested_skills: string[]
          suggested_title_examples: string[]
        }[]
      }
      get_user_companies: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_user_company_role: {
        Args: { company_uuid: string; user_uuid: string }
        Returns: Database["public"]["Enums"]["company_role"]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role_in_company: {
        Args: { company_uuid: string; user_uuid: string }
        Returns: Database["public"]["Enums"]["company_role"]
      }
      get_user_stats_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          role_count: number
          role_name: Database["public"]["Enums"]["user_role"]
          total_users: number
        }[]
      }
      has_company_permission: {
        Args: {
          company_uuid: string
          required_role: Database["public"]["Enums"]["company_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      increment_job_title_usage: {
        Args: { job_title_text: string }
        Returns: string
      }
      insert_user_role_trigger: {
        Args: { p_role: string; p_user_id: string }
        Returns: boolean
      }
      is_academy_owner: {
        Args: { academy_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { company_uuid: string; user_uuid: string }
        Returns: boolean
      }
      migrate_existing_talent_profiles: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search_companies_directory: {
        Args: { search_term?: string }
        Returns: {
          id: string
          industry_name: string
          is_claimed: boolean
          location: string
          logo_url: string
          name: string
        }[]
      }
      search_job_titles: {
        Args: { search_term?: string }
        Returns: {
          category: string
          id: string
          title: string
          usage_count: number
        }[]
      }
      switch_user_role: {
        Args:
          | { new_role: Database["public"]["Enums"]["user_role"] }
          | { new_role: string }
        Returns: boolean
      }
      update_profile_completeness: {
        Args: { user_uuid: string }
        Returns: number
      }
    }
    Enums: {
      company_role: "owner" | "admin" | "viewer"
      opportunity_status: "draft" | "active" | "paused" | "closed"
      user_role:
        | "admin"
        | "business"
        | "talent"
        | "freemium_talent"
        | "premium_talent"
        | "freemium_business"
        | "premium_business"
        | "premium_academy"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company_role: ["owner", "admin", "viewer"],
      opportunity_status: ["draft", "active", "paused", "closed"],
      user_role: [
        "admin",
        "business",
        "talent",
        "freemium_talent",
        "premium_talent",
        "freemium_business",
        "premium_business",
        "premium_academy",
      ],
    },
  },
} as const
