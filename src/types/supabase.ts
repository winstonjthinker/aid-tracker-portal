
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
      clients: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          case_status: string
          agent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          case_status?: string
          agent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          case_status?: string
          agent_id?: string | null
        }
      }
      next_of_kin: {
        Row: {
          id: string
          client_id: string
          name: string
          relationship: string
          phone: string
          email: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          relationship: string
          phone: string
          email: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          relationship?: string
          phone?: string
          email?: string
        }
      }
      dependants: {
        Row: {
          id: string
          client_id: string
          name: string
          relationship: string
          age: number
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          relationship: string
          age: number
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          relationship?: string
          age?: number
        }
      }
      cases: {
        Row: {
          id: string
          client_id: string
          case_type: string
          description: string
          status: string
          opened_at: string
          closed_at: string | null
          lawyer_id: string | null
        }
        Insert: {
          id?: string
          client_id: string
          case_type: string
          description: string
          status?: string
          opened_at?: string
          closed_at?: string | null
          lawyer_id?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          case_type?: string
          description?: string
          status?: string
          opened_at?: string
          closed_at?: string | null
          lawyer_id?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          client_id: string
          case_id: string | null
          amount: number
          payment_date: string
          payment_method: string
          status: string
          reference: string
        }
        Insert: {
          id?: string
          client_id: string
          case_id?: string | null
          amount: number
          payment_date?: string
          payment_method: string
          status?: string
          reference: string
        }
        Update: {
          id?: string
          client_id?: string
          case_id?: string | null
          amount?: number
          payment_date?: string
          payment_method?: string
          status?: string
          reference?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          first_name: string
          last_name: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          first_name: string
          last_name: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          first_name?: string
          last_name?: string
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
      user_role: "agent" | "admin" | "accountant"
      case_status: "open" | "closed" | "pending"
      payment_status: "paid" | "pending" | "failed"
    }
  }
}
