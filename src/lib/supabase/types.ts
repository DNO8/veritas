// Enums según schema.sql real
export type UserRole = "person" | "startup" | "project" | "pyme";
export type ProjectStatus = "draft" | "published" | "paused";
export type MediaType = "image" | "video";

// Interfaces según schema.sql real
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  wallet_address: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  short_description: string;
  full_description: string | null;
  category: string | null;
  cover_image_url: string;
  generated_cover: boolean;
  goal_amount: string | null;
  current_amount: string;
  wallet_address: string | null;
  status: ProjectStatus;
  created_at: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  type: MediaType;
  url: string;
  order_index: number;
  created_at: string;
}

export interface ProjectRoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  estimated_cost: string | null;
  order_index: number;
  created_at: string;
}

export interface FundUsage {
  id: string;
  project_id: string;
  label: string;
  percentage: number;
  description: string | null;
  created_at: string;
}

export interface Donation {
  id: string;
  project_id: string;
  donor_wallet: string;
  amount: string;
  asset: string;
  tx_hash: string;
  network: string;
  created_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: UserRole;
          wallet_address: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role: UserRole;
          wallet_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: UserRole;
          wallet_address?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          short_description: string;
          full_description: string | null;
          category: string | null;
          cover_image_url: string;
          generated_cover: boolean;
          goal_amount: string | null;
          current_amount: string;
          wallet_address: string | null;
          status: ProjectStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          short_description: string;
          full_description?: string | null;
          category?: string | null;
          cover_image_url: string;
          generated_cover?: boolean;
          goal_amount?: string | null;
          current_amount?: string;
          wallet_address?: string | null;
          status?: ProjectStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          short_description?: string;
          full_description?: string | null;
          category?: string | null;
          cover_image_url?: string;
          generated_cover?: boolean;
          goal_amount?: string | null;
          current_amount?: string;
          wallet_address?: string | null;
          status?: ProjectStatus;
          created_at?: string;
        };
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          type: MediaType;
          url: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: MediaType;
          url: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: MediaType;
          url?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      project_roadmap_items: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          estimated_cost: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          estimated_cost?: string | null;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          estimated_cost?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      fund_usage: {
        Row: {
          id: string;
          project_id: string;
          label: string;
          percentage: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          label: string;
          percentage: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          label?: string;
          percentage?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          project_id: string;
          donor_wallet: string;
          amount: string;
          asset: string;
          tx_hash: string;
          network: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          donor_wallet: string;
          amount: string;
          asset: string;
          tx_hash: string;
          network: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          donor_wallet?: string;
          amount?: string;
          asset?: string;
          tx_hash?: string;
          network?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
      media_type: MediaType;
    };
  };
}
