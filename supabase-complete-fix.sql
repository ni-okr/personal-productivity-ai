-- 🔧 ПОЛНОЕ ИСПРАВЛЕНИЕ СХЕМЫ БАЗЫ ДАННЫХ
-- Этот скрипт исправляет все проблемы с таблицами

-- 1. Удаляем старую таблицу subscriptions (если есть)
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- 2. Создаем таблицу subscriptions для EMAIL РАССЫЛКИ
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(100) DEFAULT 'landing_page',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу user_subscriptions для ПЛАТНЫХ ПОДПИСОК ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'premium', 'pro', 'enterprise')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. Создаем индексы для subscriptions (email рассылка)
CREATE INDEX idx_subscriptions_email ON public.subscriptions(email);
CREATE INDEX idx_subscriptions_is_active ON public.subscriptions(is_active);
CREATE INDEX idx_subscriptions_created_at ON public.subscriptions(created_at);

-- 5. Создаем индексы для user_subscriptions (платные подписки)
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON public.user_subscriptions(tier);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);

-- 6. Включаем RLS для обеих таблиц
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. RLS политики для subscriptions (email рассылка)
CREATE POLICY "Anyone can insert subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select subscriptions" ON public.subscriptions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update subscriptions" ON public.subscriptions
    FOR UPDATE USING (true);

-- 8. RLS политики для user_subscriptions (платные подписки)
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- 9. Создаем триггеры для updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- 10. Добавляем комментарии
COMMENT ON TABLE public.subscriptions IS 'Email подписчики для рассылки';
COMMENT ON TABLE public.user_subscriptions IS 'Платные подписки пользователей';

COMMENT ON COLUMN public.subscriptions.email IS 'Email адрес подписчика';
COMMENT ON COLUMN public.subscriptions.source IS 'Источник подписки (landing_page, api, etc.)';
COMMENT ON COLUMN public.subscriptions.is_active IS 'Активна ли подписка';

COMMENT ON COLUMN public.user_subscriptions.tier IS 'Уровень подписки (free, premium, pro, enterprise)';
COMMENT ON COLUMN public.user_subscriptions.status IS 'Статус подписки (active, canceled, past_due, unpaid, trialing)';
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'ID клиента в Stripe';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'ID подписки в Stripe';

-- 11. Создаем начальные free подписки для существующих пользователей
INSERT INTO public.user_subscriptions (user_id, tier, status, current_period_start, current_period_end)
SELECT 
    id as user_id,
    'free' as tier,
    'active' as status,
    NOW() as current_period_start,
    NOW() + INTERVAL '1 year' as current_period_end
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions);

-- ✅ ГОТОВО! Теперь у нас есть:
-- - subscriptions: для email рассылки (email, is_active, source)
-- - user_subscriptions: для платных подписок пользователей (user_id, tier, status, stripe_*)
