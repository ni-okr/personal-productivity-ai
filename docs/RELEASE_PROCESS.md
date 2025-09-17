# 🚀 Процесс релизов

## 🎯 Обзор

Personal Productivity AI использует Trunk-based Development с множественными релизными ветками для обеспечения стабильности и быстрых релизов.

## 🌳 Структура веток

### main
- **Назначение**: Только стабильные релизы, готовые к продакшену
- **Правила**: 
  - Только через PR из релизных веток
  - Обязательный Bugbot анализ
  - Все тесты должны проходить
  - Семантическое версионирование (v1.0.0, v1.1.0, etc.)
  - **БЕЗ БАГОВ ВСЕГДА** - все баги отсеяны на стабилизации

### develop
- **Назначение**: Активная разработка новых функций
- **Правила**:
  - Интеграция feature веток
  - Continuous integration
  - Автоматические тесты
  - Code review для всех PR

### release/vX.Y
- **Назначение**: Стабилизация конкретных версий релиза
- **Правила**:
  - Создаются из develop при готовности к релизу
  - Стабилизация происходит ВНУТРИ ветки
  - После финальной стабилизации - **ЗАПРЕТ НА КОММИТЫ**
  - Синхронизация с develop для новых функций

### feature/*
- **Назначение**: Отдельные задачи и функции
- **Правила**:
  - Создаются от develop ИЛИ от релизных веток
  - Мержатся обратно в соответствующую ветку
  - Один PR = одна функция
  - Обязательное тестирование

## 🔄 Workflow релиза

### 1. Подготовка к релизу

```bash
# Убедитесь, что develop стабилен
git checkout develop
git pull origin develop
npm test
npm run build

# Создайте релизную ветку
git checkout -b release/v1.3.0
git push origin release/v1.3.0
```

### 2. Стабилизация

```bash
# Работа в релизной ветке
git checkout release/v1.3.0

# Создание feature веток от релизной ветки для багфиксов
git checkout -b feature/stabilization-fix
# ... исправления ...
git checkout release/v1.3.0
git merge feature/stabilization-fix
git push origin release/v1.3.0
```

### 3. Финальная стабилизация

```bash
# После финальной стабилизации - ЗАПРЕТ НА КОММИТЫ
# Создать PR: release/v1.3.0 → main
# Bugbot автоматически проанализирует
# После мержа - создать тег релиза
git checkout main
git pull origin main
git tag v1.3.0
git push origin v1.3.0
```

## 🧪 Тестирование в стабилизации

### Обязательные проверки

- [ ] **Unit тесты** - 100% покрытие критических функций
- [ ] **Integration тесты** - все API endpoints
- [ ] **E2E тесты** - критические пользовательские сценарии
- [ ] **Performance тесты** - Lighthouse CI
- [ ] **Security аудит** - npm audit, dependency check
- [ ] **Build тесты** - production сборка
- [ ] **Lint проверки** - ESLint, Prettier, TypeScript

### Автоматизация

```yaml
# .github/workflows/release-stabilization.yml
name: 🚀 Release Stabilization
on:
  pull_request:
    branches: [main]
    paths: ['release/**']

jobs:
  full-test-suite:
    # Полный набор тестов для стабилизации
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Build project
        run: npm run build
      - name: Security audit
        run: npm audit --audit-level high
      - name: Lint check
        run: npm run lint
```

## 🐛 Bugfix стратегия

### В ветке стабилизации

1. **Критические баги** - исправляются немедленно
2. **Важные баги** - исправляются в рамках стабилизации
3. **Минорные баги** - переносятся в следующий релиз

### Процесс багфикса

```bash
# Создать hotfix ветку из stabilization
git checkout release/v1.3.0
git checkout -b hotfix/fix-auth-bug

# Исправить баг
# ... изменения ...

# Мерж обратно в stabilization
git checkout release/v1.3.0
git merge hotfix/fix-auth-bug
git push origin release/v1.3.0
```

## 📊 Метрики и мониторинг

### Ключевые метрики

- **Время стабилизации** - от develop до main
- **Количество багфиксов** - в ветке стабилизации
- **Покрытие тестами** - должно быть >90%
- **Performance метрики** - Lighthouse scores
- **Security score** - npm audit results

### Отчеты

- **Stabilization Report** - еженедельно
- **Release Notes** - для каждого релиза
- **Bug Report** - анализ багов в стабилизации

## 🎯 Правила для команды

### Для разработчиков

1. **Все новые функции** → feature ветки → develop
2. **Стабилизация** → только багфиксы и тестирование
3. **Релизы** - только через PR stabilization → main
4. **НЕ мержить** напрямую в main

### Для тестировщиков

1. **Фокус на stabilization** ветке
2. **Полное тестирование** перед релизом
3. **Документирование** найденных багов
4. **Проверка метрик** производительности

### Для DevOps

1. **Автоматизация** всех проверок
2. **Мониторинг** стабильности
3. **Rollback стратегия** для критических багов
4. **Deployment** только из main ветки

## 🚨 Emergency процедуры

### Критический баг в продакшене

```bash
# Создать hotfix из main
git checkout main
git checkout -b hotfix/critical-production-bug

# Исправить баг
# ... изменения ...

# Мерж в main и stabilization
git checkout main
git merge hotfix/critical-production-bug
git tag v1.3.1

git checkout release/v1.3.0
git merge hotfix/critical-production-bug
git push origin release/v1.3.0
```

### Rollback релиза

```bash
# Откат к предыдущему тегу
git checkout main
git reset --hard v1.2.0
git push origin main --force

# Создать hotfix для исправления
git checkout -b hotfix/rollback-fix
```

## 📋 Checklist релиза

### Перед созданием stabilization

- [ ] Все feature ветки смержены в develop
- [ ] Все тесты проходят в develop
- [ ] Code review завершен
- [ ] Документация обновлена

### В ветке стабилизации

- [ ] Полный набор тестов пройден
- [ ] Performance тесты пройдены
- [ ] Security аудит пройден
- [ ] Все баги исправлены
- [ ] Документация актуальна

### Перед релизом в main

- [ ] Stabilization PR создан
- [ ] Bugbot анализ пройден
- [ ] Все проверки пройдены
- [ ] Release notes готовы
- [ ] Rollback план готов

## 🎉 Преимущества стратегии

### Для продукта

- **Стабильность** - main всегда стабилен
- **Качество** - полное тестирование перед релизом
- **Контроль** - четкий процесс релизов
- **Откат** - быстрый rollback при проблемах

### Для команды

- **Планирование** - четкие этапы разработки
- **Ответственность** - каждый этап имеет владельца
- **Качество** - фокус на стабилизации
- **Документация** - все изменения задокументированы

### Для пользователей

- **Надежность** - стабильные релизы
- **Предсказуемость** - регулярные обновления
- **Качество** - меньше багов в продакшене
- **Поддержка** - быстрые hotfix'ы

## 🔗 Полезные ссылки

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Trunk-based Development](https://trunkbaseddevelopment.com/)

---

**Помни**: Стабилизация - это ключ к качественным релизам! 🚀
