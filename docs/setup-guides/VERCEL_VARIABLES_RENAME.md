# 🔄 Переименование переменных окружения в Vercel

## 📋 План действий

### 1. Удалить старые переменные:
- `TINKOFF_TERMINAL_KEY` (содержит тестовый ключ)
- `TINKOFF_SECRET_KEY` (содержит тестовый ключ)

### 2. Добавить новые переменные:
- `TINKOFF_TERMINAL_KEY_TEST` = `1758100754320DEMO`
- `TINKOFF_SECRET_KEY_TEST` = `wUNkNxah_zQPq_$z`

### 3. Оставить существующие:
- `TINKOFF_TERMINAL_KEY_LIVE` = `1758100754359` ✅
- `TINKOFF_SECRET_KEY_LIVE` = `dFRGEo_QmYIVa%qC` ✅

## 🎯 Результат

После переименования:
- **Тестовая оплата** → использует `TINKOFF_TERMINAL_KEY_TEST`
- **Живая оплата** → использует `TINKOFF_TERMINAL_KEY_LIVE`
- **Правильное разделение** тестового и рабочего окружения

## ⚠️ Важно

1. **Сначала добавить** новые переменные
2. **Потом удалить** старые переменные
3. **Перезапустить деплой** после изменений
4. **Протестировать** обе формы оплаты

## 🧪 Проверка

После изменений проверить:
```bash
curl https://www.taskai.space/api/debug-env
```

Должны быть видны:
- `TINKOFF_TERMINAL_KEY_TEST: SET`
- `TINKOFF_SECRET_KEY_TEST: SET`
- `TINKOFF_TERMINAL_KEY_LIVE: SET`
- `TINKOFF_SECRET_KEY_LIVE: SET`