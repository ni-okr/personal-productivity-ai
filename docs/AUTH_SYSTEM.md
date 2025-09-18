# 🔐 Система авторизации - Полная документация

## 📋 Обзор

Полная система авторизации для Personal Productivity AI, интегрированная с Supabase Auth. Включает компоненты входа, регистрации, восстановления пароля, OAuth интеграции и защищенные маршруты.

## 🏗️ Архитектура

### Основные компоненты:
- **useAuth** - центральный хук для управления авторизацией
- **AuthModal** - модальное окно с формами входа/регистрации
- **LoginForm** - форма входа с валидацией
- **RegisterForm** - форма регистрации с подтверждением пароля
- **ResetPasswordForm** - форма восстановления пароля
- **UpdatePasswordForm** - форма обновления пароля
- **ProtectedRoute** - компонент для защищенных маршрутов
- **Middleware** - защита маршрутов на уровне Next.js

### Страницы:
- `/auth/login` - страница входа
- `/auth/register` - страница регистрации
- `/auth/forgot-password` - страница восстановления пароля
- `/auth/reset-password` - страница сброса пароля
- `/auth/confirm-email` - страница подтверждения email
- `/auth/callback` - OAuth callback

## 🎯 Основные функции

### 1. Авторизация по email/паролю
```typescript
const { signIn, signUp, signOut } = useAuth()

// Вход
const result = await signIn('user@example.com', 'password123')

// Регистрация
const result = await signUp('user@example.com', 'password123', 'User Name')

// Выход
await signOut()
```

### 2. OAuth авторизация
```typescript
const { signInWithGoogle, signInWithGitHub } = useAuth()

// Google OAuth
const result = await signInWithGoogle()

// GitHub OAuth
const result = await signInWithGitHub()
```

### 3. Восстановление пароля
```typescript
const { resetPassword } = useAuth()

// Отправка ссылки для сброса
const result = await resetPassword('user@example.com')
```

### 4. Защищенные маршруты
```typescript
// Компонент с защитой
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// Хук для проверки авторизации
const { user, isAuthenticated, isLoading } = useRequireAuth()
```

## 🔧 Настройка

### 1. Переменные окружения
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DISABLE_EMAIL=true  # для отключения реальных email в dev
```

### 2. Supabase настройка
- Включить Email авторизацию
- Настроить OAuth провайдеры (Google, GitHub)
- Создать таблицы: `users`, `subscribers`
- Настроить RLS политики

### 3. Middleware настройка
```typescript
// src/middleware.ts
const protectedRoutes = ['/planner', '/dashboard', '/profile']
const authRoutes = ['/auth/login', '/auth/register']
```

## 📱 Компоненты

### AuthModal
Модальное окно с переключением между формами входа и регистрации.

```typescript
<AuthModal
  isOpen={isOpen}
  onClose={onClose}
  initialMode="login" // 'login' | 'register' | 'reset'
  onSuccess={onSuccess}
/>
```

### LoginForm
Форма входа с валидацией и показом/скрытием пароля.

**Особенности:**
- Валидация email и пароля
- Показ/скрытие пароля
- Google OAuth интеграция
- Обработка ошибок

### RegisterForm
Форма регистрации с подтверждением пароля.

**Особенности:**
- Валидация всех полей
- Проверка совпадения паролей
- Google OAuth регистрация
- Уведомления об успехе

### ResetPasswordForm
Форма восстановления пароля.

**Особенности:**
- Валидация email
- Отправка ссылки для сброса
- Обратная связь пользователю

### UpdatePasswordForm
Форма обновления пароля.

**Особенности:**
- Валидация нового пароля
- Проверка совпадения паролей
- Требования к паролю
- Кнопки отмены/подтверждения

## 🛡️ Защита маршрутов

### 1. Middleware (Next.js)
Автоматическая защита маршрутов на уровне сервера.

```typescript
// Защищенные маршруты
const protectedRoutes = ['/planner', '/dashboard', '/profile']

// Маршруты только для неавторизованных
const authRoutes = ['/auth/login', '/auth/register']
```

### 2. ProtectedRoute компонент
Защита на уровне компонентов.

```typescript
<ProtectedRoute
  requireAuth={true}  // требует авторизации
  redirectTo="/auth/login"
  fallback={<LoadingSpinner />}
>
  <YourComponent />
</ProtectedRoute>
```

### 3. useRequireAuth хук
Проверка авторизации в компонентах.

```typescript
const { user, isAuthenticated, isLoading } = useRequireAuth('/auth/login')
```

## 🔄 Состояние авторизации

### useAuth хук
Центральный хук для управления авторизацией.

```typescript
const {
  // Состояние
  user,              // текущий пользователь
  isLoading,         // загрузка
  isAuthenticated,   // авторизован ли
  error,             // ошибка

  // Действия
  signIn,            // вход
  signUp,            // регистрация
  signOut,           // выход
  resetPassword,     // сброс пароля
  signInWithGoogle,  // Google OAuth
  signInWithGitHub,  // GitHub OAuth
  clearError,        // очистить ошибку
  refreshUser        // обновить пользователя
} = useAuth()
```

## 🧪 Тестирование

### Unit тесты
```typescript
// tests/unit/auth-system.test.tsx
import { testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'

describe('Auth System Components', () => {
  beforeEach(() => {
    testFramework.updateConfig(TEST_CONFIGS.UNIT)
    testMocks.setupAllMocks()
    testLogger.startTest('Auth System Components')
  })

  test('should render login form correctly', async () => {
    // Тест рендеринга формы входа
  })
})
```

### E2E тесты
```typescript
// tests/e2e/auth-flow.test.ts
test('complete auth flow', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('[data-testid="email"]', 'test@example.test')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="login-button"]')
  await expect(page).toHaveURL('/planner')
})
```

## 🔒 Безопасность

### 1. Валидация данных
- Email валидация на клиенте и сервере
- Проверка паролей (минимум 6 символов)
- Санитизация входных данных

### 2. RLS политики
```sql
-- Пользователи видят только свои данные
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 3. Защита от атак
- CSRF защита через Supabase
- XSS защита через валидацию
- Rate limiting на уровне Supabase

## 🚀 Интеграция с планировщиком

### 1. Автоматическая загрузка задач
```typescript
// При авторизации автоматически загружаются задачи
useEffect(() => {
  if (isAuthenticated && user) {
    loadTasks()
  }
}, [isAuthenticated, user])
```

### 2. Защита API вызовов
```typescript
// Все API вызовы проверяют авторизацию
const handleAddTask = async () => {
  if (!isAuthenticated) {
    setError('Необходимо войти в систему')
    return
  }
  // ... создание задачи
}
```

### 3. Персонализация
```typescript
// Настройки пользователя влияют на интерфейс
const { preferences } = user
const workingHours = preferences.workingHours
```

## 📊 Мониторинг и логирование

### 1. Логирование действий
```typescript
// Все действия авторизации логируются
testLogger.step('User login attempt')
testLogger.assertion('Login successful', result.success)
```

### 2. Обработка ошибок
```typescript
// Централизованная обработка ошибок
const handleAuthError = (error: string) => {
  setError(getAuthErrorMessage(error))
  testLogger.error('AUTH', 'Authentication failed', { error })
}
```

### 3. Аналитика
- Отслеживание успешных входов
- Мониторинг ошибок авторизации
- Статистика использования OAuth

## 🔧 Настройка OAuth

### 1. Google OAuth
```typescript
// В Supabase Dashboard
// Authentication > Providers > Google
// Client ID: your_google_client_id
// Client Secret: your_google_client_secret
```

### 2. GitHub OAuth
```typescript
// В Supabase Dashboard
// Authentication > Providers > GitHub
// Client ID: your_github_client_id
// Client Secret: your_github_client_secret
```

### 3. Redirect URLs
```
https://yourdomain.com/auth/callback
http://localhost:3000/auth/callback
```

## 🐛 Устранение неполадок

### 1. Проблемы с авторизацией
```typescript
// Проверка переменных окружения
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### 2. Ошибки OAuth
```typescript
// Проверка настроек провайдеров в Supabase
// Проверка redirect URLs
// Проверка CORS настроек
```

### 3. Проблемы с RLS
```sql
-- Проверка политик
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Тестирование доступа
SELECT * FROM users WHERE id = auth.uid();
```

## 📈 Производительность

### 1. Ленивая загрузка
```typescript
// Компоненты загружаются только при необходимости
const AuthModal = lazy(() => import('@/components/auth/AuthModal'))
```

### 2. Кеширование
```typescript
// Пользователь кешируется в Zustand store
const { user } = useAppStore()
```

### 3. Оптимизация запросов
```typescript
// Минимизация API вызовов
const { refreshUser } = useAuth()
// Обновление только при необходимости
```

## 🎯 Лучшие практики

### 1. Валидация
- Всегда валидируйте данные на клиенте и сервере
- Используйте единую систему валидации
- Показывайте понятные сообщения об ошибках

### 2. UX
- Показывайте состояние загрузки
- Предоставляйте обратную связь
- Используйте понятные сообщения

### 3. Безопасность
- Никогда не храните пароли в localStorage
- Используйте HTTPS в продакшене
- Регулярно обновляйте зависимости

### 4. Тестирование
- Покрывайте тестами все компоненты
- Тестируйте happy path и edge cases
- Используйте моки для внешних сервисов

## 🔄 Миграция и обновления

### 1. Обновление схемы БД
```sql
-- Добавление новых полей
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
```

### 2. Обновление типов
```typescript
// Обновление TypeScript типов
interface User {
  id: string
  email: string
  name: string
  lastLoginAt?: Date  // новое поле
}
```

### 3. Обратная совместимость
```typescript
// Поддержка старых версий
const lastLogin = user.lastLoginAt || user.last_login_at
```

## 📚 Дополнительные ресурсы

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand Store](https://zustand-demo.pmnd.rs/)

---

**Система авторизации готова к использованию! 🚀**

Все компоненты протестированы, интегрированы с планировщиком и готовы к продакшену.
