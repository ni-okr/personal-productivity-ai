export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          subscription: 'free' | 'premium' | 'pro'
          preferences: any
          created_at: string
          last_login_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          subscription?: 'free' | 'premium' | 'pro'
          preferences?: any
          created_at?: string
          last_login_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          subscription?: 'free' | 'premium' | 'pro'
          preferences?: any
          created_at?: string
          last_login_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          estimated_minutes: number | null
          actual_minutes: number | null
          due_date: string | null
          completed_at: string | null
          source: 'manual' | 'email' | 'calendar' | 'ai_suggestion'
          tags: string[]
          ai_generated: boolean
          ai_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          estimated_minutes?: number | null
          actual_minutes?: number | null
          due_date?: string | null
          completed_at?: string | null
          source?: 'manual' | 'email' | 'calendar' | 'ai_suggestion'
          tags?: string[]
          ai_generated?: boolean
          ai_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          estimated_minutes?: number | null
          actual_minutes?: number | null
          due_date?: string | null
          completed_at?: string | null
          source?: 'manual' | 'email' | 'calendar' | 'ai_suggestion'
          tags?: string[]
          ai_generated?: boolean
          ai_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      productivity_metrics: {
        Row: {
          id: string
          user_id: string
          date: string
          focus_time_minutes: number
          tasks_completed: number
          distractions_count: number
          productivity_score: number
          mood: 'low' | 'medium' | 'high' | null
          energy_level: 'low' | 'medium' | 'high' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          focus_time_minutes?: number
          tasks_completed?: number
          distractions_count?: number
          productivity_score?: number
          mood?: 'low' | 'medium' | 'high' | null
          energy_level?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          focus_time_minutes?: number
          tasks_completed?: number
          distractions_count?: number
          productivity_score?: number
          mood?: 'low' | 'medium' | 'high' | null
          energy_level?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'premium' | 'pro'
          status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid'
          tinkoff_customer_id: string | null
          tinkoff_payment_id: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'free' | 'premium' | 'pro'
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid'
          tinkoff_customer_id?: string | null
          tinkoff_payment_id?: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'premium' | 'pro'
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid'
          tinkoff_customer_id?: string | null
          tinkoff_payment_id?: string | null
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_suggestions: {
        Row: {
          id: string
          user_id: string
          type: 'take_break' | 'focus_time' | 'task_prioritization' | 'schedule_optimization' | 'productivity_tip' | 'goal_reminder'
          title: string
          description: string
          action_text: string | null
          priority: number
          expires_at: string | null
          dismissed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'take_break' | 'focus_time' | 'task_prioritization' | 'schedule_optimization' | 'productivity_tip' | 'goal_reminder'
          title: string
          description: string
          action_text?: string | null
          priority?: number
          expires_at?: string | null
          dismissed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'take_break' | 'focus_time' | 'task_prioritization' | 'schedule_optimization' | 'productivity_tip' | 'goal_reminder'
          title?: string
          description?: string
          action_text?: string | null
          priority?: number
          expires_at?: string | null
          dismissed_at?: string | null
          created_at?: string
        }
      }
      subscribers: {
        Row: {
          id: string
          email: string
          source: string | null
          subscribed_at: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          source?: string | null
          subscribed_at?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          source?: string | null
          subscribed_at?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string
          name: string
          email: string
          subscription: 'free' | 'premium' | 'pro'
          total_tasks: number
          completed_tasks: number
          pending_tasks: number
          avg_task_duration: number | null
          max_productivity_score: number | null
          avg_productivity_score: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database['public']['Tables'] & Database['public']['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
    Database['public']['Views'])
  ? (Database['public']['Tables'] &
    Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database['public']['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database['public']['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database['public']['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never

// Convenience types
export type User = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>

export type Task = Tables<'tasks'>
export type TaskInsert = TablesInsert<'tasks'>
export type TaskUpdate = TablesUpdate<'tasks'>

export type ProductivityMetric = Tables<'productivity_metrics'>
export type ProductivityMetricInsert = TablesInsert<'productivity_metrics'>
export type ProductivityMetricUpdate = TablesUpdate<'productivity_metrics'>

export type Subscription = Tables<'subscriptions'>
export type SubscriptionInsert = TablesInsert<'subscriptions'>
export type SubscriptionUpdate = TablesUpdate<'subscriptions'>

export type AISuggestion = Tables<'ai_suggestions'>
export type AISuggestionInsert = TablesInsert<'ai_suggestions'>
export type AISuggestionUpdate = TablesUpdate<'ai_suggestions'>

export type Subscriber = Tables<'subscribers'>
export type SubscriberInsert = TablesInsert<'subscribers'>
export type SubscriberUpdate = TablesUpdate<'subscribers'>

export type UserStats = Tables<'user_stats'>