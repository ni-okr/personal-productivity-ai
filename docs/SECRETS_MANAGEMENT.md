# 🔐 Управление секретами проекта

## 🎯 Обзор

Проект использует **pass** (Password Store) для безопасного хранения и управления секретами. Это обеспечивает:

- ✅ **Безопасность** - все секреты зашифрованы с помощью GPG
- ✅ **Централизованное управление** - все секреты в одном месте
- ✅ **Версионирование** - история изменений секретов
- ✅ **Синхронизация** - возможность синхронизации между устройствами
- ✅ **Интеграция с ОС** - использование встроенных утилит Linux

## 🛠️ Установка и настройка

### 1. Установка pass

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y pass

# macOS
brew install pass

# Arch Linux
sudo pacman -S pass
```

### 2. Инициализация GPG ключа

```bash
# Создать GPG ключ (если еще нет)
gpg --full-generate-key

# Инициализировать pass
pass init "ваше-имя <ваш-email@example.com>"
```

### 3. Настройка проекта

```bash
# Перейти в директорию проекта
cd /path/to/personal-productivity-ai-clean

# Загрузить секреты в текущую сессию
source scripts/load-secrets.sh

# Или использовать npm скрипты
npm run secrets:load
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

## 🚀 Использование

### CLI утилита

```bash
# Показать все секреты
npm run secrets:list

# Проверить статус pass
npm run secrets:check

# Создать .env.local из секретов
npm run secrets:env

# Загрузить секреты в текущую сессию
npm run secrets:load

# Проверить подключение к Supabase
npm run secrets:test

# Показать справку
npm run secrets:help
```

### Программное использование

```typescript
import { getSecret, getAllSecrets, isPassReady } from '@/lib/secrets';

// Получить конкретный секрет
const supabaseUrl = getSecret('personal-productivity-ai/supabase/url');

// Получить все секреты
const secrets = getAllSecrets();

// Проверить готовность pass
if (isPassReady()) {
  console.log('pass готов к работе');
}
```

### Bash скрипты

```bash
# Загрузить секреты в переменные окружения
source scripts/load-secrets.sh

# Запустить dev сервер с секретами
npm run dev:secrets

# Собрать проект с секретами
npm run build:secrets
```

## 🔧 Управление секретами

### Добавление нового секрета

```bash
# Добавить секрет
echo "значение-секрета" | pass insert -m personal-productivity-ai/категория/имя-секрета

# Пример
echo "my-secret-value" | pass insert -m personal-productivity-ai/api/secret-key
```

### Просмотр секрета

```bash
# Показать секрет
pass show personal-productivity-ai/supabase/url

# Скопировать в буфер обмена
pass show -c personal-productivity-ai/supabase/url
```

### Редактирование секрета

```bash
# Редактировать секрет
pass edit personal-productivity-ai/supabase/url
```

### Удаление секрета

```bash
# Удалить секрет
pass rm personal-productivity-ai/supabase/url
```

## 🔄 Синхронизация

### Настройка Git репозитория для pass

```bash
# Инициализировать Git в хранилище pass
cd ~/.password-store
git init
git remote add origin <your-git-repo>
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Синхронизация между устройствами

```bash
# На новом устройстве
git clone <your-git-repo> ~/.password-store
pass init "ваше-имя <ваш-email@example.com>"
```

## 🛡️ Безопасность

### Рекомендации

1. **Регулярно обновляйте GPG ключи**
2. **Используйте сильные пароли для GPG**
3. **Делайте резервные копии хранилища pass**
4. **Не коммитьте .env.local в Git**
5. **Используйте разные ключи для разных проектов**

### Резервное копирование

```bash
# Создать резервную копию
tar -czf pass-backup-$(date +%Y%m%d).tar.gz ~/.password-store

# Восстановить из резервной копии
tar -xzf pass-backup-20241218.tar.gz -C ~/
```

## 🔍 Отладка

### Проверка статуса

```bash
# Проверить установку pass
which pass

# Проверить инициализацию
pass ls

# Проверить GPG ключи
gpg --list-secret-keys
```

### Логи

```bash
# Включить отладку
export DEBUG=1
npm run secrets:check
```

## 📚 Полезные команды

### pass

```bash
# Показать все секреты
pass ls

# Поиск секретов
pass find supabase

# Генерация пароля
pass generate personal-productivity-ai/new-secret 32

# Показать историю изменений
pass git log
```

### GPG

```bash
# Список ключей
gpg --list-keys
gpg --list-secret-keys

# Экспорт ключа
gpg --export-secret-keys > my-key.asc

# Импорт ключа
gpg --import my-key.asc
```

## 🚨 Устранение неполадок

### Проблема: "pass не инициализирован"

```bash
# Решение
pass init "ваше-имя <ваш-email@example.com>"
```

### Проблема: "GPG ключ не найден"

```bash
# Решение
gpg --full-generate-key
pass init "ваше-имя <ваш-email@example.com>"
```

### Проблема: "Секрет не найден"

```bash
# Проверить существование
pass ls personal-productivity-ai

# Добавить секрет
echo "значение" | pass insert -m personal-productivity-ai/категория/имя
```

## 🔗 Полезные ссылки

- [pass - Password Store](https://www.passwordstore.org/)
- [GPG - GNU Privacy Guard](https://gnupg.org/)
- [pass man page](https://git.zx2c4.com/password-store/about/)
- [GPG man page](https://gnupg.org/documentation/manuals/gnupg/)

---

**Помни**: Секреты - это критически важная часть проекта. Всегда используй pass для их управления! 🔐
