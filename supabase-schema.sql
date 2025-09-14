-- Создание таблицы для подписчиков
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(100) DEFAULT 'landing_page',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Включение Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (только для аутентифицированных пользователей)
CREATE POLICY "Authenticated users can read subscriptions" ON subscriptions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Политика для вставки (разрешить всем для подписки)
CREATE POLICY "Anyone can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Политика для обновления (только для аутентифицированных пользователей)
CREATE POLICY "Authenticated users can update subscriptions" ON subscriptions
  FOR UPDATE USING (auth.role() = 'authenticated');
