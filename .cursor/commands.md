# ⚡ Быстрые команды для Cursor Agent

## 🎯 Контекстные команды для ИИ

### 📊 Анализ проекта
```
/analyze-project - Полный анализ состояния проекта
/check-health - Проверка здоровья кодовой базы  
/test-coverage - Анализ покрытия тестами
/security-audit - Аудит безопасности
```

### 🔧 Разработка
```
/create-component [name] - Создать React компонент с тестами
/create-api [endpoint] - Создать API endpoint с валидацией
/add-test [file] - Добавить тесты для файла
/fix-types - Исправить ошибки TypeScript
```

### 🧪 Тестирование  
```
/run-tests - Запустить все тесты
/test-unit - Unit тесты
/test-e2e - E2E тесты с Allure
/generate-test [component] - Сгенерировать тесты для компонента
```

### 📚 Документация
```
/update-docs - Обновить документацию
/create-readme [section] - Создать раздел README
/document-api - Документировать API endpoints
/architecture-diagram - Создать диаграмму архитектуры
```

### 🚀 Деплой и CI/CD
```
/check-deploy - Проверить готовность к деплою
/build-check - Проверить сборку проекта
/env-check - Проверить переменные окружения
/performance-audit - Аудит производительности
```

## 🎨 Шаблоны кода

### React компонент
```typescript
// Шаблон для создания нового компонента
interface [ComponentName]Props {
  // props here
}

export function [ComponentName]({ }: [ComponentName]Props) {
  return (
    <div className="">
      {/* component content */}
    </div>
  )
}
```

### API Route
```typescript
// Шаблон для API endpoint
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // validation
    // business logic
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Unit Test
```typescript
// Шаблон для unit теста
import { [functionName] } from '@/path/to/function'

describe('[functionName]', () => {
  test('should handle valid input', () => {
    const result = [functionName](validInput)
    expect(result).toBe(expectedOutput)
  })
  
  test('should handle invalid input', () => {
    expect(() => [functionName](invalidInput)).toThrow()
  })
})
```

## 🔍 Полезные @-symbols

### Быстрый доступ к файлам
```
@README.md - Главная документация
@docs/ARCHITECTURE.md - Архитектура
@src/lib/auth.ts - Авторизация
@src/stores/useAppStore.ts - Состояние
@tests/ - Все тесты
@.cursor/rules - Правила ИИ
```

### Контекст для разработки
```
@src/app/page.tsx - Главная страница
@src/app/planner/page.tsx - Планировщик
@src/components/ui/Button.tsx - UI компоненты
@src/lib/supabase.ts - База данных
@package.json - Зависимости
```

## 🎯 Workflow команды

### Создание новой функции
1. `/analyze-project` - понять текущее состояние
2. `/create-component [name]` - создать компонент
3. `/add-test [component]` - добавить тесты
4. `/run-tests` - проверить что все работает
5. `/update-docs` - обновить документацию

### Исправление бага
1. `/test-coverage` - найти непокрытые области
2. `/add-test [buggy-function]` - написать failing test
3. Исправить код
4. `/run-tests` - убедиться что тест проходит
5. `/check-deploy` - проверить готовность

### Рефакторинг
1. `/test-coverage` - убедиться в покрытии
2. Рефакторить код
3. `/run-tests` - проверить что ничего не сломалось
4. `/fix-types` - исправить TypeScript ошибки
5. `/update-docs` - обновить документацию

## 🚀 Автоматизация через MCP

### Доступные MCP серверы
- **Filesystem** - работа с файлами
- **Git** - операции с репозиторием
- **GitHub** - автоматизация PR/Issues
- **Supabase** - прямая работа с БД
- **Memory** - сохранение контекста

### Примеры использования MCP
```
# Создать PR через GitHub MCP
"Create PR for feature/auth-integration with description from commit messages"

# Запросить данные из Supabase
"Show me all users with premium subscription from Supabase"

# Анализ файлов через Filesystem MCP  
"Analyze all TypeScript files in src/lib/ for potential improvements"
```

## 💡 Советы по работе с Cursor Agent

### Эффективные промпты
- Будьте конкретными в запросах
- Указывайте контекст (@файлы, @папки)
- Используйте технические термины проекта
- Ссылайтесь на существующие паттерны

### Контекст для лучших результатов
- Всегда включайте @.cursor/rules
- Добавляйте @README.md для общего контекста
- Используйте @docs/ для архитектурных решений
- Ссылайтесь на @tests/ для понимания ожиданий

---

**Используйте эти команды для максимальной эффективности разработки! ⚡**
