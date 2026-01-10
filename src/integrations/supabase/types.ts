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
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      drug_batches: {
        Row: {
          batch_number: string
          created_at: string
          current_quantity: number
          drug_id: string
          exp_date: string
          id: string
          initial_quantity: number
          is_active: boolean
          mfg_date: string
          updated_at: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          current_quantity?: number
          drug_id: string
          exp_date: string
          id?: string
          initial_quantity?: number
          is_active?: boolean
          mfg_date: string
          updated_at?: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          current_quantity?: number
          drug_id?: string
          exp_date?: string
          id?: string
          initial_quantity?: number
          is_active?: boolean
          mfg_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drug_batches_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      drugs: {
        Row: {
          category: Database["public"]["Enums"]["drug_category"]
          created_at: string
          id: string
          is_active: boolean
          min_stock_threshold: number
          name: string
          unit: Database["public"]["Enums"]["drug_unit"]
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["drug_category"]
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_threshold?: number
          name: string
          unit?: Database["public"]["Enums"]["drug_unit"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["drug_category"]
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_threshold?: number
          name?: string
          unit?: Database["public"]["Enums"]["drug_unit"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          batch_id: string | null
          closing_stock: number
          created_at: string
          drug_id: string
          id: string
          opening_stock: number
          received: number
          remarks: string | null
          transaction_date: string
          updated_at: string
          used: number
        }
        Insert: {
          batch_id?: string | null
          closing_stock?: number
          created_at?: string
          drug_id: string
          id?: string
          opening_stock?: number
          received?: number
          remarks?: string | null
          transaction_date?: string
          updated_at?: string
          used?: number
        }
        Update: {
          batch_id?: string | null
          closing_stock?: number
          created_at?: string
          drug_id?: string
          id?: string
          opening_stock?: number
          received?: number
          remarks?: string | null
          transaction_date?: string
          updated_at?: string
          used?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "drug_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      drug_category:
        | "tablet"
        | "capsule"
        | "liquid"
        | "injectable"
        | "topical"
        | "respiratory"
        | "surgical"
        | "diagnostic"
        | "contraceptive"
        | "vitamin"
        | "other"
      drug_unit:
        | "tablets"
        | "capsules"
        | "ml"
        | "vials"
        | "ampoules"
        | "bottles"
        | "tubes"
        | "strips"
        | "packets"
        | "units"
        | "pieces"
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
      drug_category: [
        "tablet",
        "capsule",
        "liquid",
        "injectable",
        "topical",
        "respiratory",
        "surgical",
        "diagnostic",
        "contraceptive",
        "vitamin",
        "other",
      ],
      drug_unit: [
        "tablets",
        "capsules",
        "ml",
        "vials",
        "ampoules",
        "bottles",
        "tubes",
        "strips",
        "packets",
        "units",
        "pieces",
      ],
    },
  },
} as const
