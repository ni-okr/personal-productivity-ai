# 🌳 Trunk-based Development - Полная стратегия релизов

## 🎯 Обзор

С 15 сентября 2025 года мы переходим на **Trunk-based Development** с **множественными релизными ветками** и **системой Feature Toggles** для максимальной гибкости и стабильности.

## 🌳 Структура веток

### main (продакшн)
- **Назначение**: Только стабильные релизы, готовые к продакшену
- **Правила**: 
  - Только через PR из релизных веток
  - Обязательный Bugbot анализ
  - Все тесты должны проходить
  - **БЕЗ БАГОВ ВСЕГДА** - все баги отсеяны на стабилизации
  - Семантическое версионирование (v1.0.0, v1.1.0, etc.)

### release/vX.Y (релизные ветки)
- **Назначение**: Стабилизация конкретных версий релиза
- **Правила**:
  - Создаются из develop при готовности к релизу
  - Стабилизация происходит **ВНУТРИ** ветки
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

## 🔄 Workflow релизов

### 1. Разработка функции
```bash
# Создать feature ветку от develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
# ... разработка ...
git add . && git commit -m "feat: добавить новую функцию"
git push origin feature/new-feature
# Создать PR: feature/new-feature → develop
```

### 2. Подготовка релиза
```bash
# Создать релизную ветку из develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0
git push origin release/v1.2.0
```

### 3. Стабилизация в релизной ветке
```bash
# Работа в релизной ветке
git checkout release/v1.2.0

# Создание feature веток от релизной ветки
git checkout -b feature/stabilization-fix
# ... исправления ...
git checkout release/v1.2.0
git merge feature/stabilization-fix
git push origin release/v1.2.0
```

### 4. Финальная стабилизация
```bash
# После финальной стабилизации - ЗАПРЕТ НА КОММИТЫ
# Создать PR: release/v1.2.0 → main
# Bugbot автоматически проанализирует
# После мержа - создать тег релиза
git checkout main
git pull origin main
git tag v1.2.0
git push origin v1.2.0
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
git checkout main
git reset --hard v1.0.0
git push origin main --force

# Или переключение на другую релизную ветку
git checkout release/v1.0.0
git checkout -b hotfix/rollback-fix
# ... исправления ...
git checkout main
git merge hotfix/rollback-fix
```

## 🧪 Тестирование с Feature Toggles

### Тестирование с включенными toggles
```typescript
// Тест с включенным toggle
test('should render new feature when enabled', async () => {
  // Мокаем feature toggle
  jest.mock('@/hooks/useFeatureToggle', () => ({
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
  jest.mock('@/hooks/useFeatureToggle', () => ({
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

### 1. Создание релизной ветки
```bash
git checkout develop
git checkout -b release/v1.3.0
git push origin release/v1.3.0
```

### 2. Стабилизация
```bash
# Работа в релизной ветке
git checkout release/v1.3.0

# Создание feature веток для исправлений
git checkout -b feature/bug-fix
# ... исправления ...
git checkout release/v1.3.0
git merge feature/bug-fix
git push origin release/v1.3.0
```

### 3. Релиз
```bash
# Создать PR: release/v1.3.0 → main
# После мержа - создать тег
git tag v1.3.0
git push origin v1.3.0
```

### 4. Управление Feature Toggles
```typescript
// Использование в компонентах
import { FeatureToggle, FEATURE_TOGGLES } from '@/components/FeatureToggle';

<FeatureToggle
  toggleName={FEATURE_TOGGLES.NEW_AI_FEATURES}
  fallback={<div>Функция недоступна</div>}
>
  <NewAIFeature />
</FeatureToggle>
```

---

**Помни**: Trunk-based development + Feature toggles = максимальная гибкость и стабильность! 🚀
