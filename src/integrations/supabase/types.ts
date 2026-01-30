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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      business_plan_drafts: {
        Row: {
          created_at: string
          current_step: number
          email: string
          expires_at: string
          id: string
          name: string | null
          plan_data: Json
          resume_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          email: string
          expires_at?: string
          id?: string
          name?: string | null
          plan_data?: Json
          resume_token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_step?: number
          email?: string
          expires_at?: string
          id?: string
          name?: string | null
          plan_data?: Json
          resume_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          business_name: string | null
          city: string | null
          created_at: string
          email: string
          estimated_budget: number | null
          estimated_monthly_revenue: number | null
          estimated_roi: number | null
          estimated_square_footage: number | null
          facility_size: string | null
          facility_type: string | null
          id: string
          name: string
          phone: string | null
          referrer: string | null
          source: string
          sports: string | null
          state: string | null
          sync_attempted_at: string | null
          sync_error: string | null
          synced_to_google_sheets: boolean | null
          user_agent: string | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          created_at?: string
          email: string
          estimated_budget?: number | null
          estimated_monthly_revenue?: number | null
          estimated_roi?: number | null
          estimated_square_footage?: number | null
          facility_size?: string | null
          facility_type?: string | null
          id?: string
          name: string
          phone?: string | null
          referrer?: string | null
          source: string
          sports?: string | null
          state?: string | null
          sync_attempted_at?: string | null
          sync_error?: string | null
          synced_to_google_sheets?: boolean | null
          user_agent?: string | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          created_at?: string
          email?: string
          estimated_budget?: number | null
          estimated_monthly_revenue?: number | null
          estimated_roi?: number | null
          estimated_square_footage?: number | null
          facility_size?: string | null
          facility_type?: string | null
          id?: string
          name?: string
          phone?: string | null
          referrer?: string | null
          source?: string
          sports?: string | null
          state?: string | null
          sync_attempted_at?: string | null
          sync_error?: string | null
          synced_to_google_sheets?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      product_pricing: {
        Row: {
          cost_library_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          price_tier: string | null
          product_name: string
          scraped_price: number | null
          source_url: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          cost_library_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          price_tier?: string | null
          product_name: string
          scraped_price?: number | null
          source_url?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          cost_library_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          price_tier?: string | null
          product_name?: string
          scraped_price?: number | null
          source_url?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wizard_submissions: {
        Row: {
          amenities: Json | null
          break_even_months: number | null
          business_model: string | null
          created_at: string
          experience_level: string | null
          facility_size: string | null
          facility_type: string | null
          financial_metrics: Json | null
          id: string
          lead_business: string | null
          lead_email: string
          lead_name: string
          lead_phone: string | null
          location_type: string | null
          monthly_opex: number | null
          monthly_revenue: number | null
          operating_hours: string | null
          owner_id: string
          recommendations: Json
          revenue_model: Json | null
          roi_percentage: number | null
          selected_sports: Json | null
          sports_breakdown: Json | null
          submission_date: string | null
          target_market: Json | null
          timeline: string | null
          total_investment: number | null
          total_square_footage: number | null
          updated_at: string
          wizard_responses: Json
        }
        Insert: {
          amenities?: Json | null
          break_even_months?: number | null
          business_model?: string | null
          created_at?: string
          experience_level?: string | null
          facility_size?: string | null
          facility_type?: string | null
          financial_metrics?: Json | null
          id?: string
          lead_business?: string | null
          lead_email: string
          lead_name: string
          lead_phone?: string | null
          location_type?: string | null
          monthly_opex?: number | null
          monthly_revenue?: number | null
          operating_hours?: string | null
          owner_id: string
          recommendations: Json
          revenue_model?: Json | null
          roi_percentage?: number | null
          selected_sports?: Json | null
          sports_breakdown?: Json | null
          submission_date?: string | null
          target_market?: Json | null
          timeline?: string | null
          total_investment?: number | null
          total_square_footage?: number | null
          updated_at?: string
          wizard_responses: Json
        }
        Update: {
          amenities?: Json | null
          break_even_months?: number | null
          business_model?: string | null
          created_at?: string
          experience_level?: string | null
          facility_size?: string | null
          facility_type?: string | null
          financial_metrics?: Json | null
          id?: string
          lead_business?: string | null
          lead_email?: string
          lead_name?: string
          lead_phone?: string | null
          location_type?: string | null
          monthly_opex?: number | null
          monthly_revenue?: number | null
          operating_hours?: string | null
          owner_id?: string
          recommendations?: Json
          revenue_model?: Json | null
          roi_percentage?: number | null
          selected_sports?: Json | null
          sports_breakdown?: Json | null
          submission_date?: string | null
          target_market?: Json | null
          timeline?: string | null
          total_investment?: number | null
          total_square_footage?: number | null
          updated_at?: string
          wizard_responses?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "ops" | "user"
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
      app_role: ["admin", "ops", "user"],
    },
  },
} as const
