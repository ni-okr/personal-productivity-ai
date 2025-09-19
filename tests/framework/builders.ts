// Тестовые билддеры (xUnit Test Data Builders)

export function buildEmail(prefix: string = 'test', domain: string = 'taskai.space'): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${prefix}-${unique}@${domain}`
}

export interface BuildUserOptions {
  id?: string
  email?: string
  name?: string
  subscription?: 'free' | 'premium' | 'pro'
}

export function buildUser(overrides: BuildUserOptions = {}) {
  const now = new Date()
  return {
    id: overrides.id ?? 'test-user-id',
    email: overrides.email ?? buildEmail('user'),
    name: overrides.name ?? 'Test User',
    timezone: 'Europe/Moscow',
    subscription: overrides.subscription ?? 'free',
    subscriptionStatus: 'active',
    preferences: {
      workingHours: { start: '09:00', end: '18:00' },
      focusTime: 25,
      breakTime: 5,
      notifications: { email: true, push: true, desktop: true },
      aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
    },
    createdAt: now,
    updatedAt: now
  }
}

export interface BuildTaskOptions {
  id?: string
  title?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'todo' | 'in_progress' | 'completed'
  userId?: string
}

export function buildTask(overrides: BuildTaskOptions = {}) {
  const now = new Date()
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2, 10),
    title: overrides.title ?? 'Test Task',
    priority: overrides.priority ?? 'high',
    status: overrides.status ?? 'todo',
    source: 'manual',
    tags: [],
    userId: overrides.userId ?? 'user1',
    createdAt: now,
    updatedAt: now
  }
}


