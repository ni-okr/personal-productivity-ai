# 🤝 Руководство по участию в разработке

Спасибо за интерес к участию в разработке Personal Productivity AI! 

## 🚀 Быстрый старт

### 1. Fork и клонирование

```bash
# Fork репозитория на GitHub, затем:
git clone https://github.com/YOUR_USERNAME/personal-productivity-ai.git
cd personal-productivity-ai
git remote add upstream https://github.com/ni-okr/personal-productivity-ai.git
```

### 2. Установка зависимостей

```bash
npm install
cp .env.example .env.local
# Заполните переменные в .env.local
```

### 3. Запуск в режиме разработки

```bash
npm run dev
```

## 📋 Процесс разработки

### Git Flow

Мы используем Trunk-based Development:

- `main` - стабильные релизы (только для maintainers)
- `develop` - активная разработка
- `feature/*` - ваши feature ветки
- `release/*` - релизные ветки (только для maintainers)

### Создание feature ветки

```bash
# Обновите develop
git checkout develop
git pull upstream develop

# Создайте feature ветку
git checkout -b feature/your-feature-name
```

### Коммиты

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: добавить новую функцию
fix: исправить баг в авторизации
docs: обновить README
test: добавить тесты для новой функции
refactor: рефакторинг компонента Button
perf: оптимизировать производительность
chore: обновить зависимости
```

### Pull Request

1. Убедитесь, что все тесты проходят:
   ```bash
   npm test
   npm run build
   ```

2. Создайте Pull Request:
   - Заголовок: `feat: добавить новую функцию`
   - Описание: детальное описание изменений
   - Ссылки на связанные issues

3. Дождитесь code review

## 🧪 Тестирование

### Обязательные тесты

```bash
# Unit тесты
npm run test:unit

# E2E тесты  
npm run test:e2e

# Все тесты
npm test

# Покрытие
npm run test:coverage
```

### Фреймворк тестирования

Используйте единый фреймворк тестирования:

```typescript
import { testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'

describe('YourComponent', () => {
  beforeEach(() => {
    testFramework.updateConfig(TEST_CONFIGS.UNIT)
    testMocks.setupAllMocks()
    testLogger.startTest('YourComponent')
  })

  afterEach(() => {
    testMocks.clearAllMocks()
    testLogger.endTest('YourComponent', true)
  })

  test('should work correctly', async () => {
    // Ваш тест
  })
})
```

## 📝 Стандарты кода

### TypeScript

- Строгая типизация
- Интерфейсы для всех объектов
- JSDoc для публичных функций

```typescript
/**
 * Создает новую задачу
 * @param taskData - данные задачи
 * @param userId - ID пользователя
 * @returns Promise с результатом создания
 */
export async function createTask(
  taskData: TaskForm, 
  userId: string
): Promise<ApiResponse<Task>> {
  // реализация
}
```

### React

- Функциональные компоненты
- Hooks для состояния
- Props интерфейсы

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  size, 
  children, 
  onClick 
}) => {
  // реализация
}
```

### CSS

- Tailwind CSS классы
- Компонентные стили
- Responsive design

```tsx
<div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Заголовок</h2>
</div>
```

## 🐛 Сообщение о багах

### Создание issue

1. Проверьте, что баг не был уже сообщен
2. Используйте шаблон Bug Report
3. Приложите скриншоты и логи
4. Укажите версию и окружение

### Шаблон Bug Report

```markdown
## 🐛 Описание бага
Краткое описание проблемы

## 🔄 Шаги для воспроизведения
1. Перейти на страницу '...'
2. Нажать на кнопку '...'
3. Увидеть ошибку

## ✅ Ожидаемое поведение
Что должно происходить

## 📱 Окружение
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.2.0]

## 📎 Дополнительно
Скриншоты, логи, ссылки
```

## ✨ Предложение новых функций

### Создание feature request

1. Проверьте, что функция не была предложена
2. Используйте шаблон Feature Request
3. Опишите пользу для пользователей
4. Предложите реализацию

### Шаблон Feature Request

```markdown
## ✨ Описание функции
Краткое описание новой функции

## 🎯 Проблема
Какую проблему решает эта функция?

## 💡 Решение
Подробное описание решения

## 🎨 Дизайн
Макеты, скриншоты, примеры

## 📋 Дополнительно
Связанные issues, ссылки
```

## 📚 Документация

### Обновление документации

- README.md - основная документация
- API.md - документация API
- docs/ - дополнительная документация

### JSDoc

```typescript
/**
 * Создает новую задачу в системе
 * @param taskData - данные задачи для создания
 * @param userId - уникальный идентификатор пользователя
 * @returns Promise с результатом операции
 * @throws {ValidationError} Если данные задачи невалидны
 * @throws {AuthError} Если пользователь не авторизован
 * @example
 * ```typescript
 * const task = await createTask({
 *   title: 'Новая задача',
 *   description: 'Описание задачи',
 *   priority: 'high'
 * }, 'user-123')
 * ```
 */
export async function createTask(
  taskData: TaskForm, 
  userId: string
): Promise<ApiResponse<Task>> {
  // реализация
}
```

## 🔒 Безопасность

### Сообщение о уязвимостях

Если вы нашли уязвимость безопасности:

1. НЕ создавайте публичный issue
2. Отправьте email на security@personal-productivity-ai.com
3. Опишите уязвимость детально
4. Дождитесь ответа команды

### Безопасный код

- Валидация всех входных данных
- Санитизация пользовательского ввода
- Использование RLS в Supabase
- Безопасные API endpoints

## 🎯 Roadmap

### Текущие приоритеты

1. **Стабильность** - исправление багов
2. **Производительность** - оптимизация
3. **UX** - улучшение пользовательского опыта
4. **Тестирование** - увеличение покрытия

### Как предложить изменения в roadmap

1. Создайте issue с тегом `roadmap`
2. Обоснуйте важность
3. Предложите план реализации
4. Обсудите с сообществом

## 📞 Связь

- **GitHub Issues** - баги и feature requests
- **GitHub Discussions** - общие вопросы
- **Discord** - живое общение (ссылка в README)
- **Email** - support@personal-productivity-ai.com

## 🙏 Благодарности

Спасибо всем контрибьюторам! Ваш вклад делает проект лучше.

### Как стать контрибьютором

1. Сделайте несколько качественных PR
2. Помогите с code review
3. Помогите новичкам
4. Предложите улучшения процесса

---

**Спасибо за участие в разработке! 🚀**
