# 🔐 Быстрый старт - Система секретов

## ✅ Что уже настроено

1. **pass** установлен и инициализирован
2. **GPG ключ** создан и настроен
3. **Секреты проекта** сохранены в pass
4. **CLI утилиты** готовы к использованию
5. **npm скрипты** добавлены в package.json

## 🚀 Основные команды

```bash
# Проверить статус системы секретов
npm run secrets:check

# Показать все секреты
npm run secrets:list

# Создать .env.local из секретов
npm run secrets:env

# Загрузить секреты в текущую сессию
npm run secrets:load

# Запустить dev сервер с секретами
npm run dev:secrets

# Собрать проект с секретами
npm run build:secrets
```

## 📋 Структура секретов

```
personal-productivity-ai/
├── supabase/
│   ├── url                    # NEXT_PUBLIC_SUPABASE_URL
│   └── anon-key              # NEXT_PUBLIC_SUPABASE_ANON_KEY
└── tinkoff/
    ├── terminal-key-test     # TINKOFF_TERMINAL_KEY_TEST
    ├── secret-key-test       # TINKOFF_SECRET_KEY_TEST
    ├── terminal-key-live     # TINKOFF_TERMINAL_KEY_LIVE
    └── secret-key-live       # TINKOFF_SECRET_KEY_LIVE
```

## 🔧 Управление секретами

```bash
# Показать секрет
pass show personal-productivity-ai/supabase/url

# Редактировать секрет
pass edit personal-productivity-ai/supabase/url

# Добавить новый секрет
echo "новое-значение" | pass insert -m personal-productivity-ai/категория/имя

# Удалить секрет
pass rm personal-productivity-ai/категория/имя
```

## 🛡️ Безопасность

- ✅ Все секреты зашифрованы с помощью GPG
- ✅ .env.local в .gitignore (не коммитится)
- ✅ Секреты хранятся в ~/.password-store/
- ✅ Возможность синхронизации через Git

## 📚 Документация

Полная документация: `docs/SECRETS_MANAGEMENT.md`

---

**Готово к работе!** 🎉 Теперь все секреты управляются через pass!
