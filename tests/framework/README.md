# 🧪 Единый фреймворк тестирования

## 📋 Обзор

Единый фреймворк тестирования для проекта Personal Productivity AI обеспечивает консистентность, масштабируемость и удобство разработки тестов.

## 🚀 Быстрый старт

### Установка

```bash
# Фреймворк уже включен в проект
# Никакой дополнительной установки не требуется
```

### Базовое использование

```typescript
import { testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'

describe('MyComponent', () => {
  beforeEach(() => {
    testMocks.setupAllMocks()
    testLogger.startTest('MyComponent')
  })

  afterEach(() => {
    testMocks.clearAllMocks()
    testLogger.endTest('MyComponent', true)
  })

  test('should work correctly', () => {
    const { getByText } = testUtils.renderWithProviders(<MyComponent />)
    expect(getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## 🏗️ Архитектура

```
tests/framework/
├── TestFramework.ts      # Основной фреймворк
├── TestLogger.ts         # Система логирования
├── TestMocks.ts          # Централизованные моки
├── TestUtils.ts          # Утилиты для тестов
├── index.ts              # Главный экспорт
└── README.md             # Документация
```

## 🔧 Основные компоненты

### 1. TestFramework
Управляет конфигурацией и выполнением тестов.

### 2. TestLogger
Единая система логирования с различными уровнями детализации.

### 3. TestMocks
Централизованная система моков для всех внешних зависимостей.

### 4. TestUtils
Общие утилиты для рендеринга, асинхронных операций и генерации данных.

## 📊 Конфигурации

### Предустановленные конфигурации тестов

- **UNIT** - быстрые, изолированные тесты
- **INTEGRATION** - тесты с моками, но более полные
- **E2E** - тесты с реальными API, медленные

### Предустановленные конфигурации моков

- **MINIMAL** - только авторизация
- **FULL** - все системы
- **API_ONLY** - только API endpoints

## 🎨 Декораторы

### @TestSuite
Автоматическая настройка тестового набора.

### @TestCase
Автоматическое логирование тестов.

### @WithMocks
Автоматическая настройка моков.

### @WithPerformance
Автоматическое измерение производительности.

## 📈 Мониторинг

### Логирование производительности
Автоматическое логирование при превышении порогов.

### Экспорт в Allure
Интеграция с Allure для детальных отчетов.

### Статистика тестов
Сбор метрик выполнения тестов.

## 🔄 Миграция

### Автоматическая миграция
```bash
npm run test:migrate
```

### Ручная миграция
Следуйте примерам в `tests/examples/migrated-test.example.ts`

## 📚 Документация

- [Полная документация](../docs/TESTING_FRAMEWORK.md)
- [Правила для ИИ](../../.cursor/rules/testing-framework.mdc)
- [Примеры миграции](../examples/migrated-test.example.ts)

## 🎯 Лучшие практики

1. **Всегда используй фреймворк** - не пиши тесты без него
2. **Логируй все операции** - используй testLogger
3. **Используй утилиты** - генерируй данные через testUtils
4. **Настраивай моки правильно** - используй testMocks
5. **Используй декораторы** - автоматизируй повторяющиеся задачи

## 🚨 Отладка

### Включение подробного логирования
```bash
DEBUG_TESTS=true npm test
VERBOSE_TESTS=true npm test
LOG_TO_FILE=true npm test
```

### Просмотр логов
```typescript
const logs = testLogger.getEntries()
const testLogs = testLogger.getEntriesByTest('MyTest')
const errorLogs = testLogger.getEntriesByLevel(LogLevel.ERROR)
```

## 🔧 Настройка

### Обновление конфигурации
```typescript
testFramework.updateConfig({
  enableLogging: true,
  timeout: 10000,
  retries: 3
})
```

### Обновление моков
```typescript
testMocks.updateConfig({
  enableAuth: true,
  enableDatabase: false,
  enableAPI: true
})
```

## 🎉 Примеры

### Простой тест компонента
```typescript
test('should render user profile', async () => {
  const mockUser = testUtils.generateUser({ name: 'John Doe' })
  testMocks.mockAuthUser(mockUser)
  
  const { getByText } = testUtils.renderWithProviders(<UserProfile />)
  await testUtils.waitForElement(() => getByText('John Doe'))
  
  expect(getByText('John Doe')).toBeInTheDocument()
})
```

### Тест с производительностью
```typescript
test('should complete within time limit', async () => {
  const { result, duration } = await testUtils.measurePerformance(
    () => expensiveOperation(),
    'expensive_operation',
    1000
  )
  
  expect(duration).toBeLessThan(1000)
})
```

### Тест с декораторами
```typescript
@TestSuite('UserManagement', TEST_CONFIGS.INTEGRATION, MOCK_CONFIGS.FULL)
class UserManagementTests {
  @TestCase('should create user', 'Creates a new user successfully')
  @WithMocks({ enableAuth: true, enableDatabase: true })
  async testCreateUser(context: TestContext) {
    const user = context.utils.generateUser()
    context.mocks.addUser(user)
    // ... тест
  }
}
```

---

**🚀 Единый фреймворк тестирования обеспечивает консистентность, масштабируемость и удобство разработки!**
