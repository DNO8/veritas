export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'person' | 'startup' | 'project' | 'pyme'
          wallet_address: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role: 'person' | 'startup' | 'project' | 'pyme'
          wallet_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'person' | 'startup' | 'project' | 'pyme'
          wallet_address?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          short_description: string
          full_description: string | null
          category: string | null
          cover_image_url: string
          generated_cover: boolean
          goal_amount: number | null
          current_amount: number
          wallet_address: string | null
          status: 'draft' | 'published' | 'paused'
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          short_description: string
          full_description?: string | null
          category?: string | null
          cover_image_url: string
          generated_cover?: boolean
          goal_amount?: number | null
          current_amount?: number
          wallet_address?: string | null
          status?: 'draft' | 'published' | 'paused'
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          short_description?: string
          full_description?: string | null
          category?: string | null
          cover_image_url?: string
          generated_cover?: boolean
          goal_amount?: number | null
          current_amount?: number
          wallet_address?: string | null
          status?: 'draft' | 'published' | 'paused'
          created_at?: string
        }
      }
      project_media: {
        Row: {
          id: string
          project_id: string
          type: 'image' | 'video'
          url: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'image' | 'video'
          url: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'image' | 'video'
          url?: string
          order_index?: number
          created_at?: string
        }
      }
      project_roadmap_items: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          estimated_cost: number | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          estimated_cost?: number | null
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          estimated_cost?: number | null
          order_index?: number
          created_at?: string
        }
      }
      fund_usage: {
        Row: {
          id: string
          project_id: string
          label: string
          percentage: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          label: string
          percentage?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          label?: string
          percentage?: number | null
          description?: string | null
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          project_id: string
          donor_wallet: string
          amount: number
          asset: string
          tx_hash: string
          network: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          donor_wallet: string
          amount: number
          asset: string
          tx_hash: string
          network: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          donor_wallet?: string
          amount?: number
          asset?: string
          tx_hash?: string
          network?: string
          created_at?: string
        }
      }
      project_issuer_accounts: {
        Row: {
          id: string
          project_id: string
          public_key: string
          encrypted_secret_key: string
          network: 'testnet' | 'mainnet'
          is_active: boolean
          is_funded: boolean
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          public_key: string
          encrypted_secret_key: string
          network: 'testnet' | 'mainnet'
          is_active?: boolean
          is_funded?: boolean
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          public_key?: string
          encrypted_secret_key?: string
          network?: 'testnet' | 'mainnet'
          is_active?: boolean
          is_funded?: boolean
          last_used_at?: string | null
          created_at?: string
        }
      }
      project_benefits: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          benefit_type: 'physical_product' | 'digital_product' | 'service' | 'access' | 'experience' | 'recognition' | 'discount' | 'other'
          asset_code: string
          total_supply: number
          issued_supply: number
          minimum_donation: number
          donation_currency: string
          redemption_type: 'date_range' | 'on_demand' | 'hybrid' | 'instant'
          valid_from: string | null
          valid_until: string | null
          timezone: string
          max_per_backer: number
          is_limited: boolean
          is_active: boolean
          image_url: string | null
          estimated_delivery: string | null
          shipping_required: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description: string
          benefit_type: 'physical_product' | 'digital_product' | 'service' | 'access' | 'experience' | 'recognition' | 'discount' | 'other'
          asset_code: string
          total_supply: number
          issued_supply?: number
          minimum_donation: number
          donation_currency?: string
          redemption_type: 'date_range' | 'on_demand' | 'hybrid' | 'instant'
          valid_from?: string | null
          valid_until?: string | null
          timezone?: string
          max_per_backer?: number
          is_limited?: boolean
          is_active?: boolean
          image_url?: string | null
          estimated_delivery?: string | null
          shipping_required?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string
          benefit_type?: 'physical_product' | 'digital_product' | 'service' | 'access' | 'experience' | 'recognition' | 'discount' | 'other'
          asset_code?: string
          total_supply?: number
          issued_supply?: number
          minimum_donation?: number
          donation_currency?: string
          redemption_type?: 'date_range' | 'on_demand' | 'hybrid' | 'instant'
          valid_from?: string | null
          valid_until?: string | null
          timezone?: string
          max_per_backer?: number
          is_limited?: boolean
          is_active?: boolean
          image_url?: string | null
          estimated_delivery?: string | null
          shipping_required?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      benefit_holdings: {
        Row: {
          id: string
          benefit_id: string
          donation_id: string | null
          holder_wallet: string
          holder_user_id: string | null
          quantity: number
          is_active: boolean
          last_verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          benefit_id: string
          donation_id?: string | null
          holder_wallet: string
          holder_user_id?: string | null
          quantity: number
          is_active?: boolean
          last_verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          benefit_id?: string
          donation_id?: string | null
          holder_wallet?: string
          holder_user_id?: string | null
          quantity?: number
          is_active?: boolean
          last_verified_at?: string | null
          created_at?: string
        }
      }
      benefit_redemptions: {
        Row: {
          id: string
          benefit_id: string
          holding_id: string
          user_id: string | null
          redeemed_at: string
          redemption_proof: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          benefit_id: string
          holding_id: string
          user_id?: string | null
          redeemed_at?: string
          redemption_proof?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          benefit_id?: string
          holding_id?: string
          user_id?: string | null
          redeemed_at?: string
          redemption_proof?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
      }
      benefit_schedules: {
        Row: {
          id: string
          benefit_id: string
          day_of_week: number
          start_time: string
          end_time: string
          max_slots: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          benefit_id: string
          day_of_week: number
          start_time: string
          end_time: string
          max_slots?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          benefit_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          max_slots?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      stellar_transactions: {
        Row: {
          id: string
          tx_type: string
          tx_hash: string
          source_account: string
          destination_account: string | null
          network: string
          asset_code: string | null
          amount: string | null
          project_id: string | null
          benefit_id: string | null
          donation_id: string | null
          status: string
          error_message: string | null
          confirmed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tx_type: string
          tx_hash: string
          source_account: string
          destination_account?: string | null
          network: string
          asset_code?: string | null
          amount?: string | null
          project_id?: string | null
          benefit_id?: string | null
          donation_id?: string | null
          status: string
          error_message?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tx_type?: string
          tx_hash?: string
          source_account?: string
          destination_account?: string | null
          network?: string
          asset_code?: string | null
          amount?: string | null
          project_id?: string | null
          benefit_id?: string | null
          donation_id?: string | null
          status?: string
          error_message?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'person' | 'startup' | 'project' | 'pyme'
      project_status: 'draft' | 'published' | 'paused'
      media_type: 'image' | 'video'
      benefit_type: 'physical_product' | 'digital_product' | 'service' | 'access' | 'experience' | 'recognition' | 'discount' | 'other'
      redemption_type: 'date_range' | 'on_demand' | 'hybrid' | 'instant'
      redemption_status: 'pending' | 'confirmed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Donation = Database['public']['Tables']['donations']['Row']
export type DonationInsert = Database['public']['Tables']['donations']['Insert']
export type DonationUpdate = Database['public']['Tables']['donations']['Update']

export type ProjectStatus = Database['public']['Enums']['project_status']
export type UserRole = Database['public']['Enums']['user_role']
export type MediaType = Database['public']['Enums']['media_type']
export type BenefitType = Database['public']['Enums']['benefit_type']
export type RedemptionType = Database['public']['Enums']['redemption_type']
export type RedemptionStatus = Database['public']['Enums']['redemption_status']