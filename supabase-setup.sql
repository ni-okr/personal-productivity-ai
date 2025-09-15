-- 🗄️ SQL скрипт для настройки базы данных Supabase
-- Выполните этот скрипт в SQL Editor на https://supabase.com

-- =====================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- =====================================

-- Создаем таблицу пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium', 'pro')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_subscription_idx ON public.users(subscription);

-- =====================================
-- 2. ТАБЛИЦА ЗАДАЧ
-- =====================================

-- Создаем таблицу задач
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'email', 'calendar', 'ai_suggestion')),
    tags TEXT[] DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at);

-- =====================================
-- 3. ТАБЛИЦА МЕТРИК ПРОДУКТИВНОСТИ
-- =====================================

-- Создаем таблицу для хранения метрик продуктивности
CREATE TABLE IF NOT EXISTS public.productivity_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    focus_time_minutes INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    distractions_count INTEGER DEFAULT 0,
    productivity_score INTEGER DEFAULT 0 CHECK (productivity_score >= 0 AND productivity_score <= 100),
    mood TEXT CHECK (mood IN ('low', 'medium', 'high')),
    energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Индексы для метрик
CREATE INDEX IF NOT EXISTS productivity_metrics_user_date_idx ON public.productivity_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS productivity_metrics_date_idx ON public.productivity_metrics(date);

-- =====================================
-- 4. ТАБЛИЦА ПОДПИСОК
-- =====================================

-- Создаем таблицу для хранения подписок пользователей
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'pro')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'unpaid')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Один пользователь = одна подписка
);

-- Индексы для подписок
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_tier_idx ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);

-- =====================================
-- 5. ТАБЛИЦА ИИ РЕКОМЕНДАЦИЙ
-- =====================================

-- Создаем таблицу для хранения рекомендаций ИИ
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('take_break', 'focus_time', 'task_prioritization', 'schedule_optimization', 'productivity_tip', 'goal_reminder')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_text TEXT,
    priority INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для рекомендаций
CREATE INDEX IF NOT EXISTS ai_suggestions_user_id_idx ON public.ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS ai_suggestions_type_idx ON public.ai_suggestions(type);
CREATE INDEX IF NOT EXISTS ai_suggestions_expires_at_idx ON public.ai_suggestions(expires_at);

-- =====================================
-- 6. RLS (ROW LEVEL SECURITY) ПОЛИТИКИ
-- =====================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для таблицы tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Политики для таблицы productivity_metrics
CREATE POLICY "Users can view own metrics" ON public.productivity_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON public.productivity_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON public.productivity_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Политики для таблицы subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Политики для таблицы ai_suggestions
CREATE POLICY "Users can view own suggestions" ON public.ai_suggestions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions" ON public.ai_suggestions
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================
-- 7. ФУНКЦИИ И ТРИГГЕРЫ
-- =====================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productivity_metrics_updated_at BEFORE UPDATE ON public.productivity_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- 8. ФУНКЦИЯ СОЗДАНИЯ ПРОФИЛЯ ПРИ РЕГИСТРАЦИИ
-- =====================================

-- Функция для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Пользователь')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Триггер для создания профиля при регистрации
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================
-- 9. ПРЕДСТАВЛЕНИЯ ДЛЯ АНАЛИТИКИ
-- =====================================

-- Представление для статистики пользователя
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.subscription,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as pending_tasks,
    AVG(CASE WHEN t.status = 'completed' THEN t.actual_minutes END) as avg_task_duration,
    MAX(pm.productivity_score) as max_productivity_score,
    AVG(pm.productivity_score) as avg_productivity_score
FROM public.users u
LEFT JOIN public.tasks t ON u.id = t.user_id
LEFT JOIN public.productivity_metrics pm ON u.id = pm.user_id
GROUP BY u.id, u.name, u.email, u.subscription;

-- =====================================
-- 10. НАЧАЛЬНЫЕ ДАННЫЕ
-- =====================================

-- Можно добавить начальные данные, например, шаблоны задач
-- INSERT INTO public.task_templates (title, description, priority, estimated_minutes) VALUES
-- ('Утренняя зарядка', 'Начни день с энергии!', 'medium', 15),
-- ('Планирование дня', 'Определи приоритеты на сегодня', 'high', 10);

-- =====================================
-- ГОТОВО! 🎉
-- =====================================

-- Теперь ваша база данных готова для Personal Productivity AI!
-- 
-- Основные возможности:
-- ✅ Авторизация пользователей через Supabase Auth
-- ✅ Безопасность данных через RLS
-- ✅ Хранение задач с метаданными
-- ✅ Метрики продуктивности
-- ✅ ИИ рекомендации
-- ✅ Автоматические триггеры
-- ✅ Аналитические представления
--
-- Следующие шаги:
-- 1. Выполните этот скрипт в Supabase SQL Editor
-- 2. Проверьте что все таблицы созданы
-- 3. Протестируйте регистрацию пользователя
-- 4. Интегрируйте с фронтендом
