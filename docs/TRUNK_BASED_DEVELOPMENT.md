# 🌳 Trunk-based Development - Полное руководство

## 🎯 Философия Trunk-based Development

### Основные принципы:
- **main** - всегда стабилен, готов к продакшену
- **Множественные релизные ветки** - для параллельных релизов
- **Стабилизация внутри релизных веток** - изоляция изменений
- **Feature toggles** - контроль функциональности в продакшене
- **Быстрые откаты** - через переключение релизных веток

## 🌳 Структура веток

### main (продакшн)
- **Назначение**: Только стабильные релизы, готовые к продакшену
- **Правила**: 
  - Только через PR из релизных веток
  - Обязательный Bugbot анализ
  - Все тесты должны проходить
  - Семантическое версионирование (v1.0.0, v1.1.0, etc.)
  - **БЕЗ БАГОВ ВСЕГДА** - все баги отсеяны на стабилизации

### release/vX.Y (релизные ветки)
- **Назначение**: Стабилизация конкретных версий релиза
- **Правила**:
  - Создаются из develop при готовности к релизу
  - Стабилизация происходит ВНУТРИ ветки
  - Отпочковывание feature веток от релизной ветки
  - После финальной стабилизации - **ЗАПРЕТ НА КОММИТЫ**
  - Синхронизация с develop для новых функций

### develop (разработка)
- **Назначение**: Активная разработка новых функций
- **Правила**:
  - Интеграция feature веток
  - Continuous integration
  - Автоматические тесты
  - Code review для всех PR
  - Синхронизация с релизными ветками

### feature/* (функции)
- **Назначение**: Отдельные задачи и функции
- **Правила**:
  - Создаются от develop ИЛИ от релизных веток
  - Мержатся обратно в соответствующую ветку
  - Один PR = одна функция
  - Обязательное тестирование

## 🔄 Workflow разработки

### 1. Разработка функции
```bash
# Создать feature ветку от develop
./scripts/trunk-dev.sh create-feature new-auth-system

# Работать над функцией
git add .
git commit -m "feat: добавить новую систему авторизации"
git push origin feature/new-auth-system

# Создать PR: feature/new-auth-system → develop
```

### 2. Подготовка релиза
```bash
# Создать релизную ветку из develop
./scripts/trunk-dev.sh create-release v1.2.0

# Стабилизировать релиз
./scripts/trunk-dev.sh stabilize v1.2.0
```

### 3. Стабилизация в релизной ветке
```bash
# Работа в релизной ветке
git checkout release/v1.2.0

# Создание feature веток от релизной ветки для исправлений
./scripts/trunk-dev.sh create-feature fix-auth-bug
# ... исправления ...
git checkout release/v1.2.0
git merge feature/fix-auth-bug
git push origin release/v1.2.0
```

### 4. Финальная стабилизация
```bash
# После финальной стабилизации - ЗАПРЕТ НА КОММИТЫ
# Создать PR: release/v1.2.0 → main
# Bugbot автоматически проанализирует
# После мержа - создать тег релиза
./scripts/trunk-dev.sh finalize-release v1.2.0
```

## 🎛️ Feature Toggles система

### Hot Toggles (горячие переключатели)
- **Назначение**: Выключение функций в работающем продакшене
- **Время отклика**: Мгновенно (без перезапуска)
- **Источник**: База данных, Redis, конфигурация
- **Примеры**: Новые функции, экспериментальные фичи

### Cold Toggles (холодные переключатели)
- **Назначение**: Выключение функций при сборке
- **Время отклика**: При следующем деплое
- **Источник**: Environment variables, конфигурация
- **Примеры**: Нестабильные функции, отладочные режимы

### Реализация Feature Toggles

#### 1. Конфигурация в Supabase
```sql
-- Таблица feature_toggles
CREATE TABLE feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  type VARCHAR(20) CHECK (type IN ('hot', 'cold')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS политики
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON feature_toggles FOR SELECT USING (true);
```

#### 2. TypeScript типы
```typescript
export interface FeatureToggle {
  id: string;
  name: string;
  enabled: boolean;
  type: 'hot' | 'cold';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureToggleConfig {
  [key: string]: boolean;
}
```

#### 3. Хук для использования
```typescript
import { useFeatureToggle } from '@/hooks/useFeatureToggle-enhanced';

export const NewFeatureComponent = () => {
  const { isEnabled, isLoading, updateToggle } = useFeatureToggle('new-ai-features');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isEnabled) {
    return null; // Компонент скрыт
  }

  return (
    <div>
      <h2>Новая функция</h2>
      <button onClick={() => updateToggle(false)}>
        Отключить функцию
      </button>
    </div>
  );
};
```

## 🚨 Управление релизами

### Множественные релизные ветки
```bash
# Текущие релизные ветки
release/v1.0.0  # Стабильная версия в продакшене
release/v1.1.0  # Готовится к релизу
release/v1.2.0  # В разработке

# Переключение между версиями
git checkout release/v1.0.0  # Откат к стабильной версии
git checkout release/v1.1.0  # Переход к новой версии
```

### Быстрый откат в продакшене
```bash
# Откат к предыдущей стабильной версии
./scripts/trunk-dev.sh rollback v1.1.0

# Или переключение на другую релизную ветку
git checkout release/v1.0.0
git checkout -b hotfix/rollback-fix
# ... исправления ...
git checkout main
git merge hotfix/rollback-fix
```

### Синхронизация между ветками
```bash
# Синхронизация develop с релизной веткой
./scripts/trunk-dev.sh sync-develop

# Синхронизация релизных веток между собой
git checkout release/v1.1.0
git merge release/v1.0.0
git push origin release/v1.1.0
```

## 🧪 Тестирование с Feature Toggles

### Тестирование с включенными toggles
```typescript
// Тест с включенным toggle
test('should render new feature when enabled', async () => {
  // Мокаем feature toggle
  jest.mock('@/hooks/useFeatureToggle-enhanced', () => ({
    useFeatureToggle: () => ({ isEnabled: true, isLoading: false })
  }));

  render(<NewFeatureComponent />);
  expect(screen.getByText('Новая функция')).toBeInTheDocument();
});
```

### Тестирование с выключенными toggles
```typescript
// Тест с выключенным toggle
test('should not render new feature when disabled', async () => {
  // Мокаем feature toggle
  jest.mock('@/hooks/useFeatureToggle-enhanced', () => ({
    useFeatureToggle: () => ({ isEnabled: false, isLoading: false })
  }));

  render(<NewFeatureComponent />);
  expect(screen.queryByText('Новая функция')).not.toBeInTheDocument();
});
```

## 📊 Мониторинг и алерты

### Ключевые метрики:
- **Время стабилизации** - от develop до релизной ветки
- **Количество релизных веток** - активные релизы
- **Feature toggle статус** - включенные/выключенные функции
- **Время отката** - скорость переключения между версиями
- **Стабильность main** - отсутствие багов в продакшене

### Алерты:
- **Критический баг в main** - немедленное уведомление
- **Feature toggle ошибка** - проблемы с переключателями
- **Нестабильная релизная ветка** - много багов в стабилизации
- **Долгая стабилизация** - превышение времени релиза

## 🎯 Правила для команды

### Для разработчиков:
1. **Все новые функции** → feature ветки → develop
2. **Стабилизация** → внутри релизных веток
3. **Feature toggles** → для нестабильных функций
4. **НЕ мержить** напрямую в main

### Для DevOps:
1. **Мониторинг** релизных веток
2. **Управление** feature toggles
3. **Быстрый откат** при проблемах
4. **Deployment** только из main

### Для тестировщиков:
1. **Фокус на релизных ветках** для стабилизации
2. **Тестирование** с разными toggles
3. **Проверка откатов** между версиями
4. **Документирование** найденных багов

## 🔧 Инструменты

### Feature Toggle Management:
- **Supabase** - хранение конфигурации
- **Redis** - кеширование hot toggles
- **Environment Variables** - cold toggles
- **Admin Panel** - управление toggles

### Мониторинг:
- **GitHub Actions** - автоматические тесты
- **Bugbot** - анализ кода
- **Lighthouse CI** - производительность
- **Custom Dashboard** - статус toggles

### Скрипты управления:
- **`./scripts/trunk-dev.sh`** - основные операции
- **Git hooks** - автоматические проверки
- **CI/CD** - автоматические тесты и деплой

## 📋 Checklist релиза

### Перед созданием релизной ветки:
- [ ] Все feature ветки смержены в develop
- [ ] Все тесты проходят в develop
- [ ] Code review завершен
- [ ] Feature toggles настроены

### В релизной ветке:
- [ ] Полный набор тестов пройден
- [ ] Performance тесты пройдены
- [ ] Security аудит пройден
- [ ] Feature toggles протестированы
- [ ] Все баги исправлены

### Перед релизом в main:
- [ ] Релизная ветка стабилизирована
- [ ] Bugbot анализ пройден
- [ ] Feature toggles готовы
- [ ] Rollback план готов
- [ ] Мониторинг настроен

## 🎉 Преимущества стратегии

### Для продукта:
- **Стабильность** - main всегда стабилен
- **Гибкость** - множественные релизы
- **Контроль** - feature toggles
- **Откат** - быстрый rollback

### Для команды:
- **Параллельность** - несколько релизов
- **Безопасность** - изоляция изменений
- **Контроль** - управление функциональностью
- **Скорость** - быстрые релизы

### Для пользователей:
- **Надежность** - стабильные релизы
- **Доступность** - быстрые откаты
- **Качество** - меньше багов
- **Поддержка** - точечные исправления

## 🚀 Быстрый старт

### 1. Настройка Feature Toggles
```bash
# Выполнить SQL скрипт в Supabase
psql -h your-supabase-host -U postgres -d postgres -f supabase-feature-toggles.sql
```

### 2. Создание первой релизной ветки
```bash
# Создать релизную ветку
./scripts/trunk-dev.sh create-release v1.0.0

# Стабилизировать релиз
./scripts/trunk-dev.sh stabilize v1.0.0
```

### 3. Использование Feature Toggles
```typescript
// В компоненте
import { useFeatureToggle } from '@/hooks/useFeatureToggle-enhanced';

const MyComponent = () => {
  const { isEnabled, updateToggle } = useFeatureToggle('new-ai-features');
  
  return (
    <div>
      {isEnabled && <NewAIFeature />}
      <button onClick={() => updateToggle(!isEnabled)}>
        {isEnabled ? 'Отключить' : 'Включить'} ИИ функции
      </button>
    </div>
  );
};
```

---

**Помни**: Trunk-based development + Feature toggles = максимальная гибкость и стабильность! 🚀