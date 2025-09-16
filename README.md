# 🧠 Personal Productivity AI

**От простого планировщика к революционной LifeOS - системе автоматизации жизни**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://personal-productivity-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green?style=flat&logo=supabase)](https://supabase.com)

## 🎯 Миссия проекта

Personal Productivity AI - это эволюционный подход к созданию персонального ИИ-ассистента:

1. **MVP (Q4 2025)**: Стабильный планировщик задач с базовым ИИ
2. **Псевдо-ИИ (Q1 2026)**: Умные алгоритмы без LLM
3. **Реальный ИИ (Q2-Q3 2026)**: Интеграция с OpenAI, Claude, Gemini
4. **LifeOS (Q4 2026+)**: Полная автоматизация жизни

## ✨ Текущие возможности MVP

### 🔐 Система авторизации
- Регистрация и вход через Supabase Auth
- Безопасность через Row Level Security (RLS)
- Профили пользователей с подписками

### 📋 Умный планировщик задач
- Создание, редактирование, удаление задач
- Приоритизация (низкий, средний, высокий, срочный)
- Умная сортировка по дедлайнам и важности
- Отслеживание времени выполнения

### 🧠 ИИ возможности (Mock)
- Анализ продуктивности
- Персонализированные рекомендации
- Готовность к подключению реальных LLM

### 📱 PWA готовность
- Установка как нативное приложение
- Мобильная адаптация
- Офлайн поддержка (планируется)

## 🌳 Git Flow стратегия

**С 15.09.2025** мы используем Git Flow с веткой стабилизации:

- `main` - **продакшн релизы** (только стабильные версии)
- `stabilization` - **ветка стабилизации** (тестирование и багфиксы)
- `develop` - **активная разработка** (новые функции)
- `feature/*` - **функциональные ветки** (отдельные задачи)

**Процесс релиза:**
1. **Разработка** → `feature/*` → `develop`
2. **Стабилизация** → `develop` → `stabilization` 
3. **Релиз** → `stabilization` → `main` (через PR + Bugbot)

📚 [Подробная документация по стратегии релизов](docs/RELEASE_STRATEGY.md)

## 🚀 Быстрый старт

### Для пользователей
1. Откройте [personal-productivity-ai.vercel.app](https://personal-productivity-ai.vercel.app)
2. Зарегистрируйтесь или подпишитесь на уведомления
3. Перейдите в планировщик задач
4. Начните планировать свой день!

### Для разработчиков

```bash
# Клонирование репозитория
git clone https://github.com/ni-okr/personal-productivity-ai.git
cd personal-productivity-ai-clean

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Заполните переменные Supabase (см. SUPABASE_SETUP.md)

# Запуск в режиме разработки
npm run dev

# Запуск тестов
npm run test:all

# Сборка для продакшена
npm run build
```

## 🏗️ Архитектура системы

### Технологический стек
- **Frontend**: Next.js 14, React 18, TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel
- **Testing**: Jest + Playwright + Allure Reports
- **AI Integration**: OpenAI API (планируется)

### Структура проекта
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Лендинг с подпиской
│   ├── planner/           # ИИ планировщик задач
│   ├── roadmap/           # Дорожная карта проекта
│   └── api/               # API endpoints
├── components/            # React компоненты
│   ├── ui/                # UI компоненты (Button, etc.)
│   ├── ErrorBoundary.tsx  # Обработка ошибок
│   └── MobileOptimized.tsx
├── lib/                   # Бизнес-логика
│   ├── supabase.ts        # Клиент базы данных
│   ├── auth.ts            # Система авторизации
│   ├── smartPlanning.ts   # Алгоритмы планирования
│   └── aiModels.ts        # ИИ интеграции
├── stores/                # Zustand stores
├── types/                 # TypeScript типы
├── utils/                 # Утилиты и валидация
└── services/              # Внешние сервисы
```

## 💰 Монетизация

### Тарифные планы

#### 🆓 FREE
- Базовый планировщик задач
- До 50 задач
- Псевдо-ИИ рекомендации
- Мобильное приложение

#### 💎 PREMIUM ($9.99/мес)
- OpenAI GPT-4o Mini интеграция
- До 500 задач
- Расширенная аналитика
- Приоритетная поддержка

#### 🚀 PRO ($19.99/мес)
- Все ИИ модели (Claude, Gemini, GPT-4)
- Неограниченные задачи
- API доступ
- Кастомные интеграции

#### 🏢 ENTERPRISE ($49.99/мес)
- Командные функции
- Белый лейбл
- Персональная поддержка
- SLA гарантии

## 📊 Текущий статус

### ✅ Готово
- [x] Базовая архитектура Next.js + TypeScript
- [x] Система авторизации с Supabase
- [x] Планировщик задач с умной сортировкой
- [x] База данных с RLS политиками
- [x] PWA манифест и мобильная адаптация
- [x] Система тестирования (Unit + E2E + Allure)
- [x] Error Boundaries и валидация форм
- [x] Деплой на Vercel

### 🚧 В разработке
- [x] Компоненты входа/регистрации
- [x] Сохранение задач в Supabase
- [x] Интеграция с OpenAI API
- [x] Система подписок (Stripe)

### ⏳ Планируется
- [ ] Email парсинг для создания задач
- [ ] Календарные интеграции
- [ ] Push уведомления
- [ ] Аналитика продуктивности
- [ ] Мобильное приложение (React Native)

## 🧪 Тестирование

### Запуск тестов
```bash
# Все тесты
npm run test:all

# Unit тесты
npm run test:unit

# E2E тесты с Allure отчетами
npm run test:e2e:allure

# Просмотр Allure отчетов
npm run allure:serve
```

### Покрытие тестами
- ✅ Unit тесты для компонентов и утилит
- ✅ Integration тесты для Supabase API
- ✅ E2E тесты для критических сценариев
- ✅ Allure отчеты для детального анализа

## 🛡️ Безопасность

- **Row Level Security (RLS)** для всех таблиц
- **Валидация данных** на клиенте и сервере
- **Error Boundaries** для graceful обработки ошибок
- **TypeScript** для предотвращения ошибок типизации
- **Environment variables** не попадают в Git

## 📚 Документация

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Настройка базы данных
- **[docs/auth-system.md](./docs/auth-system.md)** - Система авторизации
- **[docs/tasks-integration.md](./docs/tasks-integration.md)** - Интеграция задач с Supabase
- **[docs/subscription-system.md](./docs/subscription-system.md)** - Система подписок и монетизации
- **[.cursor/rules](./.cursor/rules)** - Контекст проекта для ИИ
- **[tests/docs/](./tests/docs/)** - Документация по тестированию

## 🎯 Дорожная карта

### Q4 2025 - MVP Стабилизация
- [x] Базовый планировщик
- [x] Система авторизации
- [x] Интеграция компонентов
- [x] Сохранение задач в Supabase
- [x] Первый реальный ИИ API
- [x] Монетизация (Stripe)
- [ ] Публичный запуск

### Q1 2026 - Псевдо-ИИ
- [ ] Умные алгоритмы планирования
- [ ] Анализ паттернов продуктивности
- [ ] Автоматические рекомендации
- [ ] Интеграция с календарем

### Q2-Q3 2026 - Реальный ИИ
- [ ] Multiple LLM интеграции
- [ ] Контекстуальные рекомендации
- [ ] Обработка естественного языка
- [ ] Персонализация на основе истории

### Q4 2026+ - LifeOS
- [ ] Email парсинг и автоматизация
- [ ] Медицинские данные и рекомендации
- [ ] Планирование питания и покупок
- [ ] Интеграции с доставкой
- [ ] Полная автоматизация рутины

## 🤝 Участие в проекте

### Как помочь
- 🐛 **Баг репорты** - создавайте Issues
- 💡 **Идеи** - предлагайте новые функции
- 🔧 **Pull Requests** - улучшайте код
- 📝 **Документация** - помогайте с описаниями
- 🧪 **Тестирование** - находите проблемы

### Правила разработки
- TypeScript везде
- Функциональный стиль программирования
- Mobile-first дизайн
- Comprehensive тестирование
- Подробные коммит сообщения

## 📞 Контакты

- **Демо**: [personal-productivity-ai.vercel.app](https://personal-productivity-ai.vercel.app)
- **GitHub**: [ni-okr/personal-productivity-ai](https://github.com/ni-okr/personal-productivity-ai)
- **Issues**: [GitHub Issues](https://github.com/ni-okr/personal-productivity-ai/issues)

---

## 🌟 Философия проекта

> **"От простого MVP к революционной LifeOS"**
> 
> Мы создаем не просто приложение для задач, а платформу для улучшения качества жизни через умное планирование и автоматизацию рутины. Каждая итерация приближает нас к видению полностью автоматизированной системы управления жизнью.

**Превратите свой хаос в систему уже сегодня! 🚀**