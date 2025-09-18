# 🤖 Фоновые агенты Cursor - Правила работы

## 🎯 ОСНОВНЫЕ ПОНЯТИЯ

### Что такое фоновые агенты:
- **Асинхронные агенты** - работают в удаленной среде без участия пользователя
- **Автоматизация задач** - исправление ошибок, реализация функций, рефакторинг
- **Изолированная среда** - Ubuntu машина с доступом в интернет
- **GitHub интеграция** - клонируют репозиторий, работают в отдельной ветке

### Типы агентов:
1. **Background Agents** - фоновые агенты (основной тип)
2. **Terminal Agents** - агенты терминала
3. **Planning Agents** - агенты планирования
4. **Review Agents** - агенты ревью

## 🚀 НАСТРОЙКА И АКТИВАЦИЯ

### 1. Предварительные требования:
- **Cursor версия 1.5.11+** (проверить: `cursor --version`)
- **API ключ Cursor** (настроить в `.env.local`)
- **GitHub интеграция** (права чтения/записи к репозиторию)
- **Тарифный план** с поддержкой агентов (Pro, Pro Plus, Ultra)

### 2. Активация через терминал:
```bash
# Проверка версии
cursor --version

# Активация агентов
./.cursor/activate-background-agents.sh

# Проверка статуса
./.cursor/monitor-agents.sh
```

### 3. Активация через IDE:
- **Ctrl+E** - режим фонового агента
- **Боковая панель** - вкладка "Agents"
- **Веб-интерфейс** - https://cursor.com/agents

## 🔧 КОНФИГУРАЦИЯ

### 1. Environment.json (обязательно):
```json
{
  "snapshot": "POPULATED_FROM_SETTINGS",
  "install": "npm install",
  "terminals": [
    {
      "name": "Run Next.js",
      "command": "npm run dev"
    }
  ]
}
```

### 2. Agent.json (правила агентов):
```json
{
  "agentConfig": {
    "background_agents": {
      "test_fixer": {
        "enabled": true,
        "triggers": ["test_failure", "typescript_error"],
        "actions": ["fix_import_errors", "fix_type_errors"]
      }
    }
  }
}
```

### 3. Cursor Rules (.cursor/rules/):
- **Project Rules** - правила проекта
- **User Rules** - глобальные правила
- **AGENTS.md** - простые инструкции

## 📊 УПРАВЛЕНИЕ АГЕНТАМИ

### 1. Запуск агентов:
```bash
# Через терминал
cursor agent launch --task "исправить ошибки тестов"

# Через IDE
Ctrl+E → выбрать агента → отправить задачу
```

### 2. Мониторинг статуса:
- **"On This Computer"** - активные агенты
- **"In Background"** - фоновые агенты
- **Время работы** - показывает активность
- **Процент прогресса** - показывает выполнение

### 3. Команды управления:
```bash
# Список агентов
cursor agent list

# Статус агента
cursor agent status <agent-id>

# Остановка агента
cursor agent stop <agent-id>

# Логи агента
cursor agent logs <agent-id>
```

## 🔌 API И ИНТЕГРАЦИИ

### 1. REST API:
- **Base URL**: `https://api.cursor.com/v1/agents`
- **Аутентификация**: Bearer token (CURSOR_API_KEY)
- **Endpoints**:
  - `GET /agents` - список агентов
  - `POST /agents` - запуск агента
  - `GET /agents/{id}` - статус агента
  - `DELETE /agents/{id}` - остановка агента

### 2. Webhooks:
- **URL**: настраивается в настройках агента
- **События**: запуск, завершение, ошибка
- **Формат**: JSON с метаданными агента

### 3. Slack интеграция:
- **Установка**: Cursor Settings → Integrations → Slack
- **Использование**: `@Cursor исправить ошибки тестов`
- **Управление**: контекстное меню в Slack

## 🎯 ПРАВИЛА РАБОТЫ С АГЕНТАМИ

### 1. Всегда используй @-symbols:
```
@background-agents @agent.json @environment.json @.cursor/rules/
```

### 2. Приоритеты задач:
1. **Критические** - ошибки компиляции, тесты
2. **Важные** - рефакторинг, оптимизация
3. **Желательные** - документация, стиль

### 3. Мониторинг:
- **Проверяй статус** каждые 5 минут
- **Логируй действия** агентов
- **Отслеживай прогресс** через проценты

### 4. Безопасность:
- **Не коммить** API ключи
- **Проверяй изменения** перед мержем
- **Используй ветки** для экспериментов

## 🚨 УСТРАНЕНИЕ НЕПОЛАДОК

### 1. Агенты не запускаются:
```bash
# Проверь API ключ
echo $CURSOR_API_KEY

# Проверь версию
cursor --version

# Перезапусти Cursor
cursor --restart
```

### 2. Агенты не видны в IDE:
- **Очисти кеш** Cursor
- **Перезапусти IDE**
- **Проверь настройки** агентов

### 3. Ошибки аутентификации:
- **Обнови API ключ** в `.env.local`
- **Проверь права** GitHub
- **Проверь тарифный план**

## 📈 МОНИТОРИНГ И АНАЛИТИКА

### 1. Статистика использования:
- **Время работы** агентов
- **Количество задач** выполнено
- **Успешность** выполнения
- **Стоимость** использования

### 2. Логи и отчеты:
```bash
# Логи агентов
cursor agent logs

# Статистика
./.cursor/monitor-agents.sh

# Отчеты
./.cursor/update-agent-status.sh
```

### 3. Алерты и уведомления:
- **Slack** - уведомления о завершении
- **Email** - отчеты о работе
- **Webhooks** - интеграция с внешними системами

## 💡 ЛУЧШИЕ ПРАКТИКИ

### 1. Планирование задач:
- **Четкие инструкции** для агентов
- **Конкретные цели** и метрики
- **Временные рамки** выполнения

### 2. Управление ресурсами:
- **Лимиты расходов** на агентов
- **Приоритизация** задач
- **Мониторинг** использования

### 3. Качество кода:
- **Автоматические тесты** перед мержем
- **Code review** изменений агентов
- **Документирование** изменений

## 🔄 АВТОМАТИЗАЦИЯ

### 1. Автоматические исправления:
- **Test Fixer Agent** - исправляет ошибки тестов
- **TypeScript Fixer Agent** - исправляет ошибки типов
- **Jest Configurator Agent** - настраивает Jest
- **GitHub Actions Monitor Agent** - мониторит CI/CD

### 2. Триггеры:
- **test_failure** - падение тестов
- **typescript_error** - ошибки TypeScript
- **github_actions_failure** - падение CI/CD
- **compilation_error** - ошибки компиляции

### 3. Действия:
- **fix_import_errors** - исправление импортов
- **fix_type_errors** - исправление типов
- **update_test_configuration** - обновление конфигурации
- **analyze_workflow_logs** - анализ логов

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

### 1. Документация:
- **Официальная**: https://docs.cursor.com/en/background-agent
- **API**: https://docs.cursor.com/en/background-agent/api/overview
- **Интеграции**: https://docs.cursor.com/en/integrations/slack

### 2. Команды:
- **CLI**: https://docs.cursor.com/ru/cli/overview
- **Shell Mode**: https://docs.cursor.com/ru/cli/shell-mode
- **Headless**: https://docs.cursor.com/ru/cli/headless

### 3. Примеры:
- **Code Review**: https://docs.cursor.com/ru/cli/cookbook/code-review
- **Update Docs**: https://docs.cursor.com/ru/cli/cookbook/update-docs
- **Fix CI**: https://docs.cursor.com/ru/cli/cookbook/fix-ci

---

**Помни**: Фоновые агенты - это мощный инструмент автоматизации. Используй их эффективно, но всегда контролируй результат! 🚀
