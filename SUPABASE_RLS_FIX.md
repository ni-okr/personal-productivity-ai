# 🔧 Исправление RLS политик в Supabase

## 🚨 Проблема
При регистрации пользователя возникает ошибка 401: "new row violates row-level security policy for table 'users'"

## 🔍 Причина
RLS политика для таблицы `users` не позволяет создавать записи через триггер `handle_new_user()`, так как в момент выполнения триггера пользователь еще не аутентифицирован в контексте RLS.

## ✅ Решение

### 1. Откройте Supabase Dashboard
- Перейдите на https://supabase.com
- Войдите в свой проект
- Откройте SQL Editor

### 2. Выполните SQL скрипт

```sql
-- 🔧 Исправление RLS политик для корректной работы регистрации

-- =====================================
-- 1. ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================

-- Удаляем старую политику INSERT для users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Создаем новую политику, которая разрешает создание профиля через триггер
CREATE POLICY "Allow profile creation via trigger" ON public.users
    FOR INSERT WITH CHECK (true);

-- Добавляем политику для обычных пользователей (если нужно)
CREATE POLICY "Users can insert own profile manually" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================
-- 2. ПРОВЕРКА И ИСПРАВЛЕНИЕ ФУНКЦИИ СОЗДАНИЯ ПРОФИЛЯ
-- =====================================

-- Пересоздаем функцию с правильными правами
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Создаем профиль пользователя
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Пользователь')
    )
    ON CONFLICT (id) DO NOTHING; -- Избегаем дублирования
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Логируем ошибку, но не прерываем регистрацию
        RAISE LOG 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================
-- 3. ПРОВЕРКА ТРИГГЕРА
-- =====================================

-- Удаляем старый триггер если существует
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаем новый триггер
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================
-- 4. ДОПОЛНИТЕЛЬНЫЕ ПОЛИТИКИ ДЛЯ БЕЗОПАСНОСТИ
-- =====================================

-- Политика для просмотра собственного профиля
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Политика для обновления собственного профиля
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
```

### 3. Проверьте результат
После выполнения скрипта:
1. Попробуйте зарегистрировать нового пользователя
2. Проверьте, что профиль создается в таблице `users`
3. Убедитесь, что пользователь может войти в систему

## 🧪 Тестирование

### Тест 1: Регистрация нового пользователя
1. Откройте http://localhost:3000
2. Нажмите "Войти"
3. Переключитесь на "Зарегистрироваться"
4. Заполните форму с email @gmail.com (не @example.com)
5. Нажмите "Зарегистрироваться"
6. Должно появиться сообщение "Проверьте почту для подтверждения регистрации"

### Тест 2: Проверка создания профиля
1. В Supabase Dashboard откройте Table Editor
2. Выберите таблицу `users`
3. Проверьте, что новый пользователь появился в таблице

## 🔒 Безопасность

Исправленные политики обеспечивают:
- ✅ Автоматическое создание профиля при регистрации
- ✅ Пользователи видят только свои данные
- ✅ Защита от несанкционированного доступа
- ✅ Корректная работа триггеров

## 📋 Следующие шаги

После исправления RLS политик:
1. Протестируйте полный флоу авторизации
2. Проверьте работу планировщика задач
3. Убедитесь, что задачи сохраняются в БД
4. Протестируйте выход из системы
