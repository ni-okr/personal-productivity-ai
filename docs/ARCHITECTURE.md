# 🏗️ Архитектура Personal Productivity AI

## 🎯 Обзор системы

Personal Productivity AI построен на современном стеке технологий с фокусом на производительность, безопасность и масштабируемость. Архитектура спроектирована для поэтапной эволюции от простого MVP до полнофункциональной LifeOS.

## 📊 Диаграмма архитектуры

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Landing   │  │  Planner    │  │    Auth Pages       │  │
│  │   Page      │  │   Page      │  │  (Future)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Components  │  │   Stores    │  │      Utils          │  │
│  │   (UI)      │  │  (Zustand)  │  │   (Validation)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ /api/       │  │ /api/test   │  │   Future APIs       │  │
│  │ subscribe   │  │             │  │  (auth, tasks)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │   Tables    │  │       RLS           │  │
│  │  (Built-in) │  │ (PostgreSQL)│  │   (Security)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   OpenAI    │  │   Stripe    │  │     Vercel          │  │
│  │ (Future AI) │  │ (Payments)  │  │   (Hosting)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend архитектура

### Next.js App Router
```
src/app/
├── layout.tsx              # Корневой layout
├── page.tsx                # Главная страница (лендинг)
├── planner/
│   └── page.tsx            # Планировщик задач
├── roadmap/
│   └── page.tsx            # Дорожная карта
└── api/
    ├── subscribe/
    │   └── route.ts        # API подписки
    └── test/
        └── route.ts        # API диагностики
```

### Компоненты
```
src/components/
├── ui/
│   └── Button.tsx          # Переиспользуемые UI компоненты
├── ErrorBoundary.tsx       # Обработка ошибок React
└── MobileOptimized.tsx     # Мобильная оптимизация
```

### Управление состоянием (Zustand)
```typescript
// src/stores/useAppStore.ts
interface AppState {
  // Задачи
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  // Вычисляемые свойства
  pendingTasks: () => Task[]
  urgentTasks: () => Task[]
  completedTasksToday: () => Task[]
  
  // Пользователь (будущее)
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}
```

## 🗄️ База данных (Supabase)

### Схема таблиц

#### 👤 users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium', 'pro')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 📋 tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'email', 'calendar', 'ai_suggestion')),
  tags TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 📊 productivity_metrics
```sql
CREATE TABLE productivity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  total_minutes_worked INTEGER DEFAULT 0,
  distractions_count INTEGER DEFAULT 0,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 🤖 ai_suggestions
```sql
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('break', 'focus', 'prioritize', 'schedule_optimization')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_accepted BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

Все таблицы защищены политиками RLS:

```sql
-- Пользователи видят только свои данные
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Задачи доступны только владельцу
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

## 🧠 ИИ архитектура

### Многоуровневая система

#### 1. Mock AI (Текущий этап)
```typescript
// src/lib/aiModels.ts
export class AIPlanner implements IAIPlanner {
  async generateTasks(description: string): Promise<Task[]> {
    // Простая логика без LLM
    return mockGeneratedTasks
  }
  
  async analyzeProductivity(tasks: Task[]): Promise<Analysis> {
    // Статистические алгоритмы
    return calculateProductivityScore(tasks)
  }
}
```

#### 2. Псевдо-ИИ (Q1 2026)
```typescript
// src/lib/smartPlanning.ts
export function smartTaskPrioritization(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    // Умные алгоритмы приоритизации
    const priorityWeight = getPriorityWeight(a, b)
    const deadlineWeight = getDeadlineWeight(a, b)
    const effortWeight = getEffortWeight(a, b)
    
    return priorityWeight + deadlineWeight + effortWeight
  })
}
```

#### 3. Реальный ИИ (Q2-Q3 2026)
```typescript
// src/lib/aiIntegrations.ts
export class OpenAIPlanner implements IAIPlanner {
  async generateTasks(description: string): Promise<Task[]> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a productivity expert. Generate actionable tasks."
        },
        {
          role: "user", 
          content: description
        }
      ]
    })
    
    return parseTasksFromResponse(response)
  }
}
```

### Конфигурация моделей

```typescript
export const AI_MODELS: Record<string, AIModelConfig> = {
  'mock-ai': {
    id: 'mock-ai',
    name: 'Mock AI (Free)',
    provider: 'mock',
    tier: 'free',
    costPerRequest: 0,
    capabilities: ['basic-planning', 'basic-analysis']
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini (Premium)',
    provider: 'openai',
    tier: 'premium',
    costPerRequest: 0.00015,
    capabilities: ['planning', 'scheduling', 'analysis', 'generation']
  }
}
```

## 🔐 Система авторизации

### Supabase Auth интеграция

```typescript
// src/lib/auth.ts
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
  // 1. Создание пользователя в Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })
  
  // 2. Создание профиля в таблице users
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: authData.user.email,
      name: name,
      subscription: 'free'
    })
    
  return { success: true, user: userProfile }
}
```

### Middleware для защиты маршрутов (Будущее)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('supabase-auth-token')
  
  if (!token && request.nextUrl.pathname.startsWith('/planner')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

## 📱 PWA архитектура

### Манифест приложения

```json
// public/manifest.json
{
  "name": "Personal Productivity AI",
  "short_name": "ProductivityAI",
  "description": "ИИ-ассистент для управления продуктивностью",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Планируется)

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('productivity-ai-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/planner',
        '/offline.html'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html')
      })
    )
  }
})
```

## 🧪 Тестовая архитектура

### Структура тестов

```
tests/
├── unit/                   # Unit тесты
│   ├── Button.test.tsx
│   └── validation.test.ts
├── integration/            # Integration тесты
│   └── supabase-api.test.ts
├── e2e/                    # E2E тесты
│   ├── landing-page.spec.ts
│   └── pwa-installation.spec.ts
├── config/                 # Конфигурации
│   ├── jest.config.js
│   └── playwright.config.ts
└── docs/                   # Документация тестов
```

### Стратегия тестирования

1. **Unit тесты (Jest)**
   - Компоненты UI
   - Утилиты и валидация
   - Бизнес-логика

2. **Integration тесты (Jest)**
   - API routes
   - Supabase интеграции
   - Внешние сервисы

3. **E2E тесты (Playwright)**
   - Критические пользовательские сценарии
   - Кроссбраузерное тестирование
   - PWA функциональность

4. **Allure отчеты**
   - Детальная аналитика тестов
   - Скриншоты и видео
   - Категоризация дефектов

## 🚀 Deployment архитектура

### Vercel конфигурация

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test & Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run build
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## 📊 Мониторинг и аналитика

### Производительность (Планируется)

```typescript
// src/lib/analytics.ts
export function trackPageView(page: string) {
  if (typeof window !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: page,
      page_location: window.location.href
    })
  }
}

export function trackUserAction(action: string, category: string) {
  gtag('event', action, {
    event_category: category,
    event_label: window.location.pathname
  })
}
```

### Error tracking (Sentry - Планируется)

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
})

export function captureException(error: Error, context?: any) {
  Sentry.captureException(error, {
    tags: context,
    level: 'error'
  })
}
```

## 🔄 Эволюция архитектуры

### Этап 1: MVP (Текущий)
- ✅ Next.js + TypeScript + Tailwind
- ✅ Supabase Auth + Database
- ✅ Базовый планировщик задач
- ✅ Mock ИИ интеграции

### Этап 2: Псевдо-ИИ (Q1 2026)
- [ ] Умные алгоритмы планирования
- [ ] Анализ паттернов пользователя
- [ ] Календарные интеграции
- [ ] Push уведомления

### Этап 3: Реальный ИИ (Q2-Q3 2026)
- [ ] OpenAI/Claude/Gemini интеграции
- [ ] Контекстуальные рекомендации
- [ ] NLP обработка задач
- [ ] Персонализация на основе истории

### Этап 4: LifeOS (Q4 2026+)
- [ ] Email парсинг и автоматизация
- [ ] Медицинские интеграции
- [ ] Планирование питания и покупок
- [ ] IoT интеграции
- [ ] Полная автоматизация рутины

## 🛡️ Безопасность

### Принципы безопасности

1. **Defense in Depth**
   - Валидация на клиенте и сервере
   - RLS на уровне базы данных
   - HTTPS везде

2. **Principle of Least Privilege**
   - Пользователи видят только свои данные
   - API ключи с минимальными правами
   - Роли и разрешения

3. **Data Protection**
   - Шифрование в покое и при передаче
   - Регулярные бэкапы
   - GDPR compliance

### Конфигурация безопасности

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
```

## 📈 Масштабируемость

### Горизонтальное масштабирование

1. **Frontend**
   - Vercel Edge Network
   - CDN для статических ресурсов
   - Image optimization

2. **API**
   - Serverless functions
   - Connection pooling
   - Caching strategies

3. **Database**
   - Supabase автоматическое масштабирование
   - Read replicas для аналитики
   - Партиционирование больших таблиц

### Оптимизация производительности

```typescript
// src/lib/cache.ts
const cache = new Map()

export function memoize<T>(fn: Function, ttl: number = 300000): T {
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    const cached = cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value
    }
    
    const result = fn(...args)
    cache.set(key, { value: result, timestamp: Date.now() })
    
    return result
  }) as T
}
```

---

## 🎯 Заключение

Архитектура Personal Productivity AI спроектирована для:

- **Быстрого MVP запуска** с минимальной сложностью
- **Поэтапной эволюции** без кардинальных переписываний
- **Высокой производительности** и отзывчивости
- **Безопасности данных** пользователей
- **Масштабируемости** до миллионов пользователей

Каждый компонент системы может развиваться независимо, что позволяет быстро адаптироваться к изменяющимся требованиям и добавлять новую функциональность без нарушения существующей.
