-- 🔄 Миграция: Добавление таблицы подписок
-- Выполните этот скрипт в Supabase SQL Editor

-- =====================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ ПОДПИСОК
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

-- =====================================
-- 2. ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- =====================================

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_tier_idx ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);

-- =====================================
-- 3. RLS ПОЛИТИКИ
-- =====================================

-- Включаем RLS для таблицы подписок
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================
-- 4. ТРИГГЕР ДЛЯ ОБНОВЛЕНИЯ UPDATED_AT
-- =====================================

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- 5. СОЗДАНИЕ БАЗОВЫХ ПОДПИСОК ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================

-- Создаем free подписки для всех существующих пользователей
INSERT INTO public.subscriptions (user_id, tier, status, current_period_start, current_period_end)
SELECT 
    id as user_id,
    'free' as tier,
    'active' as status,
    NOW() as current_period_start,
    NOW() + INTERVAL '1 year' as current_period_end
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================
-- ГОТОВО! 🎉
-- =====================================

-- Теперь таблица подписок создана и готова к использованию!
-- Все существующие пользователи получили free подписки
-- RLS политики настроены для безопасности
-- Индексы созданы для производительности
