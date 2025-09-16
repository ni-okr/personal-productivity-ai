export interface Database {
  public: {
    Tables: {
      subscriptions: {
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
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
          completed_at: string | null
          estimated_duration: number | null
          actual_duration: number | null
          source: string
          tags: string[]
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
          due_date?: string | null
          completed_at?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          source?: string
          tags?: string[]
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
          due_date?: string | null
          completed_at?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          source?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'premium' | 'pro' | 'enterprise'
          status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
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
          tier: 'free' | 'premium' | 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
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
          tier?: 'free' | 'premium' | 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
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
      feature_toggles: {
        Row: {
          id: string
          name: string
          enabled: boolean
          type: 'hot' | 'cold'
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          enabled?: boolean
          type?: 'hot' | 'cold'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          type?: 'hot' | 'cold'
          description?: string | null
          created_at?: string
          updated_at?: string
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
export type Subscriber = Tables<'subscriptions'>
export type SubscriberInsert = TablesInsert<'subscriptions'>
export type SubscriberUpdate = TablesUpdate<'subscriptions'>

export type Task = Tables<'tasks'>
export type TaskInsert = TablesInsert<'tasks'>
export type TaskUpdate = TablesUpdate<'tasks'>

export type Subscription = Tables<'subscriptions'>
export type SubscriptionInsert = TablesInsert<'subscriptions'>
export type SubscriptionUpdate = TablesUpdate<'subscriptions'>

export type FeatureToggle = Tables<'feature_toggles'>
export type FeatureToggleInsert = TablesInsert<'feature_toggles'>
export type FeatureToggleUpdate = TablesUpdate<'feature_toggles'>