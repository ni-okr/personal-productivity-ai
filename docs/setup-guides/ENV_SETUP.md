# 🔧 Настройка переменных окружения

## Создание файла .env.local

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zpgkzvflmgxrlgkecscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2t6dmZsbWd4cmxna2Vjc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# OpenAI Configuration (для будущего использования)
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration (для будущего использования)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Важные замечания

1. **НЕ КОММИТЬТЕ** файл `.env.local` в Git - он уже добавлен в `.gitignore`
2. **Замените** `your_*_key_here` на реальные ключи API
3. **Supabase ключи** уже настроены для тестирования
4. **OpenAI и Stripe** ключи понадобятся позже для полного функционала

## Проверка настройки

После создания файла `.env.local` запустите:

```bash
npm run dev
```

И проверьте, что в консоли нет ошибок о missing environment variables.

## Структура переменных

- `NEXT_PUBLIC_*` - переменные, доступные в браузере
- Остальные переменные - только на сервере
- Все переменные должны быть в `.env.local` для локальной разработки
