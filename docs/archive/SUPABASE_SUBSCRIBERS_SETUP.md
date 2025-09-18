# 🗄️ Настройка таблицы subscribers в Supabase

## 🚨 КРИТИЧНО: Выполните этот SQL скрипт в Supabase!

Интеграционные тесты падают, потому что таблица `subscribers` не существует в базе данных.

## 📋 Инструкция по выполнению:

### 1. Откройте Supabase Dashboard
- Перейдите на https://supabase.com/dashboard
- Выберите проект `personal-productivity-ai`

### 2. Откройте SQL Editor
- В левом меню выберите "SQL Editor"
- Нажмите "New query"

### 3. Выполните SQL скрипт
Скопируйте и вставьте содержимое файла `database/supabase-subscribers-table.sql`:

```sql
-- 🗄️ SQL скрипт для создания таблицы подписчиков на рассылку
-- Выполните этот скрипт в SQL Editor на https://supabase.com

-- =====================================
-- ТАБЛИЦА ПОДПИСЧИКОВ НА РАССЫЛКУ
-- =====================================

-- Создаем таблицу для хранения подписчиков на email рассылку
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'landing_page' CHECK (source IN ('landing_page', 'api', 'admin', 'import')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS subscribers_email_idx ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS subscribers_is_active_idx ON public.subscribers(is_active);
CREATE INDEX IF NOT EXISTS subscribers_source_idx ON public.subscribers(source);
CREATE INDEX IF NOT EXISTS subscribers_created_at_idx ON public.subscribers(created_at);

-- =====================================
-- RLS (ROW LEVEL SECURITY) ПОЛИТИКИ
-- =====================================

-- Включаем RLS для таблицы subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы subscribers
-- Публичный доступ для чтения активных подписчиков (для админов)
CREATE POLICY "Public read access for active subscribers" ON public.subscribers
    FOR SELECT USING (is_active = true);

-- Публичный доступ для вставки новых подписчиков
CREATE POLICY "Public insert access for new subscribers" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- Публичный доступ для обновления статуса подписки (отписка)
CREATE POLICY "Public update access for unsubscribe" ON public.subscribers
    FOR UPDATE USING (true);

-- =====================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- =====================================

-- Триггер для обновления updated_at
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Нажмите "Run"
- Нажмите кнопку "Run" для выполнения скрипта
- Должно появиться сообщение об успешном выполнении

### 5. Проверьте создание таблицы
- Перейдите в "Table Editor"
- Убедитесь, что таблица `subscribers` появилась в списке

## ✅ После выполнения:

1. **Запустите тесты снова:**
   ```bash
   npm run test:integration:ci
   ```

2. **Проверьте API подписки:**
   ```bash
   curl -X POST http://localhost:3000/api/subscribe \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

## 🚨 Важно:
- Без этой таблицы интеграционные тесты будут падать
- API подписки не будет работать
- Функции `addSubscriber`, `getActiveSubscribers`, `unsubscribe` не смогут работать

## 📊 Ожидаемый результат:
- ✅ Таблица `subscribers` создана
- ✅ RLS политики настроены
- ✅ Индексы созданы
- ✅ Триггеры настроены
- ✅ Интеграционные тесты проходят
