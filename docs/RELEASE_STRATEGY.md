# 🚀 Стратегия управления релизами

## 🎯 Обзор

С 15 сентября 2025 года мы переходим на **Git Flow стратегию с веткой стабилизации** для управления релизами продукта.

## 🌳 Структура веток

### main (продакшн)
- **Назначение**: Только стабильные релизы, готовые к продакшену
- **Правила**: 
  - Только через PR из stabilization
  - Обязательный Bugbot анализ
  - Все тесты должны проходить
  - Семантическое версионирование (v1.0.0, v1.1.0, etc.)

### stabilization (стабилизация)
- **Назначение**: Тестирование и багфиксы перед релизом
- **Правила**:
  - Создается из develop при готовности к релизу
  - Только багфиксы и стабилизация
  - Полное тестирование (unit, integration, e2e)
  - Performance и security аудит

### develop (разработка)
- **Назначение**: Активная разработка новых функций
- **Правила**:
  - Интеграция feature веток
  - Continuous integration
  - Автоматические тесты
  - Code review для всех PR

### feature/* (функции)
- **Назначение**: Отдельные задачи и функции
- **Правила**:
  - Создаются из develop
  - Мержатся обратно в develop
  - Один PR = одна функция
  - Обязательное тестирование

## 🔄 Workflow релизов

### 1. Разработка функции
```bash
# Создать feature ветку из develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Разработка
# ... изменения ...

# Коммит и push
git add .
git commit -m "feat: добавить новую функцию"
git push origin feature/new-feature

# Создать PR: feature/new-feature → develop
```

### 2. Подготовка к релизу
```bash
# Создать ветку стабилизации из develop
git checkout develop
git pull origin develop
git checkout -b stabilization/v1.2.0
git push origin stabilization/v1.2.0
```

### 3. Стабилизация
```bash
# Работа в ветке стабилизации
git checkout stabilization/v1.2.0

# Багфиксы (если нужны)
git checkout -b hotfix/critical-bug
# ... исправления ...
git checkout stabilization/v1.2.0
git merge hotfix/critical-bug
git push origin stabilization/v1.2.0
```

### 4. Релиз
```bash
# Создать PR: stabilization/v1.2.0 → main
# Bugbot автоматически проанализирует
# После мержа - создать тег релиза
git checkout main
git pull origin main
git tag v1.2.0
git push origin v1.2.0
```

## 🧪 Тестирование в стабилизации

### Обязательные проверки:
- [ ] **Unit тесты** - 100% покрытие критических функций
- [ ] **Integration тесты** - все API endpoints
- [ ] **E2E тесты** - критические пользовательские сценарии
- [ ] **Performance тесты** - Lighthouse CI
- [ ] **Security аудит** - npm audit, dependency check
- [ ] **Build тесты** - production сборка
- [ ] **Lint проверки** - ESLint, Prettier, TypeScript

### Автоматизация:
- **GitHub Actions** - автоматические тесты при PR
- **Bugbot** - анализ кода на баги и уязвимости
- **Codecov** - проверка покрытия тестами
- **Lighthouse CI** - проверка производительности

## 🐛 Bugbot интеграция

### Настройки Bugbot:
- ✅ **Only Run Once Automatically** - анализ при создании PR
- ✅ **Review Draft PRs** - анализ draft PR
- ❌ **Only Run When Mentioned** - автоматический анализ

### Что анализирует Bugbot:
- **Безопасность**: SQL injection, XSS, CSRF
- **Производительность**: медленные запросы, утечки памяти
- **Качество кода**: дублирование, сложность, покрытие тестами
- **Архитектура**: нарушение принципов SOLID, антипаттерны
- **TypeScript**: типизация, ошибки компиляции
- **React**: хуки, состояние, производительность

## 📊 Метрики и мониторинг

### Ключевые метрики:
- **Время стабилизации** - от develop до main
- **Количество багфиксов** - в ветке стабилизации
- **Покрытие тестами** - должно быть >90%
- **Performance метрики** - Lighthouse scores
- **Security score** - npm audit results

### Отчеты:
- **Stabilization Report** - еженедельно
- **Release Notes** - для каждого релиза
- **Bug Report** - анализ багов в стабилизации

## 🚨 Emergency процедуры

### Критический баг в продакшене:
```bash
# Создать hotfix из main
git checkout main
git checkout -b hotfix/critical-production-bug

# Исправить баг
# ... изменения ...

# Мерж в main и stabilization
git checkout main
git merge hotfix/critical-production-bug
git tag v1.2.1

git checkout stabilization/v1.2.0
git merge hotfix/critical-production-bug
git push origin stabilization/v1.2.0
```

### Rollback релиза:
```bash
# Откат к предыдущему тегу
git checkout main
git reset --hard v1.1.0
git push origin main --force

# Создать hotfix для исправления
git checkout -b hotfix/rollback-fix
```

## 📋 Checklist релиза

### Перед созданием stabilization:
- [ ] Все feature ветки смержены в develop
- [ ] Все тесты проходят в develop
- [ ] Code review завершен
- [ ] Документация обновлена

### В ветке стабилизации:
- [ ] Полный набор тестов пройден
- [ ] Performance тесты пройдены
- [ ] Security аудит пройден
- [ ] Все баги исправлены
- [ ] Документация актуальна

### Перед релизом в main:
- [ ] Stabilization PR создан
- [ ] Bugbot анализ пройден
- [ ] Все проверки пройдены
- [ ] Release notes готовы
- [ ] Rollback план готов

## 🎉 Преимущества стратегии

### Для продукта:
- **Стабильность** - main всегда стабилен
- **Качество** - полное тестирование перед релизом
- **Контроль** - четкий процесс релизов
- **Откат** - быстрый rollback при проблемах

### Для команды:
- **Планирование** - четкие этапы разработки
- **Ответственность** - каждый этап имеет владельца
- **Качество** - фокус на стабилизации
- **Документация** - все изменения задокументированы

### Для пользователей:
- **Надежность** - стабильные релизы
- **Предсказуемость** - регулярные обновления
- **Качество** - меньше багов в продакшене
- **Поддержка** - быстрые hotfix'ы

## 🔧 Инструменты

### GitHub Actions:
- **stabilization-tests.yml** - полное тестирование стабилизации
- **test.yml** - стандартные тесты для develop
- **cursor-agent.yml** - автоматизация через Cursor

### Bugbot:
- **Автоматический анализ** PR stabilization → main
- **Inline комментарии** с рекомендациями
- **Отчеты** по безопасности и качеству

### MCP серверы:
- **GitHub MCP** - управление ветками и PR
- **Filesystem MCP** - работа с файлами
- **Playwright MCP** - E2E тестирование

---

**Помни**: Стабилизация - это ключ к качественным релизам! 🚀
