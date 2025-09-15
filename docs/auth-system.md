# 🔐 Система авторизации

## Обзор

Полная система авторизации с компонентами входа, регистрации и восстановления пароля, интегрированная с Supabase Auth.

## 🏗️ Архитектура

### Компоненты

#### 1. **LoginForm** (`src/components/auth/LoginForm.tsx`)
- Форма входа с email/паролем
- Вход через Google OAuth
- Валидация полей
- Обработка ошибок
- Переключение на регистрацию/восстановление пароля

#### 2. **RegisterForm** (`src/components/auth/RegisterForm.tsx`)
- Форма регистрации с подтверждением пароля
- Регистрация через Google OAuth
- Валидация email и паролей
- Обработка ошибок
- Переключение на вход

#### 3. **ResetPasswordForm** (`src/components/auth/ResetPasswordForm.tsx`)
- Форма восстановления пароля
- Отправка ссылки на email
- Валидация email
- Обработка ошибок
- Переключение на вход

#### 4. **AuthModal** (`src/components/auth/AuthModal.tsx`)
- Модальное окно для авторизации
- Переключение между формами
- Обработка закрытия
- Хук `useAuth` для управления состоянием

### Сервисы

#### 1. **auth.ts** (`src/lib/auth.ts`)
- Основные функции авторизации
- Интеграция с Supabase Auth
- OAuth провайдеры (Google, GitHub)
- Управление профилями пользователей
- Обработка ошибок

#### 2. **useAuth.ts** (`src/hooks/useAuth.ts`)
- Хук для управления авторизацией
- Автоматическая инициализация
- Подписка на изменения состояния
- Защищенные маршруты

### Состояние

#### **useAppStore** (`src/stores/useAppStore.ts`)
- Глобальное состояние пользователя
- Функции авторизации
- Очистка данных при выходе

## 🚀 Использование

### Базовое использование

```tsx
import { AuthModal, useAuth } from '@/components/auth/AuthModal'

function App() {
  const { user, isAuthenticated, openAuthModal } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <div>Добро пожаловать, {user?.name}!</div>
      ) : (
        <button onClick={() => openAuthModal('login')}>
          Войти
        </button>
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode="login"
      />
    </div>
  )
}
```

### Защищенные маршруты

```tsx
import { useAuth } from '@/hooks/useAuth'

function ProtectedPage() {
  const { user, isLoading, requireAuth } = useAuth()

  useEffect(() => {
    requireAuth('/login')
  }, [requireAuth])

  if (isLoading) return <div>Загрузка...</div>
  if (!user) return null

  return <div>Защищенный контент</div>
}
```

### Программная авторизация

```tsx
import { signIn, signUp, signOut } from '@/lib/auth'

// Вход
const result = await signIn({
  email: 'user@example.com',
  password: 'password123'
})

// Регистрация
const result = await signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name'
})

// Выход
await signOut()
```

## 🔧 Конфигурация

### Supabase настройки

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### OAuth провайдеры

В Supabase Dashboard:
1. Authentication → Providers
2. Включить Google/GitHub
3. Настроить OAuth credentials
4. Добавить redirect URLs

### База данных

Таблица `users`:
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subscription TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Тестирование

### Unit тесты

```bash
# Тесты auth функций
npm test tests/unit/auth.test.ts

# Тесты компонентов
npm test tests/unit/auth-components.test.tsx
```

### Integration тесты

```bash
# Интеграционные тесты
npm test tests/integration/auth-integration.test.ts
```

## 🛡️ Безопасность

### Валидация

- Email валидация на клиенте и сервере
- Минимальная длина пароля (6 символов)
- Проверка совпадения паролей при регистрации

### Обработка ошибок

- Понятные сообщения об ошибках
- Логирование для отладки
- Graceful degradation

### RLS (Row Level Security)

```sql
-- Пользователи видят только свои данные
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

## 📱 Мобильная поддержка

- Responsive дизайн
- Touch-friendly интерфейс
- Оптимизация для мобильных устройств

## 🎨 Стилизация

### Tailwind CSS классы

```tsx
// Основные стили
className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"

// Состояния
className="focus:outline-none focus:ring-2 focus:ring-indigo-500"

// Темная тема
className="dark:bg-gray-700 dark:text-white"
```

### Кастомизация

Все компоненты поддерживают:
- Передачу дополнительных классов
- Кастомизацию через CSS переменные
- Темную тему

## 🔄 Состояния загрузки

```tsx
// Кнопки с состоянием загрузки
<Button 
  isLoading={isLoading}
  disabled={isLoading}
>
  {isLoading ? 'Загрузка...' : 'Войти'}
</Button>
```

## 📊 Мониторинг

### Логирование

```tsx
// Успешные операции
console.log('User signed in successfully')

// Ошибки
console.error('Auth error:', error)
```

### Метрики

- Время авторизации
- Успешность операций
- Популярность OAuth провайдеров

## 🚀 Развертывание

### Vercel

1. Настроить environment variables
2. Добавить OAuth redirect URLs
3. Настроить CORS в Supabase

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск тестов
npm test
```

## 🔧 Отладка

### Общие проблемы

1. **OAuth не работает**
   - Проверить redirect URLs
   - Проверить OAuth credentials

2. **Ошибки валидации**
   - Проверить email формат
   - Проверить длину пароля

3. **Проблемы с состоянием**
   - Проверить инициализацию store
   - Проверить подписку на изменения

### Логи

```tsx
// Включить детальное логирование
localStorage.setItem('debug', 'auth:*')
```

## 📈 Производительность

### Оптимизации

- Lazy loading компонентов
- Мемоизация функций
- Оптимизация re-renders

### Метрики

- Время загрузки форм
- Время авторизации
- Размер bundle

## 🔮 Будущие улучшения

- [ ] Биометрическая авторизация
- [ ] 2FA (Two-Factor Authentication)
- [ ] SSO интеграции
- [ ] Аналитика авторизации
- [ ] A/B тестирование форм
