# 🧪 Единый фреймворк тестирования Personal Productivity AI

## 📋 Обзор

Единый фреймворк тестирования обеспечивает консистентность, масштабируемость и удобство разработки тестов для всего проекта. Фреймворк включает в себя систему логирования, централизованные моки, общие утилиты и автоматизацию.

## 🏗️ Архитектура

```
tests/framework/
├── TestFramework.ts      # Основной фреймворк
├── TestLogger.ts         # Система логирования
├── TestMocks.ts          # Централизованные моки
├── TestUtils.ts          # Утилиты для тестов
└── index.ts              # Главный экспорт
```

## 🚀 Быстрый старт

### Установка и импорт

```typescript
import { 
  testFramework, 
  testLogger, 
  testMocks, 
  testUtils,
  TEST_CONFIGS,
  MOCK_CONFIGS,
  quickStart 
} from '@/tests/framework'
```

### Базовая настройка

```typescript
// Настройка для unit тестов
quickStart.unit()

// Настройка для integration тестов
quickStart.integration()

// Настройка для E2E тестов
quickStart.e2e()
```

### Простой тест

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    testMocks.setupAllMocks()
    testLogger.startTest('MyComponent')
  })

  afterEach(() => {
    testMocks.clearAllMocks()
    testLogger.endTest('MyComponent', true)
  })

  test('should render correctly', () => {
    const { getByText } = testUtils.renderWithProviders(<MyComponent />)
    
    testLogger.step('Rendering component')
    expect(getByText('Expected Text')).toBeInTheDocument()
    
    testLogger.assertion('Component rendered correctly', true)
  })
})
```

## 🔧 Основные компоненты

### 1. TestFramework

Основной класс фреймворка, управляющий конфигурацией и выполнением тестов.

```typescript
// Конфигурация
testFramework.updateConfig({
  enableLogging: true,
  mockMode: true,
  timeout: 10000,
  retries: 3
})

// Запуск тестового набора
await testFramework.runTestSuite({
  name: 'User Management',
  config: TEST_CONFIGS.INTEGRATION,
  mocks: MOCK_CONFIGS.FULL,
  setup: async () => { /* настройка */ },
  teardown: async () => { /* очистка */ },
  tests: [/* тесты */]
})
```

### 2. TestLogger

Единая система логирования для всех тестов.

```typescript
// Различные уровни логирования
testLogger.error('AUTH', 'Authentication failed', { error })
testLogger.warn('API', 'Slow response detected', { duration: 5000 })
testLogger.info('TEST', 'Test completed successfully')
testLogger.debug('MOCK', 'Setting up mock data', { data })

// Методы для тестов
testLogger.startTest('Test Name')
testLogger.step('Step description')
testLogger.assertion('Assertion description', true, expected, actual)
testLogger.endTest('Test Name', true)

// Специализированные методы
testLogger.mock('API', 'Mocking endpoint', { endpoint: '/api/test' })
testLogger.api('/api/users', 'GET', 200, { users: [] })
testLogger.performance('Database Query', 150, 100)
```

### 3. TestMocks

Централизованная система моков.

```typescript
// Настройка всех моков
testMocks.setupAllMocks()

// Добавление тестовых данных
testMocks.addUser({ id: 'user-1', name: 'Test User' })
testMocks.addTask({ id: 'task-1', title: 'Test Task' })
testMocks.addSubscription({ id: 'sub-1', tier: 'premium' })

// Получение данных
const user = testMocks.getUser('user-1')
const tasks = testMocks.getTasksByUser('user-1')

// Обновление данных
testMocks.updateTask('task-1', { status: 'completed' })
testMocks.deleteTask('task-1')

// Очистка
testMocks.clearAllMocks()
testMocks.clearData()
```

### 4. TestUtils

Общие утилиты для тестов.

```typescript
// Рендеринг с провайдерами
const { getByText } = testUtils.renderWithProviders(
  <Component />,
  { providers: [AuthProvider, StoreProvider] }
)

// Асинхронные операции
await testUtils.waitForState(() => state.user, expectedUser)
await testUtils.waitForElement(() => screen.getByText('Text'))
await testUtils.waitForCondition(() => condition === true)

// Генерация тестовых данных
const user = testUtils.generateUser({ name: 'Custom Name' })
const task = testUtils.generateTask({ priority: 'high' })
const subscription = testUtils.generateSubscription({ tier: 'premium' })

// Моки API
testUtils.mockApiResponse('/api/users', { users: [] }, 100) // с задержкой
testUtils.mockAuthUser({ id: 'user-1', name: 'Test User' })

// Работа с формами
await testUtils.fillForm(container, { name: 'John', email: 'john@example.com' })
await testUtils.submitForm(container)

// Работа с событиями
await testUtils.fireEvent(button, 'click')
await testUtils.advanceTimers(1000)

// Измерение производительности
const { result, duration } = await testUtils.measurePerformance(
  () => expensiveOperation(),
  'expensive_operation',
  100 // порог в мс
)
```

## 🎨 Декораторы и хуки

### Декораторы для автоматизации

```typescript
@TestSuite('UserManagement', TEST_CONFIGS.INTEGRATION, MOCK_CONFIGS.FULL)
class UserManagementTests {
  @TestCase('should create user', 'Creates a new user successfully')
  @WithMocks({ enableAuth: true, enableDatabase: true })
  async testCreateUser(context: TestContext) {
    // Тест автоматически получает context с logger, utils, config
    const user = context.utils.generateUser()
    context.logger.step('Creating user')
    // ... тест
  }

  @LogTest('should update user')
  @WithPerformance(100)
  async testUpdateUser() {
    // Тест автоматически логируется и измеряется производительность
  }

  @LogStep('Validating user data')
  validateUser(user: any) {
    // Метод автоматически логируется
  }
}
```

### Хуки для компонентов

```typescript
function MyComponent() {
  const { logger, utils, config } = useTestFramework()
  
  useEffect(() => {
    logger.debug('COMPONENT', 'Component mounted')
  }, [])
  
  return <div>Component</div>
}
```

## 📊 Конфигурации

### Предустановленные конфигурации тестов

```typescript
// Unit тесты - быстрые, изолированные
TEST_CONFIGS.UNIT = {
  enableLogging: false,
  mockMode: true,
  timeout: 5000,
  retries: 1,
  parallel: false
}

// Integration тесты - с моками, но более полные
TEST_CONFIGS.INTEGRATION = {
  enableLogging: true,
  mockMode: true,
  timeout: 10000,
  retries: 2,
  parallel: false
}

// E2E тесты - с реальными API, медленные
TEST_CONFIGS.E2E = {
  enableLogging: true,
  mockMode: false,
  timeout: 30000,
  retries: 3,
  parallel: true
}
```

### Предустановленные конфигурации моков

```typescript
// Минимальные моки - только авторизация
MOCK_CONFIGS.MINIMAL = {
  enableAuth: true,
  enableDatabase: false,
  enableAPI: false,
  enableNavigation: false,
  enableStorage: false,
  enableNotifications: false
}

// Полные моки - все системы
MOCK_CONFIGS.FULL = {
  enableAuth: true,
  enableDatabase: true,
  enableAPI: true,
  enableNavigation: true,
  enableStorage: true,
  enableNotifications: true
}

// Только API - для тестирования API endpoints
MOCK_CONFIGS.API_ONLY = {
  enableAuth: false,
  enableDatabase: false,
  enableAPI: true,
  enableNavigation: false,
  enableStorage: false,
  enableNotifications: false
}
```

## 🎯 Паттерны тестирования

### 1. Тест React компонента

```typescript
test('should render user profile', async () => {
  const mockUser = testUtils.generateUser({ name: 'John Doe' })
  testMocks.mockAuthUser(mockUser)
  
  const { getByText } = testUtils.renderWithProviders(
    <UserProfile />,
    { providers: [AuthProvider] }
  )
  
  testLogger.step('Rendering user profile')
  await testUtils.waitForElement(() => getByText('John Doe'))
  
  testLogger.assertion('User name displayed', true)
})
```

### 2. Тест React хука

```typescript
test('should return user data', async () => {
  const mockUser = testUtils.generateUser()
  testMocks.mockAuthUser(mockUser)
  
  const { result } = renderHook(() => useAuth())
  
  testLogger.step('Loading user data')
  await testUtils.waitForState(() => result.current.user, mockUser)
  
  testLogger.assertion('User data loaded', true, mockUser, result.current.user)
})
```

### 3. Тест API endpoint

```typescript
test('should fetch users from API', async () => {
  const mockUsers = [testUtils.generateUser(), testUtils.generateUser()]
  testUtils.mockApiResponse('/api/users', { users: mockUsers })
  
  testLogger.step('Calling API endpoint')
  const response = await fetch('/api/users')
  const data = await response.json()
  
  testLogger.api('/api/users', 'GET', 200, data)
  expect(data.users).toHaveLength(2)
})
```

### 4. Тест с производительностью

```typescript
test('should complete operation within time limit', async () => {
  const { result, duration } = await testUtils.measurePerformance(
    () => expensiveOperation(),
    'expensive_operation',
    1000 // порог 1 секунда
  )
  
  testLogger.performance('expensive_operation', duration, 1000)
  expect(duration).toBeLessThan(1000)
  expect(result).toBeDefined()
})
```

### 5. Тест с ошибками

```typescript
test('should handle API errors gracefully', async () => {
  testUtils.mockApiResponse('/api/error', { error: 'Server Error' }, 0, 500)
  
  testLogger.step('Testing error handling')
  await testUtils.expectToThrow(
    () => apiCall(),
    'Server Error'
  )
  
  testLogger.assertion('Error handled correctly', true)
})
```

## 🔄 Миграция существующих тестов

### Шаг 1: Обновление импортов

```typescript
// Было
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'

// Стало
import { testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'
```

### Шаг 2: Обновление рендеринга

```typescript
// Было
const { getByText } = render(<Component />)

// Стало
const { getByText } = testUtils.renderWithProviders(<Component />)
```

### Шаг 3: Добавление логирования

```typescript
// Было
test('should work', () => {
  // тест
})

// Стало
test('should work', () => {
  testLogger.startTest('should work')
  
  // тест
  
  testLogger.endTest('should work', true)
})
```

### Шаг 4: Использование моков

```typescript
// Было
jest.mock('@/lib/auth')
const mockAuth = jest.mocked(auth)

// Стало
testMocks.setupAllMocks()
const mockUser = testUtils.generateUser()
testMocks.mockAuthUser(mockUser)
```

## 📈 Мониторинг и отчеты

### Логирование производительности

```typescript
// Автоматическое логирование при превышении порога
@WithPerformance(100)
async function slowOperation() {
  // Операция будет автоматически измерена
  // Если превысит 100мс, будет залогировано предупреждение
}
```

### Экспорт в Allure

```typescript
// Получение логов для Allure
const allureLogs = testLogger.exportToAllure()

// Использование в Allure
allure.attachment('Test Logs', JSON.stringify(allureLogs, null, 2), 'application/json')
```

### Статистика тестов

```typescript
// Получение всех логов
const allLogs = testLogger.getEntries()

// Фильтрация по тесту
const testLogs = testLogger.getEntriesByTest('MyTest')

// Фильтрация по уровню
const errorLogs = testLogger.getEntriesByLevel(LogLevel.ERROR)
```

## 🚀 Масштабирование

### Добавление новых типов тестов

1. **Создай новую конфигурацию:**
```typescript
export const TEST_CONFIGS = {
  // ... существующие
  PERFORMANCE: {
    enableLogging: true,
    mockMode: false,
    timeout: 60000,
    retries: 1,
    parallel: false
  }
}
```

2. **Создай quickStart функцию:**
```typescript
export const quickStart = {
  // ... существующие
  performance: () => {
    testFramework.updateConfig(TEST_CONFIGS.PERFORMANCE)
    testMocks.updateConfig(MOCK_CONFIGS.API_ONLY)
    testMocks.setupAllMocks()
  }
}
```

3. **Обнови документацию**

### Добавление новых утилит

1. **Добавь метод в TestUtils:**
```typescript
public async waitForAnimation(element: HTMLElement): Promise<void> {
  await this.waitForCondition(() => {
    const computedStyle = window.getComputedStyle(element)
    return computedStyle.animationPlayState === 'running'
  })
}
```

2. **Экспортируй в index.ts:**
```typescript
export const { waitForAnimation } = testUtils
```

3. **Создай декоратор если нужно:**
```typescript
export function WithAnimation() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // реализация
  }
}
```

## 🎉 Лучшие практики

### 1. Всегда используй фреймворк
- ✅ Используй `testUtils.renderWithProviders()` вместо `render()`
- ✅ Используй `testLogger` вместо `console.log`
- ✅ Используй `testMocks` вместо ручных моков
- ❌ НЕ пиши тесты без использования фреймворка

### 2. Логируй все операции
- ✅ Начинай тест с `testLogger.startTest()`
- ✅ Заканчивай тест с `testLogger.endTest()`
- ✅ Логируй важные шаги с `testLogger.step()`
- ❌ НЕ используй `console.log` напрямую

### 3. Используй утилиты
- ✅ Генерируй данные через `testUtils.generate*()`
- ✅ Ожидай изменения через `testUtils.waitFor*()`
- ✅ Измеряй производительность через `testUtils.measurePerformance()`
- ❌ НЕ создавай тестовые данные вручную

### 4. Настраивай моки правильно
- ✅ Используй `testMocks.setupAllMocks()` в `beforeEach`
- ✅ Используй `testMocks.clearAllMocks()` в `afterEach`
- ✅ Добавляй данные через `testMocks.add*()`
- ❌ НЕ создавай моки в каждом тесте

### 5. Используй декораторы
- ✅ Используй `@LogTest` для автоматического логирования
- ✅ Используй `@WithPerformance` для измерения производительности
- ✅ Используй `@WithMocks` для настройки моков
- ❌ НЕ дублируй код настройки

## 🔧 Отладка

### Включение подробного логирования

```bash
# Включить debug логирование
DEBUG_TESTS=true npm test

# Включить verbose логирование
VERBOSE_TESTS=true npm test

# Логировать в файл
LOG_TO_FILE=true npm test
```

### Просмотр логов

```typescript
// Получение всех логов
const logs = testLogger.getEntries()

// Фильтрация по тесту
const testLogs = testLogger.getEntriesByTest('MyTest')

// Фильтрация по уровню
const errorLogs = testLogger.getEntriesByLevel(LogLevel.ERROR)
```

### Очистка логов

```typescript
// Очистка всех логов
testLogger.clear()

// Очистка всех моков
testMocks.clearAllMocks()

// Полная очистка
cleanup.all()
```

---

**🚀 Единый фреймворк тестирования обеспечивает консистентность, масштабируемость и удобство разработки!**
