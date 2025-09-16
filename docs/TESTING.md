# 🧪 Руководство по тестированию

## 📋 Обзор

Этот документ описывает стратегию тестирования проекта Personal Productivity AI, включая unit тесты, интеграционные тесты, E2E тесты и mock режим для безопасного тестирования.

## 🎯 Стратегия тестирования

### Уровни тестирования

1. **Unit тесты** - тестирование отдельных функций и компонентов
2. **Интеграционные тесты** - тестирование взаимодействия между модулями
3. **E2E тесты** - тестирование полного пользовательского сценария
4. **Mock тесты** - тестирование с изолированными данными

### Mock режим

Для безопасного тестирования без реальных запросов к Supabase используется mock режим:

- **Авторизация**: Mock функции для регистрации, входа и выхода
- **Задачи**: Mock данные и функции для CRUD операций
- **Подписки**: Mock данные для планов и статуса подписок
- **ИИ рекомендации**: Mock данные для демонстрации функциональности

## 🚀 Запуск тестов

### Все тесты
```bash
# Запуск всех тестов
npm run test:all

# Запуск с покрытием кода
npm run test:coverage
```

### Unit тесты
```bash
# Все unit тесты
npm run test:unit

# Только mock тесты
npm run test:mock

# Unit тесты с покрытием
npm run test:unit:ci
```

### Интеграционные тесты
```bash
# Все интеграционные тесты
npm run test:integration

# Только mock интеграционные тесты
npm run test:integration:mock

# Интеграционные тесты для CI
npm run test:integration:ci
```

### E2E тесты
```bash
# Все E2E тесты
npm run test:e2e

# Только mock E2E тесты
npm run test:e2e:mock

# E2E тесты с UI
npm run test:e2e:ui

# E2E тесты в режиме отладки
npm run test:e2e:debug

# E2E тесты с видимым браузером
npm run test:e2e:headed
```

### CI/CD тесты
```bash
# Полный набор тестов для CI
npm run test:ci

# Mock тесты для CI
npm run test:mock:ci
npm run test:integration:mock:ci
npm run test:e2e:mock:ci
```

## 📁 Структура тестов

```
tests/
├── unit/                    # Unit тесты
│   ├── auth.test.ts        # Тесты авторизации
│   ├── auth-mock.test.ts   # Тесты mock авторизации
│   ├── tasks.test.ts       # Тесты задач
│   ├── tasks-mock.test.ts  # Тесты mock задач
│   ├── subscription-mock.test.ts # Тесты mock подписок
│   └── ...
├── integration/            # Интеграционные тесты
│   ├── mock-mode.test.ts   # Тесты mock режима
│   └── ...
├── e2e/                    # E2E тесты
│   ├── mock-mode.spec.ts   # E2E тесты mock режима
│   └── ...
├── setup.ts               # Настройка Jest
├── setup-env.js           # Переменные окружения
└── ...
```

## 🧪 Mock режим

### Активация mock режима

Mock режим активируется через переменные окружения:

```env
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DISABLE_EMAIL=true
TEST_EMAIL_DOMAIN=@example.test
```

### Mock функции

#### Авторизация
- `mockSignUpWithState()` - регистрация с состоянием
- `mockSignInWithState()` - вход с состоянием
- `mockSignOutWithState()` - выход с состоянием
- `mockGetCurrentUser()` - получение текущего пользователя
- `mockOnAuthStateChange()` - подписка на изменения авторизации

#### Задачи
- `mockGetTasks()` - получение задач
- `mockCreateTask()` - создание задачи
- `mockUpdateTask()` - обновление задачи
- `mockDeleteTask()` - удаление задачи
- `mockCompleteTask()` - завершение задачи
- `mockGetTasksStats()` - статистика задач
- `mockGetProductivityMetrics()` - метрики продуктивности
- `mockGetAISuggestions()` - рекомендации ИИ

#### Подписки
- `mockGetSubscription()` - получение подписки
- `mockCreateSubscription()` - создание подписки
- `mockUpdateSubscription()` - обновление подписки
- `mockCancelSubscription()` - отмена подписки
- `mockGetSubscriptionPlans()` - планы подписок
- `mockGetSubscriptionStatus()` - статус подписки

### Mock данные

#### Пользователи
```typescript
{
  id: 'mock-user-1',
  email: 'test@example.test',
  name: 'Test User',
  subscription: 'free',
  preferences: { ... }
}
```

#### Задачи
```typescript
{
  id: 'mock-task-1',
  title: 'Test Task',
  description: 'Test Description',
  priority: 'high',
  status: 'todo',
  estimatedMinutes: 30,
  userId: 'mock-user-1'
}
```

#### Подписки
```typescript
{
  id: 'mock-sub-1',
  userId: 'mock-user-1',
  tier: 'free',
  status: 'active',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date()
}
```

## 🔧 Настройка тестов

### Jest конфигурация

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/tests/unit/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/tests/integration/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
  ]
}
```

### Playwright конфигурация

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run build && npm start',
    url: 'http://localhost:3000'
  }
})
```

## 📊 Покрытие кода

### Генерация отчета
```bash
npm run test:coverage
```

### Просмотр отчета
Отчет доступен в папке `coverage/`:
- `coverage/lcov-report/index.html` - HTML отчет
- `coverage/lcov.info` - LCOV формат для CI

### Минимальные требования
- **Branches**: 10%
- **Functions**: 10%
- **Lines**: 10%
- **Statements**: 10%

## 🎭 E2E тестирование

### Подготовка
1. Убедитесь, что приложение запущено: `npm run dev`
2. Установите браузеры: `npx playwright install`

### Запуск тестов
```bash
# Все E2E тесты
npm run test:e2e

# Конкретный тест
npx playwright test tests/e2e/mock-mode.spec.ts

# С UI
npm run test:e2e:ui

# В режиме отладки
npm run test:e2e:debug
```

### Отчеты
- **HTML отчет**: `playwright-report/index.html`
- **Allure отчет**: `allure-report/index.html`

## 🔒 Безопасность тестирования

### Защита от реальных запросов

1. **Email защита**: Mock режим предотвращает отправку реальных email
2. **Supabase защита**: Все запросы к БД заменены на mock функции
3. **API защита**: Внешние API не вызываются в тестах

### Переменные окружения для тестов

```env
# .env.test
NODE_ENV=test
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DISABLE_EMAIL=true
TEST_EMAIL_DOMAIN=@example.test
```

## 🚨 Устранение неполадок

### Частые проблемы

1. **Тесты не запускаются**
   - Проверьте установку зависимостей: `npm install`
   - Проверьте конфигурацию Jest: `npx jest --showConfig`

2. **Mock функции не работают**
   - Убедитесь, что `NEXT_PUBLIC_DISABLE_EMAIL=true`
   - Проверьте импорты mock функций

3. **E2E тесты падают**
   - Убедитесь, что приложение запущено
   - Проверьте доступность `http://localhost:3000`

4. **Покрытие кода не генерируется**
   - Запустите тесты с флагом `--coverage`
   - Проверьте настройки в `jest.config.js`

### Отладка

```bash
# Подробный вывод Jest
npx jest --verbose

# Отладка конкретного теста
npx jest --testNamePattern="should create task"

# Отладка E2E теста
npx playwright test --debug tests/e2e/mock-mode.spec.ts
```

## 📈 Метрики качества

### Автоматические проверки

1. **Линтинг**: ESLint проверки кода
2. **Типизация**: TypeScript проверки
3. **Безопасность**: npm audit проверки
4. **Производительность**: Lighthouse CI

### Ручные проверки

1. **Код-ревью**: Проверка PR
2. **Тестирование**: Ручное тестирование функций
3. **Документация**: Обновление документации

## 🔄 CI/CD интеграция

### GitHub Actions

Тесты автоматически запускаются при:
- Push в `main` или `develop`
- Создании Pull Request
- Ручном запуске workflow

### Этапы CI

1. **Build тест** - проверка сборки
2. **Unit тесты** - unit тесты с покрытием
3. **Интеграционные тесты** - интеграционные тесты
4. **E2E тесты** - end-to-end тесты
5. **Аудит безопасности** - проверка уязвимостей
6. **Линтинг** - проверка качества кода

### Артефакты

- **Покрытие кода**: `coverage/lcov.info`
- **E2E отчеты**: `playwright-report/`
- **Allure отчеты**: `allure-results/`

## 📚 Дополнительные ресурсы

- [Jest документация](https://jestjs.io/docs/getting-started)
- [Playwright документация](https://playwright.dev/docs/intro)
- [Testing Library документация](https://testing-library.com/docs/)
- [Allure документация](https://docs.qameta.io/allure/)

## 🤝 Вклад в тестирование

### Добавление новых тестов

1. Создайте тест файл в соответствующей папке
2. Следуйте существующим паттернам именования
3. Добавьте тест в CI pipeline
4. Обновите документацию

### Лучшие практики

1. **Именование**: Используйте описательные имена тестов
2. **Изоляция**: Каждый тест должен быть независимым
3. **Mock данные**: Используйте mock данные для изоляции
4. **Очистка**: Очищайте состояние после каждого теста
5. **Документация**: Документируйте сложные тесты

---

**Помни**: Качественное тестирование - основа надежного приложения! 🚀
