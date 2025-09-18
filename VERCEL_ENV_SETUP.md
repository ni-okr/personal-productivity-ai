# 🔧 Настройка переменных окружения в Vercel

## 📋 Переменные для добавления в Vercel Dashboard

### Supabase (уже настроены)
```
NEXT_PUBLIC_SUPABASE_URL=https://zpgkzvflmgxrlgkecscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2t6dmZsbWd4cmxna2Vjc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDM5MDcsImV4cCI6MjA3MzQxOTkwN30.usDTWCrgyMiGY1BDhy-FBy-YTSOhPNEuAm1lh1FMH5c
```

### Тинькофф - Тестовый терминал (уже настроен)
```
TINKOFF_TERMINAL_KEY_TEST=1758100754320DEMO
TINKOFF_SECRET_KEY_TEST=wUNkNxah_zQPq_$z
```

### Тинькофф - Рабочий терминал (НУЖНО ДОБАВИТЬ)
```
TINKOFF_TERMINAL_KEY_LIVE=1758100754359
TINKOFF_SECRET_KEY_LIVE=dFRGEo_QmYIVa%qC
```

### Тинькофф - По умолчанию (тестовый)
```
TINKOFF_TERMINAL_KEY=1758100754320DEMO
TINKOFF_SECRET_KEY=wUNkNxah_zQPq_$z
```

## 🚀 Инструкции по добавлению в Vercel

1. **Перейти в Vercel Dashboard**
   - Открыть проект `personal-productivity-ai`
   - Перейти в раздел "Settings" → "Environment Variables"

2. **Добавить новые переменные**
   - `TINKOFF_TERMINAL_KEY_LIVE` = `1758100754359`
   - `TINKOFF_SECRET_KEY_LIVE` = `dFRGEo_QmYIVa%qC`

3. **Проверить существующие**
   - Убедиться, что все переменные Supabase настроены
   - Убедиться, что тестовые ключи Тинькофф настроены

4. **Перезапустить деплой**
   - После добавления переменных перезапустить деплой
   - Проверить, что переменные загружаются корректно

## 🔍 Проверка настройки

### В коде можно проверить:
```typescript
console.log('Тестовый терминал:', process.env.TINKOFF_TERMINAL_KEY_TEST)
console.log('Рабочий терминал:', process.env.TINKOFF_TERMINAL_KEY_LIVE)
```

### В Vercel можно проверить:
- В разделе "Functions" → "View Function Logs"
- Искать логи с переменными окружения

## ⚠️ Важные замечания

1. **Безопасность**: Никогда не коммитить секретные ключи в Git
2. **Тестирование**: Сначала тестировать на тестовом терминале
3. **Продакшн**: Рабочий терминал включается только после успешного тестирования
4. **Мониторинг**: Следить за логами платежей в Vercel

## 🎯 Результат

После настройки у нас будет:
- **Тестовая оплата** → использует `TINKOFF_TERMINAL_KEY_TEST`
- **Живая оплата** → использует `TINKOFF_TERMINAL_KEY_LIVE`
- **Две отдельные формы** для каждого типа оплаты
- **Полная интеграция** с реальным API Тинькофф