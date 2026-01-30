// Supabase generated types
// Run: pnpm db:generate to update from live schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      parties: {
        Row: {
          id: string;
          owner_id: string;
          child_name: string;
          child_age: number;
          child_id: string | null;
          party_date: string;
          party_time: string;
          party_time_end: string | null;
          venue_name: string;
          venue_address: string | null;
          description: string | null;
          theme: string | null;
          invitation_image_url: string | null;
          rsvp_deadline: string | null;
          max_guests: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          child_name: string;
          child_age: number;
          child_id?: string | null;
          party_date: string;
          party_time: string;
          party_time_end?: string | null;
          venue_name: string;
          venue_address?: string | null;
          description?: string | null;
          theme?: string | null;
          invitation_image_url?: string | null;
          rsvp_deadline?: string | null;
          max_guests?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          child_name?: string;
          child_age?: number;
          child_id?: string | null;
          party_date?: string;
          party_time?: string;
          party_time_end?: string | null;
          venue_name?: string;
          venue_address?: string | null;
          description?: string | null;
          theme?: string | null;
          invitation_image_url?: string | null;
          rsvp_deadline?: string | null;
          max_guests?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parties_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
        ];
      };
      children: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          birth_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          birth_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          birth_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "children_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          id: string;
          party_id: string;
          token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          token: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          party_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
        ];
      };
      rsvp_responses: {
        Row: {
          id: string;
          invitation_id: string;
          child_name: string;
          attending: boolean;
          parent_name: string | null;
          parent_phone: string | null;
          parent_email: string;
          message: string | null;
          edit_token: string;
          responded_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          child_name: string;
          attending: boolean;
          parent_name?: string | null;
          parent_phone?: string | null;
          parent_email: string;
          message?: string | null;
          edit_token: string;
          responded_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          child_name?: string;
          attending?: boolean;
          parent_name?: string | null;
          parent_phone?: string | null;
          parent_email?: string;
          message?: string | null;
          edit_token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rsvp_responses_invitation_id_fkey";
            columns: ["invitation_id"];
            isOneToOne: false;
            referencedRelation: "invitations";
            referencedColumns: ["id"];
          },
        ];
      };
      invited_guests: {
        Row: {
          id: string;
          party_id: string;
          email: string | null;
          phone: string | null;
          invite_method: string;
          name: string | null;
          invited_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          email?: string | null;
          phone?: string | null;
          invite_method?: string;
          name?: string | null;
          invited_at?: string;
        };
        Update: {
          id?: string;
          party_id?: string;
          email?: string | null;
          phone?: string | null;
          invite_method?: string;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invited_guests_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
        ];
      };
      sms_usage: {
        Row: {
          id: string;
          user_id: string;
          party_id: string | null;
          sms_count: number;
          month: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          party_id?: string | null;
          sms_count?: number;
          month: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          party_id?: string | null;
          sms_count?: number;
          month?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sms_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sms_usage_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
        ];
      };
      party_images: {
        Row: {
          id: string;
          party_id: string;
          image_url: string;
          is_selected: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          image_url: string;
          is_selected?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          party_id?: string;
          image_url?: string;
          is_selected?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "party_images_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
        ];
      };
      allergy_data: {
        Row: {
          id: string;
          rsvp_id: string;
          allergies: Json;
          other_dietary: string | null;
          consent_given_at: string;
          auto_delete_at: string;
        };
        Insert: {
          id?: string;
          rsvp_id: string;
          allergies: Json;
          other_dietary?: string | null;
          consent_given_at: string;
          auto_delete_at: string;
        };
        Update: {
          id?: string;
          rsvp_id?: string;
          allergies?: Json;
          other_dietary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "allergy_data_rsvp_id_fkey";
            columns: ["rsvp_id"];
            isOneToOne: true;
            referencedRelation: "rsvp_responses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
