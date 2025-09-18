# 📁 Структура проекта Personal Productivity AI

## 🎯 Корень проекта

```
personal-productivity-ai-clean/
├── 📁 src/                    # Исходный код приложения
├── 📁 tests/                  # Все тесты проекта
├── 📁 docs/                   # Документация
├── 📁 database/               # SQL миграции и скрипты
├── 📁 scripts/                # Полезные скрипты
├── 📁 public/                 # Статические файлы
├── 📁 .temp/                  # Временные файлы (игнорируется Git)
├── 📄 README.md               # Основная документация
├── 📄 package.json            # Зависимости проекта
├── 📄 next.config.js          # Конфигурация Next.js
├── 📄 tailwind.config.js      # Конфигурация Tailwind CSS
├── 📄 tsconfig.json           # Конфигурация TypeScript
├── 📄 jest.config.js          # Конфигурация Jest
├── 📄 playwright.config.ts    # Конфигурация Playwright
└── 📄 .gitignore              # Игнорируемые файлы
```

## 📂 Основные директории

### `src/` - Исходный код
- **`app/`** - Next.js App Router (страницы и API)
- **`components/`** - React компоненты
- **`lib/`** - Бизнес-логика и утилиты
- **`hooks/`** - React хуки
- **`stores/`** - Zustand stores
- **`types/`** - TypeScript типы
- **`utils/`** - Вспомогательные функции

### `tests/` - Тестирование
- **`unit/`** - Unit тесты
- **`integration/`** - Integration тесты
- **`e2e/`** - End-to-end тесты
- **`framework/`** - Единый фреймворк тестирования
- **`__mocks__/`** - Моки для тестов

### `docs/` - Документация
- **`setup-guides/`** - Руководства по настройке
- **`security/`** - Документация по безопасности
- **`scripts/`** - Скрипты для разработки
- **`sql-migrations/`** - SQL миграции (пустая, используется `database/`)

### `database/` - База данных
- SQL скрипты для Supabase
- Миграции схемы
- Настройка RLS политик
- Тестовые данные

### `scripts/` - Полезные скрипты
- Аудит безопасности
- Проверка зависимостей
- Настройка CI/CD
- Утилиты разработки

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск тестов
npm test

# Сборка для продакшена
npm run build
```

## 📋 Конфигурационные файлы

- **`package.json`** - Зависимости и скрипты
- **`next.config.js`** - Настройки Next.js
- **`tailwind.config.js`** - Конфигурация Tailwind CSS
- **`tsconfig.json`** - Настройки TypeScript
- **`jest.config.js`** - Конфигурация Jest
- **`playwright.config.ts`** - Настройки Playwright

## 🔧 Переменные окружения

Скопируйте `env.production.example` в `.env.local` и заполните:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# ... другие переменные
```

## 📚 Документация

- **`README.md`** - Основная документация
- **`docs/`** - Подробная документация
- **`docs/setup-guides/`** - Руководства по настройке
- **`docs/security/`** - Безопасность

## 🧪 Тестирование

Проект использует единый фреймворк тестирования:

```typescript
import { testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'
```

## 🚀 Деплой

- **Vercel** - автоматический деплой из `main` ветки
- **GitHub Actions** - CI/CD пайплайн
- **Supabase** - база данных и аутентификация

---

**Структура проекта оптимизирована для удобства разработки и поддержки! 🎯**
