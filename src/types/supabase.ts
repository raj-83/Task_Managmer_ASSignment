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
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          is_completed?: boolean
          created_at?: string
        }
      }
    }
  }
}