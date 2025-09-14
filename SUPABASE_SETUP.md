# 🗄️ Настройка Supabase для Personal Productivity AI

## 🎯 Цель
Настроить полнофункциональную базу данных с авторизацией для MVP приложения Personal Productivity AI.

## 📋 Пошаговая инструкция

### 1. 🔧 Настройка проекта Supabase

1. **Откройте Supabase Dashboard**: https://supabase.com/dashboard
2. **Выберите проект**: `personal-productivity-ai`
3. **URL проекта**: https://zpgkzvflmgxrlgkecscg.supabase.co

### 2. 🗃️ Создание таблиц базы данных

1. **Перейдите в SQL Editor** (боковое меню)
2. **Выполните скрипт** `supabase-setup.sql` (полностью скопируйте и вставьте)
3. **Нажмите RUN** для выполнения

### 3. ✅ Проверка созданных таблиц

После выполнения скрипта должны появиться таблицы:

- ✅ `public.users` - профили пользователей
- ✅ `public.tasks` - задачи пользователей  
- ✅ `public.productivity_metrics` - метрики продуктивности
- ✅ `public.ai_suggestions` - рекомендации ИИ

### 4. 🔐 Проверка RLS политик

В разделе **Authentication → Policies** должны быть созданы политики:

- `Users can view own profile`
- `Users can update own profile` 
- `Users can view own tasks`
- `Users can insert own tasks`
- `Users can update own tasks`
- `Users can delete own tasks`

### 5. 🔑 Переменные окружения

Убедитесь что в `.env.local` есть:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zpgkzvflmgxrlgkecscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2t6dmZsbWd4cmxna2Vjc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDM5MDcsImV4cCI6MjA3MzQxOTkwN30.usDTWCrgyMiGY1BDhy-FBy-YTSOhPNEuAm1lh1FMH5c
```

⚠️ **ВАЖНО**: Эти данные НЕ должны попадать в Git!

## 🧪 Тестирование

### Тест подключения к базе

```bash
# Запустите приложение
npm run dev

# Откройте http://localhost:3000/api/test
# Должен вернуть: {"status": "ok", "timestamp": "..."}
```

### Тест регистрации пользователя

1. Откройте главную страницу
2. Введите email в форму подписки
3. Проверьте в Supabase Dashboard → Table Editor → subscribers

## 🚀 Следующие шаги после настройки

1. **Создать компоненты авторизации** (формы входа/регистрации)
2. **Интегрировать с планировщиком задач**
3. **Добавить сохранение задач в базу данных**
4. **Настроить email подтверждение**

## 🔧 Структура базы данных

### Таблица `users`
- `id` - UUID (связь с auth.users)
- `email` - email пользователя
- `name` - имя пользователя
- `subscription` - тариф (free/premium/pro)
- `preferences` - настройки пользователя (JSON)
- `created_at`, `last_login_at`, `updated_at` - временные метки

### Таблица `tasks`
- `id` - UUID задачи
- `user_id` - связь с пользователем
- `title`, `description` - содержание задачи
- `priority` - приоритет (low/medium/high/urgent)
- `status` - статус (todo/in_progress/completed/cancelled)
- `estimated_minutes`, `actual_minutes` - время выполнения
- `due_date`, `completed_at` - даты
- `source` - источник создания (manual/email/calendar/ai_suggestion)
- `tags` - теги задачи
- `ai_generated`, `ai_reason` - метки ИИ

### Таблица `productivity_metrics`
- Ежедневные метрики продуктивности пользователя
- Оценка фокуса, количество задач, отвлечения
- Настроение и уровень энергии

### Таблица `ai_suggestions`
- Рекомендации от ИИ системы
- Типы: перерыв, фокус, приоритизация, оптимизация расписания

## 🛡️ Безопасность

- **RLS включен** для всех таблиц
- **Пользователи видят только свои данные**
- **Автоматические триггеры** для обновления временных меток
- **Валидация данных** на уровне базы данных

## 📞 Поддержка

При проблемах с настройкой:
1. Проверьте логи в браузере (F12 → Console)
2. Проверьте переменные окружения
3. Убедитесь что RLS политики созданы
4. Проверьте что таблицы существуют в Table Editor

---

**Готово! База данных настроена для MVP! 🎉**
