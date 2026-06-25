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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      condo_members: {
        Row: {
          condo_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["condo_role"]
          user_id: string
        }
        Insert: {
          condo_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["condo_role"]
          user_id: string
        }
        Update: {
          condo_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["condo_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "condo_members_condo_id_fkey"
            columns: ["condo_id"]
            isOneToOne: false
            referencedRelation: "condos"
            referencedColumns: ["id"]
          },
        ]
      }
      condos: {
        Row: {
          cnpj: string | null
          contact_email: string
          created_at: string
          id: string
          mirror_address: string | null
          nome: string
          setup_complete: boolean
          sindico_nome: string
        }
        Insert: {
          cnpj?: string | null
          contact_email: string
          created_at?: string
          id?: string
          mirror_address?: string | null
          nome: string
          setup_complete?: boolean
          sindico_nome: string
        }
        Update: {
          cnpj?: string | null
          contact_email?: string
          created_at?: string
          id?: string
          mirror_address?: string | null
          nome?: string
          setup_complete?: boolean
          sindico_nome?: string
        }
        Relationships: []
      }
      drafts: {
        Row: {
          approved: boolean
          body: string
          condo_id: string
          created_at: string
          email_id: string
          id: string
          sent_at: string | null
        }
        Insert: {
          approved?: boolean
          body: string
          condo_id: string
          created_at?: string
          email_id: string
          id?: string
          sent_at?: string | null
        }
        Update: {
          approved?: boolean
          body?: string
          condo_id?: string
          created_at?: string
          email_id?: string
          id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drafts_condo_id_fkey"
            columns: ["condo_id"]
            isOneToOne: false
            referencedRelation: "condos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drafts_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          ai_summary: string | null
          body: string
          category: Database["public"]["Enums"]["email_category"]
          condo_id: string
          id: string
          priority: Database["public"]["Enums"]["email_priority"]
          received_at: string
          sender_email: string
          sender_name: string
          status: Database["public"]["Enums"]["email_status"]
          subject: string
        }
        Insert: {
          ai_summary?: string | null
          body: string
          category?: Database["public"]["Enums"]["email_category"]
          condo_id: string
          id?: string
          priority?: Database["public"]["Enums"]["email_priority"]
          received_at?: string
          sender_email: string
          sender_name: string
          status?: Database["public"]["Enums"]["email_status"]
          subject: string
        }
        Update: {
          ai_summary?: string | null
          body?: string
          category?: Database["public"]["Enums"]["email_category"]
          condo_id?: string
          id?: string
          priority?: Database["public"]["Enums"]["email_priority"]
          received_at?: string
          sender_email?: string
          sender_name?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_condo_id_fkey"
            columns: ["condo_id"]
            isOneToOne: false
            referencedRelation: "condos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_condo_for_user: {
        Args: {
          _cnpj: string
          _contact_email: string
          _nome: string
          _sindico_nome: string
        }
        Returns: {
          cnpj: string | null
          contact_email: string
          created_at: string
          id: string
          mirror_address: string | null
          nome: string
          setup_complete: boolean
          sindico_nome: string
        }
        SetofOptions: {
          from: "*"
          to: "condos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_condo_access: {
        Args: { _condo_id: string; _user_id: string }
        Returns: boolean
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      condo_role: "sindico" | "assistente"
      email_category:
        | "manutencao"
        | "reclamacao"
        | "fornecedor"
        | "financeiro"
        | "assembleia"
        | "reserva"
        | "informativo"
        | "urgente"
      email_priority: "alta" | "media" | "baixa"
      email_status: "novo" | "em_analise" | "rascunho_pronto" | "respondido"
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
      condo_role: ["sindico", "assistente"],
      email_category: [
        "manutencao",
        "reclamacao",
        "fornecedor",
        "financeiro",
        "assembleia",
        "reserva",
        "informativo",
        "urgente",
      ],
      email_priority: ["alta", "media", "baixa"],
      email_status: ["novo", "em_analise", "rascunho_pronto", "respondido"],
    },
  },
} as const
