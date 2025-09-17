-- 🧪 Тестовые запросы для проверки работы схемы
-- Выполните эти запросы после основного скрипта

-- 1. Проверяем, что все таблицы созданы
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'tasks', 'subscriptions', 'productivity_metrics', 'ai_suggestions', 'subscribers')
ORDER BY table_name;

-- 2. Проверяем структуру таблицы tasks
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Проверяем RLS политики
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('tasks', 'subscriptions', 'productivity_metrics', 'ai_suggestions')
ORDER BY tablename, policyname;

-- 4. Проверяем индексы
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('tasks', 'subscriptions', 'productivity_metrics', 'ai_suggestions')
ORDER BY tablename, indexname;

-- 5. Тестовый запрос (должен работать без ошибок)
SELECT 
    'Schema is ready!' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'tasks', 'subscriptions', 'productivity_metrics', 'ai_suggestions', 'subscribers');
