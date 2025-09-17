-- Проверка существующих таблиц в Supabase
-- Выполните этот скрипт сначала, чтобы понять структуру

-- Проверяем существующие таблицы
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Проверяем структуру таблицы users (если она есть)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Проверяем существующие RLS политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
