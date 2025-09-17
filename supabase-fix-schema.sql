-- 🔧 Исправление схемы Supabase для Personal Productivity AI
-- Этот скрипт работает с существующей структурой

-- 1. Сначала проверим, есть ли таблица users и какая у неё структура
-- Если таблица users уже существует, добавим недостающие колонки

-- Добавляем недостающие колонки в таблицу users (если они не существуют)
DO $$ 
BEGIN
    -- Добавляем колонки, если их нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'timezone') THEN
        ALTER TABLE public.users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Europe/Moscow';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription') THEN
        ALTER TABLE public.users ADD COLUMN subscription VARCHAR(20) DEFAULT 'free' CHECK (subscription IN ('free', 'premium', 'pro', 'enterprise'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'unpaid'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
        ALTER TABLE public.users ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE public.users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Создаем таблицу задач
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'email', 'calendar', 'ai_suggestion')),
  tags TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  ai_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу подписок
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'premium', 'pro', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'unpaid')),
  tinkoff_customer_id VARCHAR(255),
  tinkoff_payment_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем таблицу метрик продуктивности
CREATE TABLE IF NOT EXISTS public.productivity_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood VARCHAR(20) CHECK (mood IN ('excellent', 'good', 'neutral', 'poor', 'terrible')),
  distractions_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 5. Создаем таблицу ИИ предложений
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('break', 'focus', 'prioritization', 'schedule_optimization', 'motivation')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  is_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 6. Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(tier);

CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_id ON public.productivity_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_date ON public.productivity_metrics(date);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON public.ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON public.ai_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_is_read ON public.ai_suggestions(is_read);

-- 7. Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Создаем триггеры для автоматического обновления updated_at
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productivity_metrics_updated_at 
  BEFORE UPDATE ON public.productivity_metrics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Включение Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- 10. Создание RLS политик для tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Создание RLS политик для subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 12. Создание RLS политик для productivity_metrics
DROP POLICY IF EXISTS "Users can view own metrics" ON public.productivity_metrics;
CREATE POLICY "Users can view own metrics" ON public.productivity_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own metrics" ON public.productivity_metrics;
CREATE POLICY "Users can insert own metrics" ON public.productivity_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own metrics" ON public.productivity_metrics;
CREATE POLICY "Users can update own metrics" ON public.productivity_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- 13. Создание RLS политик для ai_suggestions
DROP POLICY IF EXISTS "Users can view own suggestions" ON public.ai_suggestions;
CREATE POLICY "Users can view own suggestions" ON public.ai_suggestions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own suggestions" ON public.ai_suggestions;
CREATE POLICY "Users can insert own suggestions" ON public.ai_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own suggestions" ON public.ai_suggestions;
CREATE POLICY "Users can update own suggestions" ON public.ai_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- 14. Создаем таблицу subscribers для совместимости (если её нет)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(100) DEFAULT 'landing_page',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS для subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert subscribers" ON public.subscribers;
CREATE POLICY "Anyone can insert subscribers" ON public.subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read subscribers" ON public.subscribers;
CREATE POLICY "Authenticated users can read subscribers" ON public.subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Триггер для subscribers
CREATE TRIGGER update_subscribers_updated_at 
  BEFORE UPDATE ON public.subscribers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Индексы для subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON public.subscribers(is_active);

-- 15. Создаем функцию для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Создаем триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Готово! 🎉
