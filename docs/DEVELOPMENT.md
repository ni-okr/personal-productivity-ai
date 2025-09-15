# 👨‍💻 Руководство разработчика

## 🎯 Добро пожаловать в команду!

Это руководство поможет вам быстро влиться в разработку Personal Productivity AI и следовать принятым в проекте стандартам.

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** 18+ 
- **npm** 9+
- **Git** 2.30+
- **VS Code** (рекомендуется) с расширениями:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint

### Настройка окружения

```bash
# 1. Клонирование репозитория
git clone https://github.com/ni-okr/personal-productivity-ai.git
cd personal-productivity-ai-clean

# 2. Установка зависимостей
npm install

# 3. Настройка переменных окружения
cp .env.example .env.local

# Заполните .env.local:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Настройка Supabase (см. SUPABASE_SETUP.md)
# Выполните SQL скрипт supabase-setup.sql

# 5. Запуск в режиме разработки
npm run dev

# 6. Проверка что все работает
open http://localhost:3000
```

### Первый запуск тестов

```bash
# Unit тесты
npm run test:unit

# E2E тесты (требует запущенного dev сервера)
npm run test:e2e

# Все тесты
npm run test:all

# Просмотр Allure отчетов
npm run allure:serve
```

## 📋 Стандарты кодирования

### TypeScript

**✅ Хорошо:**
```typescript
// Строгая типизация
interface Task {
  id: string
  title: string
  priority: TaskPriority
  createdAt: Date
}

// Явные типы возвращаемых значений
export async function createTask(data: CreateTaskData): Promise<Task> {
  const task: Task = {
    id: crypto.randomUUID(),
    title: data.title,
    priority: data.priority,
    createdAt: new Date()
  }
  
  return task
}

// Обработка ошибок с типизацией
try {
  const result = await apiCall()
  return result
} catch (error: any) {
  console.error('API Error:', error)
  throw new Error('Failed to process request')
}
```

**❌ Плохо:**
```typescript
// Использование any
function processData(data: any): any {
  return data.something
}

// Отсутствие обработки ошибок
async function fetchData() {
  const response = await fetch('/api/data')
  return response.json() // Может упасть
}

// Мутация состояния
function updateTask(task: Task) {
  task.title = 'New title' // Мутация
  return task
}
```

### React компоненты

**✅ Хорошо:**
```typescript
// Функциональные компоненты с типизацией
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  children,
  onClick,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        variants[variant],
        sizes[size],
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      disabled={isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
```

**❌ Плохо:**
```typescript
// Компонент без типизации
export function Button(props) {
  return <button style={{...}} onClick={props.onClick}>{props.children}</button>
}

// Inline стили вместо Tailwind
export function Card() {
  return (
    <div style={{ 
      padding: '16px', 
      backgroundColor: 'white',
      borderRadius: '8px' 
    }}>
      Content
    </div>
  )
}
```

### Стилизация (Tailwind CSS)

**✅ Хорошо:**
```typescript
// Использование утилиты cn для условных классов
<div className={cn(
  'p-4 rounded-lg border',
  isActive && 'bg-blue-50 border-blue-200',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>

// Responsive дизайн
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Семантические цвета
<button className="bg-indigo-600 hover:bg-indigo-700 text-white">
```

**❌ Плохо:**
```typescript
// Inline стили
<div style={{ padding: '16px', backgroundColor: '#f3f4f6' }}>

// Хардкод цветов
<button className="bg-[#4f46e5] hover:bg-[#4338ca]">

// Неконсистентные отступы
<div className="p-2">
  <div className="p-4">
    <div className="p-1">
```

## 🏗️ Архитектурные принципы

### 1. Разделение ответственности

```
src/
├── app/                    # Next.js маршруты и layouts
├── components/            # Переиспользуемые UI компоненты
├── lib/                   # Бизнес-логика и интеграции
├── stores/                # Управление состоянием
├── types/                 # TypeScript типы
├── utils/                 # Утилиты и хелперы
└── services/              # Внешние сервисы
```

### 2. Управление состоянием

**Zustand для глобального состояния:**
```typescript
// ✅ Правильно
interface AppState {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [],
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  }))
}))
```

**React state для локального состояния:**
```typescript
// ✅ Для форм и UI состояния
function TaskForm() {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ...
}
```

### 3. Обработка ошибок

**Error Boundaries для React ошибок:**
```typescript
<ErrorBoundary>
  <TaskList />
</ErrorBoundary>
```

**Try-catch для асинхронных операций:**
```typescript
async function handleSubmit() {
  setIsLoading(true)
  setError(null)
  
  try {
    await submitTask(taskData)
    setSuccess('Task created successfully!')
  } catch (error: any) {
    setError(error.message || 'Something went wrong')
    console.error('Task submission error:', error)
  } finally {
    setIsLoading(false)
  }
}
```

### 4. Валидация данных

**Zod для схем валидации:**
```typescript
import { z } from 'zod'

const TaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedMinutes: z.number().min(5).max(1440).optional()
})

export function validateTask(data: unknown): ValidationResult {
  try {
    const validData = TaskSchema.parse(data)
    return { isValid: true, data: validData, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        errors: error.errors.map(e => e.message) 
      }
    }
    return { isValid: false, errors: ['Validation failed'] }
  }
}
```

## 🧪 Тестирование

### Unit тесты (Jest)

```typescript
// tests/unit/validation.test.ts
import { validateTask } from '@/utils/validation'

describe('validateTask', () => {
  it('should validate correct task data', () => {
    const taskData = {
      title: 'Test task',
      priority: 'medium' as const,
      estimatedMinutes: 30
    }
    
    const result = validateTask(taskData)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  
  it('should reject task with short title', () => {
    const taskData = {
      title: 'Hi',
      priority: 'medium' as const
    }
    
    const result = validateTask(taskData)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title must be at least 3 characters')
  })
})
```

### Integration тесты

```typescript
// tests/integration/supabase-api.test.ts
import { addSubscriber } from '@/lib/supabase'

describe('Supabase API', () => {
  afterEach(async () => {
    // Cleanup test data
    await supabase.from('subscriptions').delete().eq('email', 'test@example.com')
  })
  
  it('should add new subscriber', async () => {
    const result = await addSubscriber('test@example.com')
    
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({
      email: 'test@example.com',
      status: 'active'
    })
  })
})
```

### E2E тесты (Playwright)

```typescript
// tests/e2e/task-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  test('should create new task', async ({ page }) => {
    await page.goto('/planner')
    
    // Click add task button
    await page.click('[data-testid="add-task-button"]')
    
    // Fill form
    await page.fill('[data-testid="task-title"]', 'New test task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    
    // Submit
    await page.click('[data-testid="submit-task"]')
    
    // Verify task appears
    await expect(page.locator('[data-testid="task-item"]')).toContainText('New test task')
  })
})
```

## 📦 Работа с зависимостями

### Добавление новых пакетов

```bash
# Production зависимости
npm install package-name

# Development зависимости  
npm install -D package-name

# Проверка уязвимостей
npm audit

# Обновление зависимостей
npm update
```

### Рекомендуемые пакеты

**UI и стилизация:**
- `@headlessui/react` - Доступные UI компоненты
- `@heroicons/react` - Иконки
- `framer-motion` - Анимации

**Утилиты:**
- `date-fns` - Работа с датами
- `zod` - Валидация схем
- `clsx` - Условные CSS классы

**Тестирование:**
- `@testing-library/react` - Тестирование React
- `msw` - Мокирование API
- `faker` - Генерация тестовых данных

## 🔄 Git workflow

### Ветки

```bash
# Основные ветки
main                    # Продакшн код
develop                 # Интеграционная ветка (будущее)

# Feature ветки
feature/auth-system     # Новая функциональность
bugfix/task-validation  # Исправление багов
hotfix/security-patch   # Критические исправления
```

### Коммиты

**Формат коммитов:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Примеры:**
```bash
feat(auth): add user registration with email verification
fix(tasks): resolve task deletion not updating UI
docs(readme): update installation instructions
test(api): add integration tests for subscription endpoint
refactor(components): extract reusable Button component
```

**Типы коммитов:**
- `feat` - новая функциональность
- `fix` - исправление бага
- `docs` - документация
- `style` - форматирование кода
- `refactor` - рефакторинг без изменения функциональности
- `test` - добавление тестов
- `chore` - обновление зависимостей, конфигурации

### Pull Requests

**Шаблон PR:**
```markdown
## 🎯 Описание
Краткое описание изменений

## 🔄 Тип изменений
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## ✅ Чеклист
- [ ] Код следует стандартам проекта
- [ ] Добавлены/обновлены тесты
- [ ] Все тесты проходят
- [ ] Документация обновлена
- [ ] Нет конфликтов с main веткой

## 🧪 Тестирование
Описание как тестировать изменения

## 📸 Скриншоты
Если применимо
```

## 🚀 Деплой

### Локальная сборка

```bash
# Сборка для продакшена
npm run build

# Запуск продакшн сборки локально
npm start

# Проверка размера бандла
npm run analyze
```

### Vercel деплой

```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой в preview
vercel

# Деплой в продакшн
vercel --prod
```

## 🐛 Отладка

### Логирование

```typescript
// Development логи
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// Production логи (только ошибки)
console.error('Error occurred:', error)

// Структурированное логирование
const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta)
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error)
  }
}
```

### React DevTools

```typescript
// Добавление displayName для компонентов
Button.displayName = 'Button'

// Использование React.memo для оптимизации
export const TaskItem = React.memo(function TaskItem({ task }: Props) {
  return <div>{task.title}</div>
})
```

### Next.js отладка

```typescript
// next.config.js
module.exports = {
  // Подробные логи сборки
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Source maps в продакшене (осторожно!)
  productionBrowserSourceMaps: true,
}
```

## 📊 Производительность

### Оптимизация изображений

```typescript
import Image from 'next/image'

// ✅ Правильно
<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority // Для above-the-fold изображений
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ Неправильно
<img src="/hero-image.jpg" alt="Hero" />
```

### Lazy loading компонентов

```typescript
import dynamic from 'next/dynamic'

// Ленивая загрузка тяжелых компонентов
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Если компонент не нужен на сервере
})
```

### Мемоизация

```typescript
import { useMemo, useCallback } from 'react'

function TaskList({ tasks, onTaskUpdate }: Props) {
  // Мемоизация вычислений
  const sortedTasks = useMemo(() => {
    return tasks.sort((a, b) => a.priority.localeCompare(b.priority))
  }, [tasks])
  
  // Мемоизация коллбеков
  const handleTaskClick = useCallback((taskId: string) => {
    onTaskUpdate(taskId, { status: 'completed' })
  }, [onTaskUpdate])
  
  return (
    <div>
      {sortedTasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onClick={handleTaskClick}
        />
      ))}
    </div>
  )
}
```

## 🔐 Безопасность

### Валидация входных данных

```typescript
// API routes
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Валидация с Zod
    const validData = TaskSchema.parse(body)
    
    // Санитизация
    const sanitizedData = {
      ...validData,
      title: validData.title.trim(),
      description: validData.description?.trim()
    }
    
    // Обработка...
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
```

### Environment variables

```typescript
// Проверка обязательных переменных
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}
```

## 📚 Полезные ресурсы

### Документация
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Инструменты
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Сообщество
- [Next.js GitHub](https://github.com/vercel/next.js)
- [React GitHub](https://github.com/facebook/react)
- [TypeScript GitHub](https://github.com/microsoft/TypeScript)

## 🎯 Заключение

Следуя этому руководству, вы сможете:

- ✅ Быстро настроить окружение разработки
- ✅ Писать качественный, типизированный код
- ✅ Создавать надежные тесты
- ✅ Следовать принятым в проекте стандартам
- ✅ Эффективно работать в команде

**Помните:** Качество кода важнее скорости разработки. Лучше потратить время на правильную архитектуру сейчас, чем переписывать потом.

**Удачной разработки! 🚀**
