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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          completion_tokens: number | null
          content: string
          context_documents: string[] | null
          context_stories: string[] | null
          created_at: string | null
          id: string
          model_used: string | null
          prompt_tokens: number | null
          role: string
          session_id: string | null
          total_tokens: number | null
        }
        Insert: {
          completion_tokens?: number | null
          content: string
          context_documents?: string[] | null
          context_stories?: string[] | null
          created_at?: string | null
          id?: string
          model_used?: string | null
          prompt_tokens?: number | null
          role: string
          session_id?: string | null
          total_tokens?: number | null
        }
        Update: {
          completion_tokens?: number | null
          content?: string
          context_documents?: string[] | null
          context_stories?: string[] | null
          created_at?: string | null
          id?: string
          model_used?: string | null
          prompt_tokens?: number | null
          role?: string
          session_id?: string | null
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_permissions: {
        Row: {
          allowed_contexts: string[] | null
          can_be_revoked: boolean | null
          created_at: string | null
          expires_date: string | null
          granted_date: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          permission_granted: boolean | null
          permission_scope: string
          permission_type: string
          profile_id: string | null
          revocation_reason: string | null
          revoked_date: string | null
          updated_at: string | null
          verification_date: string | null
          verification_notes: string | null
          verified_by: string | null
        }
        Insert: {
          allowed_contexts?: string[] | null
          can_be_revoked?: boolean | null
          created_at?: string | null
          expires_date?: string | null
          granted_date?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          permission_granted?: boolean | null
          permission_scope: string
          permission_type: string
          profile_id?: string | null
          revocation_reason?: string | null
          revoked_date?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verified_by?: string | null
        }
        Update: {
          allowed_contexts?: string[] | null
          can_be_revoked?: boolean | null
          created_at?: string | null
          expires_date?: string | null
          granted_date?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          permission_granted?: boolean | null
          permission_scope?: string
          permission_type?: string
          profile_id?: string | null
          revocation_reason?: string | null
          revoked_date?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_permissions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_permissions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_embeddings: {
        Row: {
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          model_version: string | null
          token_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          model_version?: string | null
          token_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          model_version?: string | null
          token_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_level: string | null
          author: string | null
          category: string
          created_at: string | null
          description: string | null
          document_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_archived: boolean | null
          is_featured: boolean | null
          mime_type: string | null
          related_story_id: string | null
          related_storyteller_id: string | null
          source: string | null
          supabase_bucket: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          access_level?: string | null
          author?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_archived?: boolean | null
          is_featured?: boolean | null
          mime_type?: string | null
          related_story_id?: string | null
          related_storyteller_id?: string | null
          source?: string | null
          supabase_bucket?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          access_level?: string | null
          author?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_archived?: boolean | null
          is_featured?: boolean | null
          mime_type?: string | null
          related_story_id?: string | null
          related_storyteller_id?: string | null
          source?: string | null
          supabase_bucket?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_related_story_id_fkey"
            columns: ["related_story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_related_story_id_fkey"
            columns: ["related_story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_storyteller"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_related_storyteller_id_fkey"
            columns: ["related_storyteller_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_related_storyteller_id_fkey"
            columns: ["related_storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_activities: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string | null
          engagement_score: number | null
          id: string
          ip_address: unknown
          profile_id: string | null
          session_id: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: unknown
          profile_id?: string | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: unknown
          profile_id?: string | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_indicators: {
        Row: {
          baseline_value: string | null
          change_observed: string | null
          contributed_by: string | null
          created_at: string | null
          id: string
          indicator_description: string | null
          indicator_name: string
          indicator_type: string
          measurement_date: string | null
          measurement_period_end: string | null
          measurement_period_start: string | null
          measurement_type: string
          metadata: Json | null
          pattern_category: string | null
          profile_id: string | null
          related_indicators: string[] | null
          service_area: string | null
          significance: string | null
          story_id: string | null
          target_value: string | null
          value_category: string | null
          value_numeric: number | null
          value_text: string | null
          verified_by: string | null
        }
        Insert: {
          baseline_value?: string | null
          change_observed?: string | null
          contributed_by?: string | null
          created_at?: string | null
          id?: string
          indicator_description?: string | null
          indicator_name: string
          indicator_type: string
          measurement_date?: string | null
          measurement_period_end?: string | null
          measurement_period_start?: string | null
          measurement_type: string
          metadata?: Json | null
          pattern_category?: string | null
          profile_id?: string | null
          related_indicators?: string[] | null
          service_area?: string | null
          significance?: string | null
          story_id?: string | null
          target_value?: string | null
          value_category?: string | null
          value_numeric?: number | null
          value_text?: string | null
          verified_by?: string | null
        }
        Update: {
          baseline_value?: string | null
          change_observed?: string | null
          contributed_by?: string | null
          created_at?: string | null
          id?: string
          indicator_description?: string | null
          indicator_name?: string
          indicator_type?: string
          measurement_date?: string | null
          measurement_period_end?: string | null
          measurement_period_start?: string | null
          measurement_type?: string
          metadata?: Json | null
          pattern_category?: string | null
          profile_id?: string | null
          related_indicators?: string[] | null
          service_area?: string | null
          significance?: string | null
          story_id?: string | null
          target_value?: string | null
          value_category?: string | null
          value_numeric?: number | null
          value_text?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_indicators_contributed_by_fkey"
            columns: ["contributed_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_indicators_contributed_by_fkey"
            columns: ["contributed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_indicators_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_indicators_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_indicators_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_indicators_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_storyteller"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_indicators_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_indicators_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_services: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          organization_id: string | null
          service_category: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          service_category?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          service_category?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          coordinates: unknown
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          location: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          organization_type: string | null
          phone: string | null
          primary_color: string | null
          short_name: string | null
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          organization_type?: string | null
          phone?: string | null
          primary_color?: string | null
          short_name?: string | null
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          organization_type?: string | null
          phone?: string | null
          primary_color?: string | null
          short_name?: string | null
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          allow_messages: boolean | null
          bio: string | null
          can_share_traditional_knowledge: boolean | null
          community_role: string | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          engagement_score: number | null
          expertise_areas: string[] | null
          face_recognition_consent: boolean | null
          face_recognition_consent_date: string | null
          full_name: string
          gender: string | null
          id: string
          indigenous_status: string | null
          is_cultural_advisor: boolean | null
          is_elder: boolean | null
          is_service_provider: boolean | null
          language_group: string | null
          languages_spoken: string[] | null
          last_story_date: string | null
          location: string | null
          metadata: Json | null
          organization_id: string | null
          phone: string | null
          photo_consent_contexts: string[] | null
          preferred_name: string | null
          primary_organization_id: string | null
          profile_image_url: string | null
          profile_visibility: string | null
          role: string | null
          show_in_directory: boolean | null
          stories_contributed: number | null
          storyteller_type: string
          traditional_country: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age_range?: string | null
          allow_messages?: boolean | null
          bio?: string | null
          can_share_traditional_knowledge?: boolean | null
          community_role?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          engagement_score?: number | null
          expertise_areas?: string[] | null
          face_recognition_consent?: boolean | null
          face_recognition_consent_date?: string | null
          full_name: string
          gender?: string | null
          id?: string
          indigenous_status?: string | null
          is_cultural_advisor?: boolean | null
          is_elder?: boolean | null
          is_service_provider?: boolean | null
          language_group?: string | null
          languages_spoken?: string[] | null
          last_story_date?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          phone?: string | null
          photo_consent_contexts?: string[] | null
          preferred_name?: string | null
          primary_organization_id?: string | null
          profile_image_url?: string | null
          profile_visibility?: string | null
          role?: string | null
          show_in_directory?: boolean | null
          stories_contributed?: number | null
          storyteller_type?: string
          traditional_country?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age_range?: string | null
          allow_messages?: boolean | null
          bio?: string | null
          can_share_traditional_knowledge?: boolean | null
          community_role?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          engagement_score?: number | null
          expertise_areas?: string[] | null
          face_recognition_consent?: boolean | null
          face_recognition_consent_date?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          indigenous_status?: string | null
          is_cultural_advisor?: boolean | null
          is_elder?: boolean | null
          is_service_provider?: boolean | null
          language_group?: string | null
          languages_spoken?: string[] | null
          last_story_date?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          phone?: string | null
          photo_consent_contexts?: string[] | null
          preferred_name?: string | null
          primary_organization_id?: string | null
          profile_image_url?: string | null
          profile_visibility?: string | null
          role?: string | null
          show_in_directory?: boolean | null
          stories_contributed?: number | null
          storyteller_type?: string
          traditional_country?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_primary_organization_id_fkey"
            columns: ["primary_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          last_used_at: string | null
          name: string
          query: string
          search_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          last_used_at?: string | null
          name: string
          query: string
          search_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          last_used_at?: string | null
          name?: string
          query?: string
          search_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          clicked_results: string[] | null
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          search_type: string | null
          user_id: string | null
        }
        Insert: {
          clicked_results?: string[] | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          search_type?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_results?: string[] | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          search_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_story_links: {
        Row: {
          created_at: string | null
          demonstrates_effectiveness: boolean | null
          id: string
          improvement_area: string | null
          metadata: Json | null
          replication_potential: string | null
          service_interaction_date: string | null
          service_name: string
          service_outcome: string | null
          staff_member: string | null
          story_id: string | null
        }
        Insert: {
          created_at?: string | null
          demonstrates_effectiveness?: boolean | null
          id?: string
          improvement_area?: string | null
          metadata?: Json | null
          replication_potential?: string | null
          service_interaction_date?: string | null
          service_name: string
          service_outcome?: string | null
          staff_member?: string | null
          story_id?: string | null
        }
        Update: {
          created_at?: string | null
          demonstrates_effectiveness?: boolean | null
          id?: string
          improvement_area?: string | null
          metadata?: Json | null
          replication_potential?: string | null
          service_interaction_date?: string | null
          service_name?: string
          service_outcome?: string | null
          staff_member?: string | null
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_story_links_staff_member_fkey"
            columns: ["staff_member"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_story_links_staff_member_fkey"
            columns: ["staff_member"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_story_links_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_story_links_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_storyteller"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          access_level: string | null
          acknowledge_others: string[] | null
          attribution: string | null
          category: string
          collected_by: string | null
          collection_date: string | null
          comments_count: number | null
          contains_traditional_knowledge: boolean | null
          content: string
          content_embedding: string | null
          coordinates: unknown
          created_at: string | null
          cultural_sensitivity_level: string | null
          elder_approval_date: string | null
          elder_approval_given: boolean | null
          elder_approval_required: boolean | null
          id: string
          impact_type: string[] | null
          is_featured: boolean | null
          is_verified: boolean | null
          keywords: string[] | null
          likes: number | null
          location: string | null
          location_type: string | null
          metadata: Json | null
          organization_id: string | null
          outcome_achieved: string | null
          people_affected: number | null
          published_at: string | null
          related_service: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_id: string | null
          shares: number | null
          sharing_approved_by: string[] | null
          status: string | null
          story_date: string | null
          story_type: string
          storyteller_id: string
          sub_category: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          verification_notes: string | null
          views: number | null
        }
        Insert: {
          access_level?: string | null
          acknowledge_others?: string[] | null
          attribution?: string | null
          category: string
          collected_by?: string | null
          collection_date?: string | null
          comments_count?: number | null
          contains_traditional_knowledge?: boolean | null
          content: string
          content_embedding?: string | null
          coordinates?: unknown
          created_at?: string | null
          cultural_sensitivity_level?: string | null
          elder_approval_date?: string | null
          elder_approval_given?: boolean | null
          elder_approval_required?: boolean | null
          id?: string
          impact_type?: string[] | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          likes?: number | null
          location?: string | null
          location_type?: string | null
          metadata?: Json | null
          organization_id?: string | null
          outcome_achieved?: string | null
          people_affected?: number | null
          published_at?: string | null
          related_service?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id?: string | null
          shares?: number | null
          sharing_approved_by?: string[] | null
          status?: string | null
          story_date?: string | null
          story_type?: string
          storyteller_id: string
          sub_category?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          verification_notes?: string | null
          views?: number | null
        }
        Update: {
          access_level?: string | null
          acknowledge_others?: string[] | null
          attribution?: string | null
          category?: string
          collected_by?: string | null
          collection_date?: string | null
          comments_count?: number | null
          contains_traditional_knowledge?: boolean | null
          content?: string
          content_embedding?: string | null
          coordinates?: unknown
          created_at?: string | null
          cultural_sensitivity_level?: string | null
          elder_approval_date?: string | null
          elder_approval_given?: boolean | null
          elder_approval_required?: boolean | null
          id?: string
          impact_type?: string[] | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          likes?: number | null
          location?: string | null
          location_type?: string | null
          metadata?: Json | null
          organization_id?: string | null
          outcome_achieved?: string | null
          people_affected?: number | null
          published_at?: string | null
          related_service?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id?: string | null
          shares?: number | null
          sharing_approved_by?: string[] | null
          status?: string | null
          story_date?: string | null
          story_type?: string
          storyteller_id?: string
          sub_category?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          verification_notes?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "organization_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_embeddings: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: string
          model_version: string | null
          story_id: string | null
          token_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          model_version?: string | null
          story_id?: string | null
          token_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          model_version?: string | null
          story_id?: string | null
          token_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_embeddings_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: true
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_embeddings_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: true
            referencedRelation: "stories_with_storyteller"
            referencedColumns: ["id"]
          },
        ]
      }
      story_media: {
        Row: {
          all_permissions_obtained: boolean | null
          alt_text: string | null
          caption: string | null
          created_at: string | null
          display_order: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          media_embedding: string | null
          media_type: string
          metadata: Json | null
          ml_analysis: Json | null
          people_in_media: string[] | null
          requires_permission: boolean | null
          story_id: string | null
          supabase_bucket: string
        }
        Insert: {
          all_permissions_obtained?: boolean | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          media_embedding?: string | null
          media_type: string
          metadata?: Json | null
          ml_analysis?: Json | null
          people_in_media?: string[] | null
          requires_permission?: boolean | null
          story_id?: string | null
          supabase_bucket: string
        }
        Update: {
          all_permissions_obtained?: boolean | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          media_embedding?: string | null
          media_type?: string
          metadata?: Json | null
          ml_analysis?: Json | null
          people_in_media?: string[] | null
          requires_permission?: boolean | null
          story_id?: string | null
          supabase_bucket?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_storyteller"
            referencedColumns: ["id"]
          },
        ]
      }
      story_patterns: {
        Row: {
          created_at: string | null
          discovered_by: string | null
          discovery_date: string | null
          id: string
          impact_category: string | null
          key_elements: string[] | null
          metadata: Json | null
          pattern_description: string | null
          pattern_name: string
          pattern_strength: number | null
          pattern_type: string
          people_affected_estimate: number | null
          replication_guidance: string | null
          story_ids: string[]
          success_factors: string[] | null
          verification_date: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          discovered_by?: string | null
          discovery_date?: string | null
          id?: string
          impact_category?: string | null
          key_elements?: string[] | null
          metadata?: Json | null
          pattern_description?: string | null
          pattern_name: string
          pattern_strength?: number | null
          pattern_type: string
          people_affected_estimate?: number | null
          replication_guidance?: string | null
          story_ids: string[]
          success_factors?: string[] | null
          verification_date?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          discovered_by?: string | null
          discovery_date?: string | null
          id?: string
          impact_category?: string | null
          key_elements?: string[] | null
          metadata?: Json | null
          pattern_description?: string | null
          pattern_name?: string
          pattern_strength?: number | null
          pattern_type?: string
          people_affected_estimate?: number | null
          replication_guidance?: string | null
          story_ids?: string[]
          success_factors?: string[] | null
          verification_date?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_patterns_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_patterns_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_quotes: {
        Row: {
          context_after: string | null
          context_before: string | null
          created_at: string | null
          embedding: string | null
          extracted_by: string | null
          id: string
          impact_score: number | null
          is_featured: boolean | null
          position_in_story: number | null
          quote_text: string
          sentiment: number | null
          story_id: string | null
          themes: string[] | null
        }
        Insert: {
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          embedding?: string | null
          extracted_by?: string | null
          id?: string
          impact_score?: number | null
          is_featured?: boolean | null
          position_in_story?: number | null
          quote_text: string
          sentiment?: number | null
          story_id?: string | null
          themes?: string[] | null
        }
        Update: {
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          embedding?: string | null
          extracted_by?: string | null
          id?: string
          impact_score?: number | null
          is_featured?: boolean | null
          position_in_story?: number | null
          quote_text?: string
          sentiment?: number | null
          story_id?: string | null
          themes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "story_quotes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_quotes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_storyteller"
            referencedColumns: ["id"]
          },
        ]
      }
      story_themes: {
        Row: {
          confidence: number | null
          extracted_at: string | null
          extracted_by: string | null
          id: string
          relevance_score: number | null
          story_id: string | null
          theme_id: string | null
        }
        Insert: {
          confidence?: number | null
          extracted_at?: string | null
          extracted_by?: string | null
          id?: string
          relevance_score?: number | null
          story_id?: string | null
          theme_id?: string | null
        }
        Update: {
          confidence?: number | null
          extracted_at?: string | null
          extracted_by?: string | null
          id?: string
          relevance_score?: number | null
          story_id?: string | null
          theme_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_themes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_themes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_storyteller"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          embedding: string | null
          icon: string | null
          id: string
          name: string
          parent_theme_id: string | null
          story_count: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_theme_id?: string | null
          story_count?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_theme_id?: string | null
          story_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "themes_parent_theme_id_fkey"
            columns: ["parent_theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_storytellers: {
        Row: {
          age_range: string | null
          allow_messages: boolean | null
          bio: string | null
          can_share_traditional_knowledge: boolean | null
          community_role: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          engagement_score: number | null
          expertise_areas: string[] | null
          face_recognition_consent: boolean | null
          face_recognition_consent_date: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          indigenous_status: string | null
          is_cultural_advisor: boolean | null
          is_elder: boolean | null
          is_service_provider: boolean | null
          language_group: string | null
          languages_spoken: string[] | null
          last_story_date: string | null
          location: string | null
          metadata: Json | null
          most_recent_story: string | null
          phone: string | null
          photo_consent_contexts: string[] | null
          preferred_name: string | null
          profile_visibility: string | null
          show_in_directory: boolean | null
          stories_contributed: number | null
          storyteller_type: string | null
          total_stories: number | null
          traditional_country: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories_with_storyteller: {
        Row: {
          access_level: string | null
          acknowledge_others: string[] | null
          attribution: string | null
          category: string | null
          collected_by: string | null
          collection_date: string | null
          comments_count: number | null
          contains_traditional_knowledge: boolean | null
          content: string | null
          content_embedding: string | null
          coordinates: unknown
          created_at: string | null
          cultural_sensitivity_level: string | null
          elder_approval_date: string | null
          elder_approval_given: boolean | null
          elder_approval_required: boolean | null
          id: string | null
          impact_type: string[] | null
          is_featured: boolean | null
          is_verified: boolean | null
          keywords: string[] | null
          likes: number | null
          location: string | null
          location_type: string | null
          metadata: Json | null
          outcome_achieved: string | null
          people_affected: number | null
          published_at: string | null
          related_service: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          shares: number | null
          sharing_approved_by: string[] | null
          status: string | null
          story_date: string | null
          story_type: string | null
          storyteller_id: string | null
          storyteller_is_elder: boolean | null
          storyteller_name: string | null
          storyteller_preferred_name: string | null
          storyteller_role: string | null
          sub_category: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          verification_notes: string | null
          views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "active_storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      find_similar_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          document_id: string
          similarity: number
          title: string
        }[]
      }
      find_similar_stories: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          similarity: number
          story_id: string
          title: string
        }[]
      }
      get_storyteller_stats: {
        Args: { storyteller_uuid: string }
        Returns: {
          community_stories: number
          engagement_score: number
          last_story_date: string
          public_stories: number
          restricted_stories: number
          total_shares: number
          total_stories: number
          total_views: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
