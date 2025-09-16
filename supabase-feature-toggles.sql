-- 🎛️ Feature Toggles система для Trunk-based Development
-- Создание таблицы для управления feature toggles

-- Создаем таблицу feature_toggles
CREATE TABLE IF NOT EXISTS feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  type VARCHAR(20) CHECK (type IN ('hot', 'cold')) DEFAULT 'hot',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_feature_toggles_name ON feature_toggles(name);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_type ON feature_toggles(type);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON feature_toggles(enabled);

-- Включаем RLS (Row Level Security)
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
-- Публичный доступ на чтение (для клиентских приложений)
CREATE POLICY "Public read access" ON feature_toggles 
  FOR SELECT USING (true);

-- Только аутентифицированные пользователи могут обновлять hot toggles
CREATE POLICY "Authenticated users can update hot toggles" ON feature_toggles 
  FOR UPDATE USING (auth.role() = 'authenticated' AND type = 'hot');

-- Только service role может создавать и удалять toggles
CREATE POLICY "Service role can manage toggles" ON feature_toggles 
  FOR ALL USING (auth.role() = 'service_role');

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_feature_toggles_updated_at 
  BEFORE UPDATE ON feature_toggles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставляем базовые feature toggles
INSERT INTO feature_toggles (name, enabled, type, description) VALUES
  -- Hot toggles (можно переключать в runtime)
  ('new-ai-features', false, 'hot', 'Новые ИИ функции и возможности'),
  ('advanced-analytics', false, 'hot', 'Продвинутая аналитика и отчеты'),
  ('pwa-features', false, 'hot', 'PWA функции (офлайн, push уведомления)'),
  ('beta-features', false, 'hot', 'Бета функции для тестирования'),
  
  -- Cold toggles (только при сборке)
  ('debug-mode', false, 'cold', 'Режим отладки и логирования'),
  ('experimental-ui', false, 'cold', 'Экспериментальный UI'),
  ('performance-monitoring', false, 'cold', 'Мониторинг производительности'),
  ('security-audit', false, 'cold', 'Аудит безопасности')
ON CONFLICT (name) DO NOTHING;

-- Создаем view для быстрого доступа к активным toggles
CREATE OR REPLACE VIEW active_feature_toggles AS
SELECT 
  name,
  enabled,
  type,
  description
FROM feature_toggles
WHERE enabled = true;

-- Создаем функцию для получения всех toggles в формате JSON
CREATE OR REPLACE FUNCTION get_all_feature_toggles()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_object_agg(name, enabled)
    FROM feature_toggles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для обновления hot toggle
CREATE OR REPLACE FUNCTION update_hot_toggle(toggle_name TEXT, toggle_enabled BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE feature_toggles 
  SET enabled = toggle_enabled, updated_at = NOW()
  WHERE name = toggle_name AND type = 'hot';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для получения toggle статуса
CREATE OR REPLACE FUNCTION get_toggle_status(toggle_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  toggle_enabled BOOLEAN;
BEGIN
  SELECT enabled INTO toggle_enabled
  FROM feature_toggles
  WHERE name = toggle_name;
  
  RETURN COALESCE(toggle_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии для документации
COMMENT ON TABLE feature_toggles IS 'Таблица для управления feature toggles в системе Trunk-based Development';
COMMENT ON COLUMN feature_toggles.name IS 'Уникальное имя toggle (например: new-ai-features)';
COMMENT ON COLUMN feature_toggles.enabled IS 'Включен ли toggle (true/false)';
COMMENT ON COLUMN feature_toggles.type IS 'Тип toggle: hot (runtime) или cold (build-time)';
COMMENT ON COLUMN feature_toggles.description IS 'Описание функциональности toggle';

COMMENT ON FUNCTION get_all_feature_toggles() IS 'Возвращает все toggles в формате JSON';
COMMENT ON FUNCTION update_hot_toggle(TEXT, BOOLEAN) IS 'Обновляет статус hot toggle';
COMMENT ON FUNCTION get_toggle_status(TEXT) IS 'Получает статус конкретного toggle';
