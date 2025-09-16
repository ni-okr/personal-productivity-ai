// 🧪 Mock функции для тестирования подписок без Supabase

import { Subscription, SubscriptionTier, SubscriptionStatus, SubscriptionPlan } from '@/types'

// Mock данные для подписок
const mockSubscriptions: Subscription[] = [
  {
    id: 'mock-sub-1',
    userId: 'mock-user-1',
    tier: 'free',
    status: 'active',
    currentPeriodStart: new Date('2024-09-01T00:00:00Z'),
    currentPeriodEnd: new Date('2025-09-01T00:00:00Z'),
    cancelAtPeriodEnd: false,
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2024-09-01T00:00:00Z')
  }
]

// Mock данные для планов подписок
const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    tier: 'free',
    price: 0,
    currency: 'RUB',
    interval: 'month',
    features: [
      'До 50 задач в месяц',
      'Базовое планирование',
      'Email поддержка'
    ],
    limits: {
      tasks: 50,
      aiRequests: 10,
      storage: 100
    },
    tinkoffPriceId: 'free-plan',
    isActive: true,
    description: 'Базовый план для начала работы'
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    tier: 'premium',
    price: 99900, // 999 рублей в копейках
    currency: 'RUB',
    interval: 'month',
    features: [
      'До 500 задач в месяц',
      'ИИ планировщик',
      'Приоритетная поддержка',
      'Аналитика продуктивности'
    ],
    limits: {
      tasks: 500,
      aiRequests: 100,
      storage: 1000
    },
    tinkoffPriceId: 'premium-plan',
    isActive: true,
    description: 'Для активных пользователей'
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    tier: 'pro',
    price: 199900, // 1999 рублей в копейках
    currency: 'RUB',
    interval: 'month',
    features: [
      'Неограниченные задачи',
      'Все ИИ модели',
      'Персональный менеджер',
      'API доступ',
      'Интеграции'
    ],
    limits: {
      tasks: -1, // -1 означает неограниченно
      aiRequests: -1,
      storage: 10000
    },
    tinkoffPriceId: 'pro-plan',
    isActive: true,
    description: 'Для профессионалов и команд'
  }
]

// Функции для работы с подписками
export async function mockGetSubscription(userId: string): Promise<{
  success: boolean
  subscription?: Subscription
  error?: string
}> {
  console.log('🧪 MOCK РЕЖИМ: Получение подписки без реальных запросов к Supabase')
  
  const subscription = mockSubscriptions.find(sub => sub.userId === userId)
  
  if (!subscription) {
    return {
      success: false,
      error: 'Подписка не найдена'
    }
  }
  
  return {
    success: true,
    subscription
  }
}

export async function mockCreateSubscription(userId: string, tier: SubscriptionTier): Promise<{
  success: boolean
  subscription?: Subscription
  error?: string
}> {
  console.log('🧪 MOCK РЕЖИМ: Создание подписки без реальных запросов к Supabase')
  
  // Проверяем, есть ли уже подписка у пользователя
  const existingSubscription = mockSubscriptions.find(sub => sub.userId === userId)
  if (existingSubscription) {
    return {
      success: false,
      error: 'У пользователя уже есть активная подписка'
    }
  }
  
  const now = new Date()
  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  
  const newSubscription: Subscription = {
    id: `mock-sub-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId: userId,
    tier: tier,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: nextMonth,
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now
  }
  
  mockSubscriptions.push(newSubscription)
  
  return {
    success: true,
    subscription: newSubscription
  }
}

export async function mockUpdateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<{
  success: boolean
  subscription?: Subscription
  error?: string
}> {
  console.log('🧪 MOCK РЕЖИМ: Обновление подписки без реальных запросов к Supabase')
  
  const subscriptionIndex = mockSubscriptions.findIndex(sub => sub.id === subscriptionId)
  if (subscriptionIndex === -1) {
    return {
      success: false,
      error: 'Подписка не найдена'
    }
  }
  
  const updatedSubscription = {
    ...mockSubscriptions[subscriptionIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  mockSubscriptions[subscriptionIndex] = updatedSubscription
  
  return {
    success: true,
    subscription: updatedSubscription
  }
}

export async function mockCancelSubscription(subscriptionId: string): Promise<{
  success: boolean
  subscription?: Subscription
  error?: string
}> {
  console.log('🧪 MOCK РЕЖИМ: Отмена подписки без реальных запросов к Supabase')
  
  const subscriptionIndex = mockSubscriptions.findIndex(sub => sub.id === subscriptionId)
  if (subscriptionIndex === -1) {
    return {
      success: false,
      error: 'Подписка не найдена'
    }
  }
  
  const updatedSubscription = {
    ...mockSubscriptions[subscriptionIndex],
    status: 'canceled' as SubscriptionStatus,
    cancelAtPeriodEnd: true,
    updatedAt: new Date()
  }
  
  mockSubscriptions[subscriptionIndex] = updatedSubscription
  
  return {
    success: true,
    subscription: updatedSubscription
  }
}

export async function mockGetSubscriptionPlans(): Promise<{
  success: boolean
  plans?: SubscriptionPlan[]
  error?: string
}> {
  console.log('🧪 MOCK РЕЖИМ: Получение планов подписок без реальных запросов к Supabase')
  
  return {
    success: true,
    plans: mockSubscriptionPlans.filter(plan => plan.isActive)
  }
}

export async function mockGetSubscriptionStatus(userId: string): Promise<{
  success: boolean
  status?: {
    tier: SubscriptionTier
    status: SubscriptionStatus
    isActive: boolean
    canUpgrade: boolean
    canDowngrade: boolean
    limits: {
      tasks: number
      aiRequests: number
      storage: number
    }
    usage: {
      tasks: number
      aiRequests: number
      storage: number
    }
  }
  error?: string
}> {
  console.log('🧪 MOCK РЕЖИМ: Получение статуса подписки без реальных запросов к Supabase')
  
  const subscription = mockSubscriptions.find(sub => sub.userId === userId)
  
  if (!subscription) {
    return {
      success: false,
      error: 'Подписка не найдена'
    }
  }
  
  const plan = mockSubscriptionPlans.find(p => p.tier === subscription.tier)
  if (!plan) {
    return {
      success: false,
      error: 'План подписки не найден'
    }
  }
  
  const isActive = subscription.status === 'active' && subscription.currentPeriodEnd > new Date()
  
  return {
    success: true,
    status: {
      tier: subscription.tier,
      status: subscription.status,
      isActive,
      canUpgrade: subscription.tier === 'free' || subscription.tier === 'premium',
      canDowngrade: subscription.tier === 'pro' || subscription.tier === 'premium',
      limits: plan.limits,
      usage: {
        tasks: 15, // Mock использование
        aiRequests: 3,
        storage: 25
      }
    }
  }
}

// Функция для очистки mock данных
export function clearMockSubscriptions(): void {
  console.log('🧪 MOCK РЕЖИМ: Очистка mock подписок')
  mockSubscriptions.length = 0
}

// Функция для добавления тестовой подписки
export function addMockSubscription(subscription: Subscription): void {
  console.log('🧪 MOCK РЕЖИМ: Добавление тестовой подписки')
  mockSubscriptions.push(subscription)
}
