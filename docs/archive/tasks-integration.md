# 📋 Интеграция планировщика задач с Supabase

## 🎯 Обзор

Документация описывает полную интеграцию системы задач с Supabase, включая API функции, обновленный Zustand store, интеграцию с планировщиком и комплексное тестирование.

## 🏗️ Архитектура

### Компоненты системы:

1. **`src/lib/tasks.ts`** - API функции для работы с задачами в Supabase
2. **`src/stores/useAppStore.ts`** - Обновленный Zustand store с Supabase интеграцией
3. **`src/app/planner/page.tsx`** - Планировщик с полной интеграцией
4. **`tests/`** - Комплексные тесты (unit, integration)

## 📊 API Функции (src/lib/tasks.ts)

### Основные функции:

```typescript
// Получение задач пользователя
getTasks(userId: string): Promise<TasksResponse>

// Создание новой задачи
createTask(userId: string, taskData: CreateTaskData): Promise<TasksResponse>

// Обновление задачи
updateTask(taskId: string, updates: UpdateTaskData): Promise<TasksResponse>

// Удаление задачи
deleteTask(taskId: string): Promise<TasksResponse>

// Завершение задачи
completeTask(taskId: string, actualDuration?: number): Promise<TasksResponse>

// Получение статистики
getTasksStats(userId: string): Promise<StatsResponse>

// Синхронизация задач
syncTasks(userId: string): Promise<TasksResponse>
```

### Типы данных:

```typescript
interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: Date
  estimatedDuration?: number
  tags?: string[]
}

interface UpdateTaskData {
  title?: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: Date
  completedAt?: Date
  estimatedDuration?: number
  actualDuration?: number
  tags?: string[]
}

interface TasksResponse {
  success: boolean
  tasks?: Task[]
  task?: Task
  error?: string
  message?: string
}
```

## 🔄 Zustand Store (src/stores/useAppStore.ts)

### Новые асинхронные действия:

```typescript
// Загрузка задач из Supabase
loadTasks: () => Promise<void>

// Создание задачи через Supabase
createTaskAsync: (taskData: CreateTaskData) => Promise<void>

// Обновление задачи через Supabase
updateTaskAsync: (id: string, updates: UpdateTaskData) => Promise<void>

// Удаление задачи через Supabase
deleteTaskAsync: (id: string) => Promise<void>

// Завершение задачи через Supabase
completeTaskAsync: (id: string, actualDuration?: number) => Promise<void>

// Синхронизация задач
syncTasksAsync: () => Promise<void>

// Загрузка статистики
loadTasksStats: () => Promise<void>
```

### Состояние загрузки и ошибок:

```typescript
interface AppState {
  // ... existing state
  isLoading: boolean
  error: string | null
}
```

## 🎨 Планировщик (src/app/planner/page.tsx)

### Ключевые изменения:

1. **Интеграция с авторизацией:**
   - Проверка `isAuthenticated` перед загрузкой задач
   - Экран входа для неавторизованных пользователей
   - Автоматическая загрузка задач при входе

2. **Supabase операции:**
   - Создание задач через `createTaskAsync`
   - Обновление через `updateTaskAsync` и `completeTaskAsync`
   - Удаление через `deleteTaskAsync`

3. **Обработка состояний:**
   - Loading состояния для всех операций
   - Отображение ошибок пользователю
   - Валидация форм

### Пример использования:

```typescript
const { 
  user, 
  isAuthenticated, 
  requireAuth 
} = useAuth()

const {
  tasks,
  loadTasks,
  createTaskAsync,
  updateTaskAsync,
  deleteTaskAsync,
  completeTaskAsync,
  isLoading,
  error
} = useAppStore()

// Загрузка задач при входе
useEffect(() => {
  if (isAuthenticated && user) {
    loadTasks()
  }
}, [isAuthenticated, user, loadTasks])

// Создание задачи
const handleAddTask = async () => {
  if (!isAuthenticated || !user) {
    setValidationErrors(['Необходимо войти в систему'])
    return
  }

  await createTaskAsync({
    title: newTask.title.trim(),
    description: newTask.description?.trim(),
    priority: newTask.priority,
    dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    estimatedDuration: newTask.estimatedMinutes,
    tags: []
  })
}
```

## 🧪 Тестирование

### Unit тесты:

1. **`tests/unit/tasks.test.ts`** - Тесты API функций
2. **`tests/unit/tasks-store.test.ts`** - Тесты Zustand store

### Integration тесты:

1. **`tests/integration/planner-integration.test.tsx`** - Тесты планировщика

### Покрытие тестами:

- ✅ API функции (CRUD операции)
- ✅ Zustand store (асинхронные действия)
- ✅ Планировщик (UI интеграция)
- ✅ Обработка ошибок
- ✅ Состояния загрузки
- ✅ Валидация форм

## 🔐 Безопасность

### Row Level Security (RLS):

```sql
-- Политика для таблицы tasks
CREATE POLICY "Users can only see their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Политика для создания задач
CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика для обновления задач
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Политика для удаления задач
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### Валидация данных:

- Клиентская валидация через `validateTask`
- Серверная валидация через Supabase RLS
- Санитизация входных данных

## 📈 Производительность

### Оптимизации:

1. **Ленивая загрузка:** Задачи загружаются только при входе пользователя
2. **Кеширование:** Zustand store кеширует данные локально
3. **Оптимистичные обновления:** UI обновляется сразу, затем синхронизируется с сервером
4. **Пакетные операции:** Группировка операций для уменьшения запросов

### Мониторинг:

```typescript
// Логирование операций
console.log('Tasks stats:', result.stats)

// Обработка ошибок
try {
  const result = await createTask(userId, taskData)
  if (!result.success) {
    console.error('Task creation failed:', result.error)
  }
} catch (error) {
  console.error('Unexpected error:', error)
}
```

## 🚀 Развертывание

### Переменные окружения:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zpgkzvflmgxrlgkecscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Миграции базы данных:

```sql
-- Создание таблицы tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

## 🔧 Использование

### Базовое использование:

```typescript
import { useAppStore } from '@/stores/useAppStore'
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  const { 
    tasks, 
    loadTasks, 
    createTaskAsync, 
    isLoading, 
    error 
  } = useAppStore()

  // Загрузка задач
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTasks()
    }
  }, [isAuthenticated, user, loadTasks])

  // Создание задачи
  const handleCreateTask = async () => {
    await createTaskAsync({
      title: 'New Task',
      description: 'Task description',
      priority: 'high',
      estimatedDuration: 30,
      tags: ['work']
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

### Расширенное использование:

```typescript
// Синхронизация задач
const handleSync = async () => {
  await syncTasksAsync()
}

// Загрузка статистики
const handleLoadStats = async () => {
  await loadTasksStats()
}

// Завершение задачи с временем
const handleComplete = async (taskId: string) => {
  await completeTaskAsync(taskId, 45) // 45 минут
}
```

## 🐛 Отладка

### Логирование:

```typescript
// Включение детального логирования
const DEBUG_TASKS = process.env.NODE_ENV === 'development'

if (DEBUG_TASKS) {
  console.log('Task operation:', { operation, taskId, data })
}
```

### Проверка состояния:

```typescript
// Проверка состояния store
console.log('Store state:', useAppStore.getState())

// Проверка подключения к Supabase
const { data, error } = await supabase
  .from('tasks')
  .select('count')
  .limit(1)

console.log('Supabase connection:', { data, error })
```

## 📚 Дополнительные ресурсы

- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🎯 Следующие шаги

1. **Реальное время:** Добавить real-time подписки на изменения задач
2. **Офлайн режим:** Реализовать офлайн кеширование
3. **Уведомления:** Добавить push уведомления для дедлайнов
4. **Экспорт:** Возможность экспорта задач в различные форматы
5. **Интеграции:** Подключение к внешним календарям и задачам
