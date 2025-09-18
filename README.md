# 🧠 Personal Productivity AI

> **Умный планировщик задач с ИИ-помощником для максимальной продуктивности**

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/ni-okr/personal-productivity-ai/releases)
[![Tests](https://img.shields.io/badge/tests-321%20passed-green.svg)](https://github.com/ni-okr/personal-productivity-ai/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/ni-okr/personal-productivity-ai/actions)
[![Security](https://img.shields.io/badge/security-audited-green.svg)](https://github.com/ni-okr/personal-productivity-ai/security)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/ni-okr/personal-productivity-ai)
[![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)](https://github.com/ni-okr/personal-productivity-ai)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black.svg)](https://personal-productivity-ai.vercel.app)
[![Discord](https://img.shields.io/badge/chat-discord-blue.svg)](https://discord.gg/personal-productivity-ai)

## 🎯 О проекте

**Personal Productivity AI** - это современное веб-приложение для управления продуктивностью с интегрированным ИИ-помощником. Приложение помогает пользователям эффективно планировать задачи, анализировать продуктивность и получать персонализированные рекомендации.

### ✨ Ключевые возможности

- 🧠 **ИИ-планировщик задач** - умное создание и приоритизация задач
- 📊 **Анализ продуктивности** - детальная статистика и метрики
- 🔔 **Умные уведомления** - персонализированные напоминания
- 📱 **PWA готовность** - установка как нативное приложение
- 🔒 **Безопасность** - полная защита данных пользователей
- 🧪 **100% тестирование** - 321 тест для надежности

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- Supabase аккаунт

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/ni-okr/personal-productivity-ai.git
cd personal-productivity-ai

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Заполните переменные в .env.local

# Запуск в режиме разработки
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🛠️ Технологический стек

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS** - утилитарный CSS
- **Zustand** - управление состоянием

### Backend
- **Supabase** - база данных и аутентификация
- **PostgreSQL** - реляционная база данных
- **Row Level Security** - безопасность данных

### Тестирование
- **Jest** - unit тестирование
- **Playwright** - E2E тестирование
- **Custom Framework** - единый фреймворк тестирования

### Деплой
- **Vercel** - хостинг и CI/CD
- **GitHub Actions** - автоматизация

## 📊 Статистика проекта

- **321 тест** - все проходят ✅
- **17 тестовых файлов** - полное покрытие
- **15 маршрутов** - все протестированы
- **159 kB** - размер First Load JS
- **1.7s** - время выполнения тестов

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Unit тесты
npm run test:unit

# E2E тесты
npm run test:e2e

# Покрытие
npm run test:coverage
```

### Фреймворк тестирования

Проект использует собственный единый фреймворк тестирования:

```typescript
import { testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'

// Настройка теста
testFramework.updateConfig(TEST_CONFIGS.UNIT)
testMocks.setupAllMocks()

// Выполнение теста
testLogger.startTest('Test Name')
// ... тест ...
testLogger.endTest('Test Name', true)
```

## 🚀 Деплой

### Vercel (рекомендуется)

```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

### GitHub Actions

Автоматический деплой настроен через GitHub Actions при мерже в `main`.

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Главная страница
│   ├── planner/           # ИИ планировщик
│   └── api/               # API routes
├── components/            # React компоненты
│   ├── ui/                # UI компоненты
│   └── admin/             # Админ панель
├── lib/                   # Бизнес-логика
│   ├── supabase.ts        # Supabase клиент
│   ├── auth.ts            # Аутентификация
│   └── tasks.ts           # API задач
├── stores/                # Zustand stores
├── types/                 # TypeScript типы
└── utils/                 # Утилиты

tests/
├── unit/                  # Unit тесты
├── integration/           # Integration тесты
├── e2e/                   # E2E тесты
└── framework/             # Фреймворк тестирования
```

## 🔧 Разработка

### Git Flow

Проект использует Trunk-based Development:

- `main` - стабильные релизы
- `develop` - активная разработка
- `release/vX.Y` - релизные ветки
- `feature/*` - функциональные ветки

### Коммиты

Используйте conventional commits:

```bash
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
test: добавить тесты
```

### Code Review

Все изменения проходят через Pull Request с обязательным code review.

## 📈 Roadmap

### v1.3.0 (Q1 2026)
- [ ] Расширенная аналитика
- [ ] Интеграция с календарем
- [ ] Мобильное приложение

### v1.4.0 (Q2 2026)
- [ ] ИИ рекомендации
- [ ] Командная работа
- [ ] API для интеграций

### v2.0.0 (Q3 2026)
- [ ] LifeOS концепция
- [ ] Автоматизация рутины
- [ ] Медицинские интеграции

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'feat: add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- **Issues**: [GitHub Issues](https://github.com/ni-okr/personal-productivity-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ni-okr/personal-productivity-ai/discussions)
- **Email**: support@personal-productivity-ai.com

## 🙏 Благодарности

- [Next.js](https://nextjs.org/) - за отличный фреймворк
- [Supabase](https://supabase.com/) - за backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com/) - за утилитарный CSS
- [Vercel](https://vercel.com/) - за хостинг и деплой

---

**Сделано с ❤️ для повышения продуктивности людей**