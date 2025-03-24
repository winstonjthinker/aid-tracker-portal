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
          title: string
          surname: string
          first_name: string
          whatsapp_number: string
          sex: string
          date_of_birth: string
          id_number: string
          address: string
          marital_status: string
          phone: string
          email: string
          case_status: string
          agent_id: string | null
          date_joined: string
          form_number: string | null
          policy_number: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          surname: string
          first_name: string
          whatsapp_number: string
          sex: string
          date_of_birth: string
          id_number: string
          address: string
          marital_status: string
          phone: string
          email: string
          case_status?: string
          agent_id?: string | null
          date_joined?: string
          form_number?: string | null
          policy_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          surname?: string
          first_name?: string
          whatsapp_number?: string
          sex?: string
          date_of_birth?: string
          id_number?: string
          address?: string
          marital_status?: string
          phone?: string
          email?: string
          case_status?: string
          agent_id?: string | null
          date_joined?: string
          form_number?: string | null
          policy_number?: string | null
        }
      }
      employers: {
        Row: {
          id: string
          client_id: string
          name: string
          employee_number: string
          occupation: string
          address: string
          email: string
          phone: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          employee_number: string
          occupation: string
          address: string
          email: string
          phone: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          employee_number?: string
          occupation?: string
          address?: string
          email?: string
          phone?: string
        }
      }
      next_of_kin: {
        Row: {
          id: string
          client_id: string
          full_name: string
          date_of_birth: string
          id_number: string
          relationship: string
          address: string
          phone: string
        }
        Insert: {
          id?: string
          client_id: string
          full_name: string
          date_of_birth: string
          id_number: string
          relationship: string
          address: string
          phone: string
        }
        Update: {
          id?: string
          client_id?: string
          full_name?: string
          date_of_birth?: string
          id_number?: string
          relationship?: string
          address?: string
          phone?: string
        }
      }
      dependants: {
        Row: {
          id: string
          client_id: string
          surname: string
          first_name: string
          id_number: string
          date_of_birth: string
        }
        Insert: {
          id?: string
          client_id: string
          surname: string
          first_name: string
          id_number: string
          date_of_birth: string
        }
        Update: {
          id?: string
          client_id?: string
          surname?: string
          first_name?: string
          id_number?: string
          date_of_birth?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          client_id: string
          plan_type: string
          coverage_tier: string
          monthly_amount: number
          payment_method: string
          payment_frequency: string
          bank_name: string | null
          bank_branch: string | null
          account_number: string | null
          account_holder: string | null
          pay_date: string | null
        }
        Insert: {
          id?: string
          client_id: string
          plan_type: string
          coverage_tier: string
          monthly_amount: number
          payment_method: string
          payment_frequency: string
          bank_name?: string | null
          bank_branch?: string | null
          account_number?: string | null
          account_holder?: string | null
          pay_date?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          plan_type?: string
          coverage_tier?: string
          monthly_amount?: number
          payment_method?: string
          payment_frequency?: string
          bank_name?: string | null
          bank_branch?: string | null
          account_number?: string | null
          account_holder?: string | null
          pay_date?: string | null
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
      marital_status: "single" | "married"
      sex: "male" | "female"
      title: "mr" | "mrs" | "miss" | "ms" | "dr" | "prof"
      plan_type: "individual" | "family"
      coverage_tier: "bronze" | "silver" | "gold" | "platinum"
      payment_frequency: "monthly" | "quarterly" | "half-yearly" | "annually"
      payment_method: "cash" | "ecocash" | "telecash" | "one-wallet" | "debit-order" | "stop-order"
    }
  }
}
