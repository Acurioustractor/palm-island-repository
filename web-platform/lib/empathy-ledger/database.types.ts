/**
 * Supabase Database Types
 * Auto-generated type definitions for the Empathy Ledger schema
 */

import type { Profile, Story, StoryMedia, ImpactIndicator, EngagementActivity } from './types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
      }
      stories: {
        Row: Story
        Insert: Partial<Story>
        Update: Partial<Story>
      }
      story_media: {
        Row: StoryMedia
        Insert: Partial<StoryMedia>
        Update: Partial<StoryMedia>
      }
      impact_indicators: {
        Row: ImpactIndicator
        Insert: Partial<ImpactIndicator>
        Update: Partial<ImpactIndicator>
      }
      engagement_activities: {
        Row: EngagementActivity
        Insert: Partial<EngagementActivity>
        Update: Partial<EngagementActivity>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
