-- Исправление таблицы subscriptions для email рассылки
-- Удаляем старую таблицу и создаем правильную

-- 1. Удаляем старую таблицу subscriptions
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- 2. Создаем новую таблицу subscriptions для email рассылки
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(100) DEFAULT 'landing_page',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем индексы
CREATE INDEX idx_subscriptions_email ON public.subscriptions(email);
CREATE INDEX idx_subscriptions_is_active ON public.subscriptions(is_active);
CREATE INDEX idx_subscriptions_created_at ON public.subscriptions(created_at);

-- 4. Включаем RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Создаем политики RLS
CREATE POLICY "Anyone can insert subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select subscriptions" ON public.subscriptions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update subscriptions" ON public.subscriptions
    FOR UPDATE USING (true);

-- 6. Создаем триггер для updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
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

-- 7. Добавляем комментарии
COMMENT ON TABLE public.subscriptions IS 'Email подписчики для рассылки';
COMMENT ON COLUMN public.subscriptions.email IS 'Email адрес подписчика';
COMMENT ON COLUMN public.subscriptions.source IS 'Источник подписки (landing_page, api, etc.)';
COMMENT ON COLUMN public.subscriptions.is_active IS 'Активна ли подписка';
COMMENT ON COLUMN public.subscriptions.subscribed_at IS 'Дата подписки';
