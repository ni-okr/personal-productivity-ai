# 🚨 РУКОВОДСТВО ПО БЕЗОПАСНОМУ ТЕСТИРОВАНИЮ

## ⚠️ КРИТИЧЕСКАЯ ПРОБЛЕМА РЕШЕНА

**Проблема**: Supabase предупредил о высоком уровне возврата писем из-за тестирования с реальными email адресами.

**Решение**: Внедрена система защиты от использования реальных email в режиме разработки.

## 🛡️ ЗАЩИТНЫЕ МЕХАНИЗМЫ

### 1. Автоматическая блокировка реальных email
- **В dev режиме** запрещены email с доменами: @gmail.com, @yahoo.com, @outlook.com, @hotmail.com, @yandex.ru, @mail.ru
- **Разрешены только тестовые** домены: @example.test, @test.local, test@, demo@

### 2. Переменные окружения
```env
# Включить режим разработки
NEXT_PUBLIC_DEV_MODE=true

# Отключить отправку email
NEXT_PUBLIC_DISABLE_EMAIL=true

# Тестовый домен для email
TEST_EMAIL_DOMAIN=@example.test
```

### 3. Проверки в коде
```typescript
// Проверка на реальные email (запрещены в dev режиме)
if (DEV_MODE && isRealEmail(email)) {
    return {
        success: false,
        error: 'В режиме разработки запрещено использовать реальные email адреса. Используйте @example.test'
    }
}
```

## 🧪 БЕЗОПАСНОЕ ТЕСТИРОВАНИЕ

### Разрешенные тестовые email:
- `test@example.test`
- `demo@example.test`
- `user1@test.local`
- `admin@test.local`

### Запрещенные email (в dev режиме):
- `test@gmail.com` ❌
- `user@yahoo.com` ❌
- `demo@outlook.com` ❌

## 🔧 НАСТРОЙКА ТЕСТИРОВАНИЯ

### 1. Локальная разработка
```bash
# Используйте .env.local с защитными настройками
cp test-config.env .env.local

# Перезапустите сервер
npm run dev
```

### 2. Тестирование с Playwright
```typescript
// Используйте только тестовые email
await page.fill('[name="email"]', 'test@example.test')
```

### 3. Unit тесты
```typescript
// Мокайте Supabase для тестов
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => mockSupabase
}))
```

## 📋 ПРОВЕРКИ ПЕРЕД ТЕСТИРОВАНИЕМ

### ✅ Обязательные проверки:
1. **Переменная DEV_MODE=true** в .env.local
2. **Использование только @example.test** доменов
3. **Проверка console.log** на предупреждения
4. **Отсутствие реальных email** в тестах

### ❌ Что НЕ делать:
1. **НЕ использовать** @gmail.com, @yahoo.com и т.д.
2. **НЕ тестировать** с реальными email в dev режиме
3. **НЕ отключать** защитные проверки
4. **НЕ коммитить** .env.local с реальными ключами

## 🚀 ПРОДАКШН ТЕСТИРОВАНИЕ

### Для продакшн тестирования:
1. **Создайте отдельный Supabase проект** для тестирования
2. **Используйте реальные email** только в staging окружении
3. **Настройте лимиты** отправки писем
4. **Мониторьте** метрики доставки

### Настройка staging:
```env
# Staging окружение
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_DISABLE_EMAIL=false
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
```

## 📊 МОНИТОРИНГ

### Ключевые метрики:
- **Bounce rate** - должен быть < 5%
- **Complaint rate** - должен быть < 0.1%
- **Delivery rate** - должен быть > 95%

### Алерты:
- **Высокий bounce rate** - проверить валидацию email
- **Жалобы на спам** - проверить контент писем
- **Блокировка отправки** - немедленно остановить тестирование

## 🔄 ВОССТАНОВЛЕНИЕ ПОСЛЕ БЛОКИРОВКИ

### Если Supabase заблокировал отправку:
1. **Немедленно остановить** все тесты
2. **Проверить** настройки проекта
3. **Очистить** невалидные email из БД
4. **Связаться с поддержкой** Supabase
5. **Настроить** собственный SMTP провайдер

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

### Supabase документация:
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Rate Limiting](https://supabase.com/docs/guides/auth/auth-rate-limits)

### Лучшие практики:
- [Email Validation](https://supabase.com/docs/guides/auth/auth-email-validation)
- [Testing Strategies](https://supabase.com/docs/guides/auth/auth-testing)
- [Production Checklist](https://supabase.com/docs/guides/auth/auth-production)

---

**Помни**: Безопасное тестирование = стабильная работа Supabase = успешный проект! 🚀
