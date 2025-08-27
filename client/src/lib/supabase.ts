import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          stagename: string | null
          bio: string | null
          location: string | null
          favorite_genres: string[] | null
          reputation_points: number
          badges: string[] | null
          concert_attendance_count: number
          comment_count: number
          review_count: number
          is_online: boolean
          last_active: string | null
          login_streak: number
          total_reviews: number
          total_photos: number
          total_likes: number
          remember_me: boolean
          last_login_at: string | null
          notification_settings: any | null
          theme: string
          proximity_enabled: boolean
          proximity_radius: number
          share_location_at_concerts: boolean
          role: string
          is_admin: boolean
          permissions: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          stagename?: string | null
          bio?: string | null
          location?: string | null
          favorite_genres?: string[] | null
          reputation_points?: number
          badges?: string[] | null
          concert_attendance_count?: number
          comment_count?: number
          review_count?: number
          is_online?: boolean
          last_active?: string | null
          login_streak?: number
          total_reviews?: number
          total_photos?: number
          total_likes?: number
          remember_me?: boolean
          last_login_at?: string | null
          notification_settings?: any | null
          theme?: string
          proximity_enabled?: boolean
          proximity_radius?: number
          share_location_at_concerts?: boolean
          role?: string
          is_admin?: boolean
          permissions?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          stagename?: string | null
          bio?: string | null
          location?: string | null
          favorite_genres?: string[] | null
          reputation_points?: number
          badges?: string[] | null
          concert_attendance_count?: number
          comment_count?: number
          review_count?: number
          is_online?: boolean
          last_active?: string | null
          login_streak?: number
          total_reviews?: number
          total_photos?: number
          total_likes?: number
          remember_me?: boolean
          last_login_at?: string | null
          notification_settings?: any | null
          theme?: string
          proximity_enabled?: boolean
          proximity_radius?: number
          share_location_at_concerts?: boolean
          role?: string
          is_admin?: boolean
          permissions?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      bands: {
        Row: {
          id: string
          name: string
          genre: string
          description: string
          image_url: string | null
          founded: number | null
          members: string[] | null
          albums: string[] | null
          website: string | null
          instagram: string | null
          owner_id: string | null
          status: string
          submitted_at: string
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          genre: string
          description: string
          image_url?: string | null
          founded?: number | null
          members?: string[] | null
          albums?: string[] | null
          website?: string | null
          instagram?: string | null
          owner_id?: string | null
          status?: string
          submitted_at?: string
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          genre?: string
          description?: string
          image_url?: string | null
          founded?: number | null
          members?: string[] | null
          albums?: string[] | null
          website?: string | null
          instagram?: string | null
          owner_id?: string | null
          status?: string
          submitted_at?: string
          approved_at?: string | null
          created_at?: string
        }
      }
      tours: {
        Row: {
          id: string
          band_id: string
          tour_name: string
          venue: string
          city: string
          country: string
          date: string
          ticket_url: string | null
          ticketmaster_url: string | null
          seatgeek_url: string | null
          price: string | null
          status: string
          venue_capacity: number | null
          current_attendance: number
          crowd_energy_level: number
          last_energy_update: string
          attendee_count: number
          energy_metrics: any | null
        }
        Insert: {
          id?: string
          band_id: string
          tour_name: string
          venue: string
          city: string
          country: string
          date: string
          ticket_url?: string | null
          ticketmaster_url?: string | null
          seatgeek_url?: string | null
          price?: string | null
          status?: string
          venue_capacity?: number | null
          current_attendance?: number
          crowd_energy_level?: number
          last_energy_update?: string
          attendee_count?: number
          energy_metrics?: any | null
        }
        Update: {
          id?: string
          band_id?: string
          tour_name?: string
          venue?: string
          city?: string
          country?: string
          date?: string
          ticket_url?: string | null
          ticketmaster_url?: string | null
          seatgeek_url?: string | null
          price?: string | null
          status?: string
          venue_capacity?: number | null
          current_attendance?: number
          crowd_energy_level?: number
          last_energy_update?: string
          attendee_count?: number
          energy_metrics?: any | null
        }
      }
      reviews: {
        Row: {
          id: string
          band_id: string
          stagename: string
          rating: number
          title: string
          content: string
          review_type: string
          target_name: string | null
          likes: number
          created_at: string
        }
        Insert: {
          id?: string
          band_id: string
          stagename: string
          rating: number
          title: string
          content: string
          review_type: string
          target_name?: string | null
          likes?: number
          created_at?: string
        }
        Update: {
          id?: string
          band_id?: string
          stagename?: string
          rating?: number
          title?: string
          content?: string
          review_type?: string
          target_name?: string | null
          likes?: number
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          band_id: string | null
          title: string
          image_url: string
          category: string
          uploaded_by: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          band_id?: string | null
          title: string
          image_url: string
          category: string
          uploaded_by: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          band_id?: string | null
          title?: string
          image_url?: string
          category?: string
          uploaded_by?: string
          description?: string | null
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
      [_ in never]: never
    }
  }
}
