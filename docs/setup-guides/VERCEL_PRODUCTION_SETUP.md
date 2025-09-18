# 🚀 Настройка продакшна в Vercel

## Проблема
В продакшне установлен `NEXT_PUBLIC_DISABLE_EMAIL=true`, что отключает реальные почтовые сервисы и включает mock режим.

## Решение

### 1. Зайдите в Vercel Dashboard
- Откройте https://vercel.com/dashboard
- Найдите проект `personal-productivity-ai`
- Перейдите в Settings → Environment Variables

### 2. Установите правильные переменные для продакшна:

```env
# ВАЖНО: Отключить mock режим в продакшне!
NEXT_PUBLIC_DISABLE_EMAIL=false
NEXT_PUBLIC_DEV_MODE=false

# Реальные Supabase ключи (уже должны быть)
NEXT_PUBLIC_SUPABASE_URL=https://zpgkzvflmgxrlgkecscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2t6dmZsbWd4cmxna2Vjc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDM5MDcsImV4cCI6MjA3MzQxOTkwN30.usDTWCrgyMiGY1BDhy-FBy-YTSOhPNEuAm1lh1FMH5c

# Реальные Tinkoff ключи (когда получите)
TINKOFF_TERMINAL_KEY=your_real_tinkoff_terminal_key
TINKOFF_SECRET_KEY=your_real_tinkoff_secret_key
TINKOFF_WEBHOOK_URL=https://personal-productivity-ai.vercel.app/api/tinkoff/webhook

# Банковские реквизиты
TINKOFF_RECIPIENT_FULL_NAME="Ваше ФИО"
TINKOFF_ACCOUNT_NUMBER="ваш_номер_счета"
TINKOFF_BANK_NAME="АО «ТБанк»"
TINKOFF_BIK="ваш_БИК"
TINKOFF_CORR_ACCOUNT="ваш_корр_счет"
TINKOFF_INN="ваш_ИНН"

# URL приложения
NEXT_PUBLIC_APP_URL=https://personal-productivity-ai.vercel.app
NEXT_PUBLIC_APP_NAME="Personal Productivity AI"

# Feature toggles
NEXT_PUBLIC_FEATURE_TOGGLES_ENABLED=true
NEXT_PUBLIC_DEBUG_MODE=false
```

### 3. Удалите неправильные переменные:
- Удалите `NEXT_PUBLIC_DISABLE_EMAIL=true` (если есть)
- Удалите `NEXT_PUBLIC_DEV_MODE=true` (если есть)

### 4. Перезапустите деплой:
- После изменения переменных Vercel автоматически перезапустит деплой
- Или нажмите "Redeploy" вручную

## Проверка

После настройки проверьте:
1. **Авторизация работает** - можно войти через email/пароль
2. **API подписок работает** - нет 406 ошибок
3. **Планировщик работает** - можно создавать задачи
4. **Google OAuth** - пока отключен (нужно настроить в Supabase)

## Тесты

Тесты должны работать с mock режимом:
- `NEXT_PUBLIC_DISABLE_EMAIL=true` в тестах
- `NEXT_PUBLIC_DEV_MODE=true` в тестах
- `TEST_EMAIL_DOMAIN=@example.test` в тестах

## Результат

После настройки:
- ✅ Продакшн работает с реальными сервисами
- ✅ Тесты работают с mock режимом
- ✅ Нет конфликтов между тестами и продакшном
