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
5. **Система подписок Stripe** - монетизация MVP
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

## 🔍 Полезные @-symbols для контекста

- `@README.md` - Общая информация о проекте
- `@docs/ARCHITECTURE.md` - Техническая архитектура
- `@src/lib/auth.ts` - Система авторизации
- `@src/stores/useAppStore.ts` - Глобальное состояние
- `@tests/` - Все тесты проекта
- `@.cursor/rules` - Правила для ИИ ассистента
