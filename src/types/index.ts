// 🎯 Основные типы для Personal Productivity AI

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  timezone: string
  subscription: SubscriptionTier
  subscriptionStatus: SubscriptionStatus
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'

export interface UserPreferences {
  workingHours: {
    start: string // "09:00"
    end: string   // "18:00"
  }
  focusTime: number // minutes
  breakTime: number // minutes
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  aiCoaching: {
    enabled: boolean
    frequency: 'low' | 'medium' | 'high'
    style: 'gentle' | 'direct' | 'motivational'
  }
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  estimatedMinutes?: number
  actualMinutes?: number
  dueDate?: Date
  completedAt?: Date
  source: TaskSource
  tags: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type TaskSource = 'manual' | 'email' | 'calendar' | 'ai_suggestion'

export interface AICoachSuggestion {
  id: string
  type: SuggestionType
  title: string
  description: string
  actionText: string
  priority: number
  expiresAt?: Date
  userId: string
  createdAt: Date
}

export type SuggestionType =
  | 'take_break'
  | 'focus_time'
  | 'task_prioritization'
  | 'schedule_optimization'
  | 'productivity_tip'
  | 'goal_reminder'

export interface ProductivityMetrics {
  date: Date
  focusTimeMinutes: number
  tasksCompleted: number
  distractionsCount: number
  productivityScore: number // 0-100
  mood: 'low' | 'medium' | 'high'
  energyLevel: 'low' | 'medium' | 'high'
  userId: string
}

export interface EmailIntegration {
  id: string
  provider: 'gmail' | 'outlook'
  email: string
  isConnected: boolean
  lastSyncAt?: Date
  settings: {
    autoCreateTasks: boolean
    categories: string[]
    skipSpam: boolean
  }
  userId: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  isAllDay: boolean
  location?: string
  attendees: string[]
  source: 'google' | 'outlook' | 'manual'
  userId: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  name: string
  email: string
  password: string
  timezone: string
}

export interface TaskForm {
  title: string
  description?: string
  priority: TaskPriority
  estimatedMinutes?: number
  dueDate?: Date
  tags: string[]
}

// State types
export interface AppState {
  user: User | null
  tasks: Task[]
  suggestions: AICoachSuggestion[]
  metrics: ProductivityMetrics | null
  isLoading: boolean
  error: string | null
}

// Subscription types
export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  tinkoffCustomerId?: string
  tinkoffPaymentId?: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number // in kopecks (копейки)
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    tasks: number
    aiRequests: number
    storage: number // in MB
  }
  tinkoffPriceId: string
  isActive: boolean
}

export interface TinkoffWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

// AI Integration types
export interface AIService {
  name: string
  tier: SubscriptionTier
  isAvailable: boolean
  apiKey?: string
  baseUrl: string
  models: AIModel[]
}

export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'mock'
  tier: SubscriptionTier
  maxTokens: number
  costPerToken: number
  isActive: boolean
}

export interface AIRequest {
  id: string
  userId: string
  service: string
  model: string
  prompt: string
  response?: string
  tokensUsed: number
  cost: number
  duration: number // in ms
  status: 'pending' | 'completed' | 'failed'
  error?: string
  createdAt: Date
}

// Event types
export interface UserEvent {
  type: 'task_created' | 'task_completed' | 'break_taken' | 'focus_started' | 'subscription_created' | 'subscription_updated'
  timestamp: Date
  data: Record<string, any>
  userId: string
}
