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
    PostgrestVersion: "13.0.5"
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
      admin_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          type: string | null
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      application_ratings: {
        Row: {
          application_id: string
          comments: string | null
          created_at: string
          criteria_ratings: Json
          id: string
          overall_rating: number
          rated_by_user_id: string
          recommendation: string
          updated_at: string
        }
        Insert: {
          application_id: string
          comments?: string | null
          created_at?: string
          criteria_ratings?: Json
          id?: string
          overall_rating: number
          rated_by_user_id: string
          recommendation: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          comments?: string | null
          created_at?: string
          criteria_ratings?: Json
          id?: string
          overall_rating?: number
          rated_by_user_id?: string
          recommendation?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_ratings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          status: string
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
          status?: string
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
          status?: string
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      conversation_overrides: {
        Row: {
          archived: boolean
          conversation_id: string
          created_at: string
          force_unread: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          conversation_id: string
          created_at?: string
          force_unread?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          conversation_id?: string
          created_at?: string
          force_unread?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          created_at: string
          id: string
          last_message_at: string | null
          priority: string
          status: string
          subject: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          priority?: string
          status?: string
          subject?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          priority?: string
          status?: string
          subject?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      marketplace_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_publishing_requests: {
        Row: {
          admin_notes: string | null
          budget: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          requirements: string | null
          service_type: string
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          requirements?: string | null
          service_type: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          requirements?: string | null
          service_type?: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_service_requests: {
        Row: {
          budget_range: string
          company_name: string | null
          created_at: string
          id: string
          message: string
          project_type: string
          requester_email: string
          requester_id: string | null
          requester_name: string
          requester_phone: string | null
          service_id: string
          status: string
          timeline: string
          updated_at: string
        }
        Insert: {
          budget_range: string
          company_name?: string | null
          created_at?: string
          id?: string
          message: string
          project_type: string
          requester_email: string
          requester_id?: string | null
          requester_name: string
          requester_phone?: string | null
          service_id: string
          status?: string
          timeline: string
          updated_at?: string
        }
        Update: {
          budget_range?: string
          company_name?: string | null
          created_at?: string
          id?: string
          message?: string
          project_type?: string
          requester_email?: string
          requester_id?: string | null
          requester_name?: string
          requester_phone?: string | null
          service_id?: string
          status?: string
          timeline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "marketplace_services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_services: {
        Row: {
          category: string
          created_at: string
          currency: string
          delivery_time: string
          demo_url: string | null
          description: string
          id: string
          is_available: boolean
          location: string
          portfolio_url: string | null
          price: number
          rating: number | null
          requests_count: number
          reviews_count: number
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          delivery_time: string
          demo_url?: string | null
          description: string
          id?: string
          is_available?: boolean
          location: string
          portfolio_url?: string | null
          price: number
          rating?: number | null
          requests_count?: number
          reviews_count?: number
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          delivery_time?: string
          demo_url?: string | null
          description?: string
          id?: string
          is_available?: boolean
          location?: string
          portfolio_url?: string | null
          price?: number
          rating?: number | null
          requests_count?: number
          reviews_count?: number
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          archived_by: string[] | null
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          content: string | null
          conversation_id: string
          conversation_uuid: string | null
          created_at: string
          delivered_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_read: boolean
          label: string | null
          message_type: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          archived_by?: string[] | null
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          content?: string | null
          conversation_id: string
          conversation_uuid?: string | null
          created_at?: string
          delivered_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          label?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          archived_by?: string[] | null
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          content?: string | null
          conversation_id?: string
          conversation_uuid?: string | null
          created_at?: string
          delivered_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          label?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_uuid_fkey"
            columns: ["conversation_uuid"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
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
          is_public: boolean | null
          location: string | null
          payment_type: string | null
          public_url: string | null
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
          is_public?: boolean | null
          location?: string | null
          payment_type?: string | null
          public_url?: string | null
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
          is_public?: boolean | null
          location?: string | null
          payment_type?: string | null
          public_url?: string | null
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
      opportunity_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      opportunity_shares: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          share_type: string
          share_url: string | null
          shared_by: string
          updated_at: string
          views_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          share_type: string
          share_url?: string | null
          shared_by: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          share_type?: string
          share_url?: string | null
          shared_by?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_shares_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_views: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_views_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
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
          notification_preferences: Json | null
          phone: string | null
          position: string | null
          privacy_settings: Json | null
          professional_preferences: Json | null
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
          notification_preferences?: Json | null
          phone?: string | null
          position?: string | null
          privacy_settings?: Json | null
          professional_preferences?: Json | null
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
          notification_preferences?: Json | null
          phone?: string | null
          position?: string | null
          privacy_settings?: Json | null
          professional_preferences?: Json | null
          profile_completeness?: number | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          video_presentation_url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          subscription?: Json
          updated_at?: string
          user_id?: string
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
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string | null
          details: Json | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description?: string | null
          details?: Json | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string | null
          details?: Json | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: []
      }
      service_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          rating: number
          reviewer_id: string
          service_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating: number
          reviewer_id: string
          service_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number
          reviewer_id?: string
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "marketplace_services"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_education: {
        Row: {
          created_at: string | null
          current: boolean | null
          degree: string
          description: string | null
          end_date: string | null
          field: string | null
          id: string
          institution: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current?: boolean | null
          degree: string
          description?: string | null
          end_date?: string | null
          field?: string | null
          id?: string
          institution: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current?: boolean | null
          degree?: string
          description?: string | null
          end_date?: string | null
          field?: string | null
          id?: string
          institution?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      talent_experiences: {
        Row: {
          company: string
          created_at: string | null
          current: boolean | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          position: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          position: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          position?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      talent_portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_primary: boolean | null
          title: string
          type: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          title: string
          type?: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          experience_level: string | null
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          industries_of_interest: string[] | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          primary_category_id: string | null
          secondary_category_id: string | null
          skills: string[] | null
          specialty: string | null
          title: string | null
          updated_at: string
          user_id: string
          video_presentation_url: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          experience_level?: string | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          industries_of_interest?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          primary_category_id?: string | null
          secondary_category_id?: string | null
          skills?: string[] | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          video_presentation_url?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          experience_level?: string | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          industries_of_interest?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          primary_category_id?: string | null
          secondary_category_id?: string | null
          skills?: string[] | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          video_presentation_url?: string | null
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
      talent_social_links: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
      user_notification_preferences: {
        Row: {
          created_at: string
          email: boolean
          enabled: boolean
          id: string
          notification_type: string
          push: boolean
          sms: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: boolean
          enabled?: boolean
          id?: string
          notification_type: string
          push?: boolean
          sms?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: boolean
          enabled?: boolean
          id?: string
          notification_type?: string
          push?: boolean
          sms?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      cleanup_expired_typing_indicators: { Args: never; Returns: undefined }
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
        Args: never
        Returns: {
          created_at: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }[]
      }
      get_industries: {
        Args: never
        Returns: {
          description: string
          id: string
          name: string
        }[]
      }
      get_professional_categories: {
        Args: never
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
      get_talent_phone_if_authorized: {
        Args: { talent_user_uuid: string }
        Returns: string
      }
      get_user_companies: { Args: { user_uuid: string }; Returns: string[] }
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
        Args: never
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
      has_meaningful_interaction_with_talent: {
        Args: { business_user_uuid: string; talent_user_uuid: string }
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
      is_profile_visible_to: {
        Args: { profile_user_id: string; viewer_user_id: string }
        Returns: boolean
      }
      migrate_existing_conversations: { Args: never; Returns: undefined }
      migrate_existing_talent_profiles: { Args: never; Returns: string }
      notify_access_request: {
        Args: {
          p_company_id: string
          p_requested_role?: string
          p_requester_id: string
        }
        Returns: undefined
      }
      notify_company_warning: {
        Args: {
          p_company_id: string
          p_warning_message: string
          p_warning_title: string
        }
        Returns: undefined
      }
      notify_expiring_opportunities: { Args: never; Returns: undefined }
      notify_inactive_opportunities: { Args: never; Returns: undefined }
      notify_opportunity_removed: {
        Args: { p_opportunity_id: string; p_reason?: string }
        Returns: undefined
      }
      notify_service_inquiry: {
        Args: { p_inquirer_id: string; p_message: string; p_service_id: string }
        Returns: undefined
      }
      process_pending_notifications: {
        Args: never
        Returns: {
          notification_id: string
          processed: boolean
        }[]
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
      send_notification: {
        Args: {
          p_action_url?: string
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      should_send_notification: {
        Args: { channel?: string; notification_type: string }
        Returns: boolean
      }
      start_conversation: {
        Args: {
          p_company_id: string
          p_label?: string
          p_resource_ref?: Json
          p_talent_user_id: string
        }
        Returns: string
      }
      switch_user_role:
        | {
            Args: { new_role: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.switch_user_role(new_role => text), public.switch_user_role(new_role => user_role). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { new_role: Database["public"]["Enums"]["user_role"] }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.switch_user_role(new_role => text), public.switch_user_role(new_role => user_role). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
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
