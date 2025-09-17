# 🎯 Personal Productivity AI - Контекст для ИИ ассистента

## 📋 Быстрый доступ к ключевым файлам

### 🏗️ Архитектура
- `src/app/layout.tsx` - Корневой layout приложения
- `src/app/page.tsx` - Главная страница (лендинг)
- `src/app/planner/page.tsx` - ИИ планировщик задач
- `src/stores/useAppStore.ts` - Глобальное состояние Zustand

### 🔐 Авторизация и безопасность
- `src/lib/auth.ts` - Система авторизации Supabase
- `src/lib/supabase.ts` - Клиент базы данных
- `supabase-setup.sql` - SQL скрипт настройки БД

### 🧠 ИИ и бизнес-логика
- `src/lib/aiModels.ts` - ИИ модели и интеграции
- `src/lib/smartPlanning.ts` - Алгоритмы планирования
- `src/utils/validation.ts` - Валидация данных

### 🎨 UI компоненты
- `src/components/ui/Button.tsx` - Переиспользуемая кнопка
- `src/components/ErrorBoundary.tsx` - Обработка ошибок React
- `src/utils/cn.ts` - Утилита для Tailwind классов

### 🧪 Тестирование
- `tests/unit/` - Unit тесты
- `tests/integration/` - Integration тесты  
- `tests/e2e/` - E2E тесты с Allure
- `tests/config/` - Конфигурации тестов

### 📚 Документация
- `README.md` - Главная документация
- `docs/ARCHITECTURE.md` - Техническая архитектура
- `docs/DEVELOPMENT.md` - Руководство разработчика
- `docs/STRATEGY.md` - Бизнес стратегия

## 🎯 Текущие приоритеты

### 🔥 Критический приоритет
1. **Интеграция авторизации с UI** - создать компоненты входа/регистрации
2. **Сохранение задач в Supabase** - интегрировать планировщик с БД
3. **Unit тесты для критических модулей** - auth.ts, validation.ts, useAppStore.ts

### 📈 Высокий приоритет  
4. **Подключение OpenAI API** - заменить mock на реальный ИИ
5. **Система подписок Тинькофф** - монетизация MVP
6. **Расширение E2E тестов** - полный пользовательский flow

## 🚀 Команды для разработки

```bash
# Разработка
npm run dev              # Запуск dev сервера
npm run build           # Сборка для продакшена

# Тестирование
npm run test:unit       # Unit тесты
npm run test:integration # Integration тесты
npm run test:e2e        # E2E тесты
npm run test:all        # Все тесты
npm run allure:serve    # Allure отчеты

# Качество кода
npx tsc --noEmit        # Проверка TypeScript
npm run lint            # ESLint (если настроен)
```

## 🎨 Стандарты кодирования

### TypeScript
- Строгая типизация везде
- Явные типы возвращаемых значений
- Обработка всех error случаев

### React
- Функциональные компоненты
- Hooks для состояния
- Error Boundaries для надежности

### Стилизация
- Tailwind CSS классы
- Responsive дизайн (mobile-first)
- Семантические цвета (indigo, green, red)

### Тестирование
- TDD подход где возможно
- Comprehensive покрытие критических путей
- Allure отчеты для детального анализа

## 🔍 Как использовать @-symbols в Cursor

### Что такое @-symbols?
@-symbols позволяют быстро добавлять контекст файлов в чат с ИИ. Просто напишите `@` и начните вводить имя файла - Cursor покажет автодополнение.

### Основные @-symbols для нашего проекта:

#### 🏠 Главные страницы
- `@src/app/page.tsx` - Лендинг с подпиской
- `@src/app/planner/page.tsx` - ИИ планировщик
- `@src/app/roadmap/page.tsx` - Роадмап проекта

#### 🔧 Бэкенд и API
- `@src/lib/supabase.ts` - База данных
- `@src/lib/auth.ts` - Авторизация
- `@src/app/api/subscribe/route.ts` - API подписки

#### 🎨 UI и компоненты
- `@src/components/ui/Button.tsx` - Кнопки
- `@src/components/ErrorBoundary.tsx` - Обработка ошибок
- `@src/stores/useAppStore.ts` - Состояние приложения

#### 📚 Документация
- `@README.md` - Общая информация
- `@docs/ARCHITECTURE.md` - Техническая архитектура
- `@docs/DEVELOPMENT.md` - Руководство разработчика
- `@docs/STRATEGY.md` - Бизнес стратегия

#### 🧪 Тестирование
- `@tests/e2e/landing-page.spec.ts` - E2E тесты лендинга
- `@tests/integration/supabase-api.test.ts` - API тесты
- `@jest.config.js` - Конфигурация тестов

#### ⚙️ Конфигурация
- `@.cursor/rules` - Правила для ИИ
- `@.cursor/mcp.json` - MCP серверы
- `@package.json` - Зависимости проекта
- `@next.config.js` - Настройки Next.js

### 💡 Примеры использования:

```
# Работа с лендингом
@src/app/page.tsx исправь кнопку подписки

# Работа с API
@src/lib/supabase.ts @src/app/api/subscribe/route.ts проверь подписку

# Добавление тестов
@tests/e2e/landing-page.spec.ts добавь тест для новой функции

# Обновление документации
@docs/ARCHITECTURE.md @src/lib/aiModels.ts обнови архитектуру ИИ

# Работа с несколькими файлами
@src/app/planner/page.tsx @src/lib/smartPlanning.ts @src/stores/useAppStore.ts улучши планировщик
```

### 🎯 Быстрые команды для частых задач:

- **Фикс багов**: `@src/app/page.tsx @src/lib/supabase.ts`
- **Новые фичи**: `@src/app/planner/page.tsx @src/stores/useAppStore.ts`
- **Тесты**: `@tests/ @jest.config.js`
- **Документация**: `@docs/ @README.md`
- **Конфигурация**: `@.cursor/ @package.json`
