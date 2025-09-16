# 🌳 Git Flow Setup - Настройка стратегии релизов

## 🎉 Готово к работе!

**Следующая приоритетная задача:**

```
@main_rules @git-flow-strategy @src/lib/auth.ts @src/stores/useAppStore.ts @src/lib/supabase.ts @tests/ @docs/

Создай полную систему авторизации с компонентами входа, регистрации и восстановления пароля, интегрированную с Supabase
```

**Начинаем работу!** 🚀

---

## 📋 Что настроено

### ✅ Git Flow стратегия
- **main** - продакшн релизы (только стабильные версии)
- **stabilization** - ветка стабилизации (тестирование и багфиксы)
- **develop** - активная разработка (новые функции)
- **feature/*** - функциональные ветки (отдельные задачи)

### ✅ Ветки созданы
- `develop` - для активной разработки
- `stabilization/v1.0.0` - для стабилизации текущего релиза
- `main` - остается стабильным

### ✅ GitHub Actions
- **stabilization-tests.yml** - полное тестирование стабилизации
- **test.yml** - стандартные тесты для develop
- **cursor-agent.yml** - автоматизация через Cursor

### ✅ Bugbot интеграция
- Настроен для анализа PR stabilization → main
- Автоматический анализ при создании PR
- Ручное упоминание через `@cursor review`

### ✅ Документация
- **RELEASE_STRATEGY.md** - полная стратегия релизов
- **git-flow-strategy.mdc** - правила для ИИ
- **README.md** - обновлен с новой стратегией

## 🔄 Workflow релизов

### 1. Разработка функции
```bash
git checkout develop
git checkout -b feature/new-feature
# ... разработка ...
git add . && git commit -m "feat: новая функция"
git push origin feature/new-feature
# Создать PR: feature/new-feature → develop
```

### 2. Подготовка к релизу
```bash
git checkout develop
git checkout -b stabilization/v1.2.0
git push origin stabilization/v1.2.0
```

### 3. Стабилизация
```bash
# Работа в ветке стабилизации
git checkout stabilization/v1.2.0
# Багфиксы, тестирование, оптимизация
```

### 4. Релиз
```bash
# Создать PR: stabilization/v1.2.0 → main
# Bugbot автоматически проанализирует
# После мержа - создать тег релиза
git tag v1.2.0 && git push origin v1.2.0
```

## 🧪 Тестирование

### В ветке стабилизации:
- [ ] Unit тесты (100% покрытие критических функций)
- [ ] Integration тесты (все API endpoints)
- [ ] E2E тесты (критические сценарии)
- [ ] Performance тесты (Lighthouse CI)
- [ ] Security аудит (npm audit)
- [ ] Build тесты (production сборка)
- [ ] Lint проверки (ESLint, Prettier, TypeScript)

### Автоматизация:
- **GitHub Actions** - автоматические тесты при PR
- **Bugbot** - анализ кода на баги и уязвимости
- **Codecov** - проверка покрытия тестами
- **Lighthouse CI** - проверка производительности

## 🐛 Bugbot настройка

### Текущие настройки:
- ✅ **Only Run Once Automatically** - анализ при создании PR
- ✅ **Review Draft PRs** - анализ draft PR
- ❌ **Only Run When Mentioned** - автоматический анализ

### Что анализирует:
- **Безопасность**: SQL injection, XSS, CSRF
- **Производительность**: медленные запросы, утечки памяти
- **Качество кода**: дублирование, сложность, покрытие тестами
- **Архитектура**: нарушение принципов SOLID, антипаттерны
- **TypeScript**: типизация, ошибки компиляции
- **React**: хуки, состояние, производительность

### Ручной запуск:
```
@cursor review
```
или
```
bugbot run
```

## 📊 Мониторинг

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
git checkout main
git checkout -b hotfix/critical-production-bug
# ... исправления ...
git checkout main
git merge hotfix/critical-production-bug
git tag v1.2.1
```

### Rollback релиза:
```bash
git checkout main
git reset --hard v1.1.0
git push origin main --force
```

## 🎯 Следующие шаги

### Немедленно:
1. **Исправить ошибки тестов** в PR #2
2. **Дождаться анализа Bugbot**
3. **Мерж stabilization → main** после успешных проверок
4. **Создать тег релиза v1.0.0**

### Для будущих релизов:
1. **Разработка** → feature ветки → develop
2. **Стабилизация** → develop → stabilization
3. **Релиз** → stabilization → main (через PR + Bugbot)

## 🔧 Инструменты

### MCP серверы:
- **GitHub MCP** - управление ветками и PR
- **Filesystem MCP** - работа с файлами
- **Playwright MCP** - E2E тестирование
- **Supabase MCP** - работа с базой данных

### CLI команды:
```bash
gstatus          # Статус репозитория
gadd             # Добавить все файлы
gcommit "msg"    # Коммит с сообщением
gpush            # Отправить в remote
gflow "msg"      # Полный workflow (add→commit→push)
gdev feature     # Управление сессиями разработки
```

## 📚 Документация

### Основные файлы:
- **RELEASE_STRATEGY.md** - полная стратегия релизов
- **git-flow-strategy.mdc** - правила для ИИ
- **main_rules.mdc** - обновленные правила проекта
- **README.md** - обновлен с новой стратегией

### @-symbols для ИИ:
- `@main_rules` - правила проекта
- `@git-flow-strategy` - стратегия управления релизами
- `@background-agents` - фоновые агенты Cursor
- `@src/lib/auth.ts` - система авторизации
- `@src/stores/useAppStore.ts` - Zustand store
- `@src/lib/supabase.ts` - клиент базы данных

---

## 🎉 Готово к работе!

**Следующая приоритетная задача:**

```
@main_rules @git-flow-strategy @src/lib/auth.ts @src/stores/useAppStore.ts @src/lib/supabase.ts @tests/ @docs/

Создай полную систему авторизации с компонентами входа, регистрации и восстановления пароля, интегрированную с Supabase
```

**Начинаем работу!** 🚀
