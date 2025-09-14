# 🧪 Тестирование Personal Productivity AI

## 📋 Обзор тестов

Проект включает комплексную систему тестирования для обеспечения качества и стабильности всех функций лендинга.

## 🚀 Быстрый старт

```bash
# Установка зависимостей (если еще не установлены)
npm install

# Запуск всех тестов
npm run test:all

# Только unit тесты
npm test

# Только E2E тесты
npm run test:e2e

# E2E тесты с UI (интерактивный режим)
npm run test:e2e:ui

# Тесты с покрытием кода
npm run test:coverage
```

## 📱 Что тестируется

### ✅ Email подписка
- **Успешная регистрация** - новый email корректно сохраняется
- **Повторная регистрация** - дубликат email обрабатывается правильно
- **Некорректный email** - валидация работает для всех невалидных форматов
- **Состояние загрузки** - UI показывает процесс отправки

### 🔘 Кнопки и навигация
- **"Уведомить о релизе"** - прокрутка к форме подписки
- **"Войти"** - показ уведомления о будущей функциональности
- **"Установить приложение"** - PWA установка для разных платформ

### 📱 PWA функциональность
- **Мобильные устройства** (Android/iOS) - PWA установка
- **Десктоп** (Windows/macOS/Linux) - подготовка к нативным приложениям
- **Кроссбраузерность** - Chrome, Firefox, Safari
- **Manifest.json** - корректность PWA манифеста

### 📲 Адаптивность
- **Мобильный вид** - все элементы видны и функциональны
- **Десктопный вид** - полная функциональность
- **Навигация с клавиатуры** - доступность

## 🎯 Сценарии тестирования

### 📧 Email подписка

```typescript
// Успешная подписка
await page.fill('input[type="email"]', 'test@example.com')
await page.click('button:has-text("Подписаться")')
await expect(page.locator('text=Спасибо за подписку')).toBeVisible()

// Дубликат email
await page.fill('input[type="email"]', 'duplicate@example.com')
await page.click('button:has-text("Подписаться")')
await expect(page.locator('text=уже подписан')).toBeVisible()
```

### 🔘 Кнопки

```typescript
// Прокрутка к форме
await page.click('button:has-text("Уведомить о релизе")')
await expect(page.locator('#subscription-form')).toBeInViewport()

// Уведомление о входе
page.on('dialog', async dialog => {
  expect(dialog.message()).toContain('Функция входа будет доступна')
  await dialog.accept()
})
await page.click('button:has-text("Войти")')
```

### 📱 PWA установка

```typescript
// Эмуляция PWA события
await page.addInitScript(() => {
  const mockEvent = {
    preventDefault: () => {},
    prompt: async () => Promise.resolve(),
    userChoice: Promise.resolve({ outcome: 'accepted' })
  }
  
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }))
  }, 1000)
})

await page.reload()
const installButton = page.locator('button:has-text("Установить приложение")')
if (await installButton.isVisible()) {
  await installButton.click()
}
```

## 🏗️ Структура тестов

```
tests/
├── e2e/                          # End-to-End тесты
│   ├── landing-page.spec.ts      # Основные тесты лендинга
│   └── pwa-installation.spec.ts  # PWA и кроссплатформенность
└── unit/                         # Unit тесты
    ├── Button.test.tsx           # Тестирование компонента Button
    └── api-subscribe.test.ts     # Тестирование API подписки
```

## 🔧 Конфигурация

### Playwright (E2E)
- **Браузеры**: Chrome, Firefox, Safari
- **Устройства**: Desktop, Mobile (Pixel 5, iPhone 12)
- **Скриншоты**: При ошибках
- **Видео**: При неудачных тестах
- **Трейсы**: При повторных запусках

### Jest (Unit)
- **Среда**: jsdom для React компонентов, node для API
- **Покрытие кода**: Автоматический сбор метрик
- **Моки**: Supabase и внешние зависимости

## 🚨 Отладка тестов

### E2E тесты не проходят
```bash
# Запуск в debug режиме
npm run test:e2e:debug

# Запуск с UI для визуальной отладки
npm run test:e2e:ui

# Проверка логов браузера
npx playwright test --headed
```

### Unit тесты падают
```bash
# Запуск в watch режиме
npm run test:watch

# Запуск конкретного теста
npm test -- Button.test.tsx

# Подробный вывод
npm test -- --verbose
```

## 📊 Покрытие кода

```bash
# Генерация отчета о покрытии
npm run test:coverage

# Просмотр HTML отчета
open coverage/lcov-report/index.html
```

## 🎯 Цели покрытия

- **Общее покрытие**: > 80%
- **Функции**: > 85%
- **Ветки**: > 75%
- **Строки**: > 80%

## 🔄 CI/CD интеграция

```bash
# Команда для CI
npm run test:ci

# Включает:
# - Unit тесты с покрытием
# - E2E тесты на всех браузерах
# - Генерацию отчетов
```

## 🐛 Известные проблемы

### PWA тестирование
- **Ограничение**: Реальная PWA установка недоступна в headless режиме
- **Решение**: Используем моки для эмуляции событий

### Мобильное тестирование
- **Ограничение**: Некоторые мобильные функции недоступны в эмуляции
- **Решение**: Тестируем на реальных устройствах в критических случаях

## 📝 Добавление новых тестов

### E2E тест
```typescript
test('новая функциональность', async ({ page }) => {
  await page.goto('/')
  // Ваш тест здесь
  await expect(page.locator('selector')).toBeVisible()
})
```

### Unit тест
```typescript
describe('Новый компонент', () => {
  test('должен рендериться', () => {
    render(<NewComponent />)
    expect(screen.getByText('текст')).toBeInTheDocument()
  })
})
```

## 🎉 Лучшие практики

1. **Используйте data-testid** для стабильных селекторов
2. **Мокайте внешние зависимости** в unit тестах
3. **Тестируйте пользовательские сценарии**, а не реализацию
4. **Добавляйте тесты** для каждой новой функции
5. **Регулярно запускайте** полный набор тестов

---

**🚀 Автоматизированное тестирование экономит время разработки и гарантирует качество продукта!**
