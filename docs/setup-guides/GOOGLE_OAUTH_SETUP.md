# 🔐 Настройка Google OAuth в Supabase

## 📋 Шаги настройки

### 1. Создание Google OAuth приложения

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google+ API" и включите его
4. Создайте OAuth 2.0 credentials:
   - Перейдите в "APIs & Services" > "Credentials"
   - Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
   - Выберите "Web application"
   - Добавьте авторизованные URI перенаправления:
     - `https://zpgkzvflmgxrlgkecscg.supabase.co/auth/v1/callback`
     - `https://personal-productivity-ai.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (для разработки)

### 2. Настройка в Supabase

1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект `personal-productivity-ai`
3. Перейдите в "Authentication" > "Providers"
4. Найдите "Google" и включите его
5. Введите данные из Google Cloud Console:
   - **Client ID**: из Google Cloud Console
   - **Client Secret**: из Google Cloud Console
6. Сохраните настройки

### 3. Обновление переменных окружения

Добавьте в `.env.local`:

```env
# Google OAuth (опционально, если нужны дополнительные настройки)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Тестирование

1. Запустите приложение: `npm run dev`
2. Перейдите на главную страницу
3. Нажмите "Войти в аккаунт"
4. Нажмите "Войти через Google"
5. Должно произойти перенаправление на Google OAuth

## 🔧 Текущий статус

- ✅ Supabase клиент настроен
- ✅ Callback страница создана
- ✅ Функция `signInWithGoogle` исправлена
- ⏳ Требуется настройка Google OAuth в Supabase Dashboard

## 🚨 Важно

- В режиме разработки (`NEXT_PUBLIC_DISABLE_EMAIL=true`) Google OAuth работает в mock режиме
- Для продакшна нужно отключить `NEXT_PUBLIC_DISABLE_EMAIL` или установить в `false`
- Убедитесь, что все URI перенаправления добавлены в Google Cloud Console
