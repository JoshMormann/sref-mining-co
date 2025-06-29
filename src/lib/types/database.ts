export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          tier: 'miner' | 'collector' | 'admin'
          waitlist_status: 'none' | 'pending' | 'approved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          tier?: 'miner' | 'collector' | 'admin'
          waitlist_status?: 'none' | 'pending' | 'approved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          tier?: 'miner' | 'collector' | 'admin'
          waitlist_status?: 'none' | 'pending' | 'approved'
          created_at?: string
          updated_at?: string
        }
      }
      sref_codes: {
        Row: {
          id: string
          user_id: string
          code_value: string
          sv_version: number
          title: string
          copy_count: number
          upvotes: number
          downvotes: number
          save_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code_value: string
          sv_version: number
          title: string
          copy_count?: number
          upvotes?: number
          downvotes?: number
          save_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code_value?: string
          sv_version?: number
          title?: string
          copy_count?: number
          upvotes?: number
          downvotes?: number
          save_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          is_smart: boolean
          search_criteria: {
            tags?: string[]
            sv_version?: number
            upvotes_min?: number
            date_range?: { start: string; end: string }
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_id?: string | null
          is_smart?: boolean
          search_criteria?: {
            tags?: string[]
            sv_version?: number
            upvotes_min?: number
            date_range?: { start: string; end: string }
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_id?: string | null
          is_smart?: boolean
          search_criteria?: {
            tags?: string[]
            sv_version?: number
            upvotes_min?: number
            date_range?: { start: string; end: string }
          } | null
          created_at?: string
          updated_at?: string
        }
      }
      code_images: {
        Row: {
          id: string
          code_id: string
          image_url: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          code_id: string
          image_url: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          code_id?: string
          image_url?: string
          position?: number
          created_at?: string
        }
      }
      code_tags: {
        Row: {
          id: string
          code_id: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: string
          code_id: string
          tag: string
          created_at?: string
        }
        Update: {
          id?: string
          code_id?: string
          tag?: string
          created_at?: string
        }
      }
      folder_codes: {
        Row: {
          id: string
          folder_id: string
          code_id: string
          added_at: string
        }
        Insert: {
          id?: string
          folder_id: string
          code_id: string
          added_at?: string
        }
        Update: {
          id?: string
          folder_id?: string
          code_id?: string
          added_at?: string
        }
      }
      saved_codes: {
        Row: {
          id: string
          user_id: string
          code_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code_id: string
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code_id?: string
          saved_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          user_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      code_votes: {
        Row: {
          id: string
          user_id: string
          code_id: string
          is_upvote: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code_id: string
          is_upvote: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code_id?: string
          is_upvote?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}