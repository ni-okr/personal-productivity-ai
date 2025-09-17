# 📡 API Документация

## 🎯 Обзор

Personal Productivity AI предоставляет RESTful API для управления задачами, пользователями и аналитикой продуктивности.

**Base URL**: `https://personal-productivity-ai.vercel.app/api`

## 🔐 Аутентификация

API использует JWT токены через Supabase Auth.

```typescript
// Получение токена
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// Использование в запросах
fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 📋 Задачи

### Получить все задачи

```http
GET /api/tasks
```

**Параметры:**
- `userId` (string, required) - ID пользователя

**Ответ:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-123",
      "title": "Завершить проект",
      "description": "Описание задачи",
      "priority": "high",
      "status": "in_progress",
      "dueDate": "2025-01-15T10:00:00Z",
      "tags": ["работа", "важно"],
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-10T10:00:00Z"
    }
  ],
  "message": "Tasks loaded successfully"
}
```

### Создать задачу

```http
POST /api/tasks
```

**Тело запроса:**
```json
{
  "title": "Новая задача",
  "description": "Описание задачи",
  "priority": "medium",
  "dueDate": "2025-01-20T10:00:00Z",
  "tags": ["личное"]
}
```

**Ответ:**
```json
{
  "success": true,
  "task": {
    "id": "task-456",
    "title": "Новая задача",
    "description": "Описание задачи",
    "priority": "medium",
    "status": "pending",
    "dueDate": "2025-01-20T10:00:00Z",
    "tags": ["личное"],
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-10T10:00:00Z"
  },
  "message": "Task created successfully"
}
```

### Обновить задачу

```http
PUT /api/tasks/:id
```

**Параметры:**
- `id` (string, required) - ID задачи

**Тело запроса:**
```json
{
  "title": "Обновленная задача",
  "status": "completed"
}
```

**Ответ:**
```json
{
  "success": true,
  "task": {
    "id": "task-123",
    "title": "Обновленная задача",
    "status": "completed",
    "updatedAt": "2025-01-10T11:00:00Z"
  },
  "message": "Task updated successfully"
}
```

### Удалить задачу

```http
DELETE /api/tasks/:id
```

**Параметры:**
- `id` (string, required) - ID задачи

**Ответ:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## 👤 Пользователи

### Получить профиль пользователя

```http
GET /api/users/profile
```

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "avatar": "https://example.com/avatar.jpg",
    "timezone": "Europe/Moscow",
    "subscription": "premium",
    "subscriptionStatus": "active",
    "preferences": {
      "notifications": true,
      "theme": "light"
    },
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-10T10:00:00Z"
  }
}
```

### Обновить профиль

```http
PUT /api/users/profile
```

**Тело запроса:**
```json
{
  "name": "Новое имя",
  "timezone": "Europe/London",
  "preferences": {
    "notifications": false,
    "theme": "dark"
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "name": "Новое имя",
    "timezone": "Europe/London",
    "preferences": {
      "notifications": false,
      "theme": "dark"
    },
    "updatedAt": "2025-01-10T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

## 📊 Аналитика

### Получить метрики продуктивности

```http
GET /api/analytics/productivity
```

**Параметры:**
- `userId` (string, required) - ID пользователя
- `period` (string, optional) - Период: `week`, `month`, `year` (по умолчанию: `month`)

**Ответ:**
```json
{
  "success": true,
  "metrics": {
    "totalTasks": 25,
    "completedTasks": 20,
    "completionRate": 0.8,
    "averageCompletionTime": 2.5,
    "productivityScore": 85,
    "trends": {
      "tasksCreated": [5, 8, 12, 15, 18, 22, 25],
      "tasksCompleted": [3, 6, 10, 14, 16, 19, 20]
    }
  },
  "period": "month",
  "message": "Productivity metrics loaded successfully"
}
```

### Получить ИИ рекомендации

```http
GET /api/ai/suggestions
```

**Параметры:**
- `userId` (string, required) - ID пользователя

**Ответ:**
```json
{
  "success": true,
  "suggestions": [
    {
      "id": "suggestion-123",
      "type": "productivity_tip",
      "title": "Оптимизируйте утренние задачи",
      "description": "Выполняйте самые важные задачи в первой половине дня",
      "priority": "high",
      "category": "time_management"
    },
    {
      "id": "suggestion-456",
      "type": "task_recommendation",
      "title": "Разбейте большую задачу",
      "description": "Задача 'Завершить проект' может быть разбита на подзадачи",
      "priority": "medium",
      "category": "task_management"
    }
  ],
  "message": "AI suggestions loaded successfully"
}
```

## 💳 Подписки

### Получить планы подписки

```http
GET /api/subscriptions/plans
```

**Ответ:**
```json
{
  "success": true,
  "plans": {
    "free": {
      "name": "Free",
      "price": 0,
      "currency": "rub",
      "features": [
        "До 50 задач",
        "Базовый планировщик",
        "Мобильное приложение"
      ]
    },
    "premium": {
      "name": "Premium",
      "price": 999,
      "currency": "rub",
      "features": [
        "До 500 задач",
        "ИИ планировщик",
        "Расширенная аналитика",
        "Приоритетная поддержка"
      ]
    },
    "pro": {
      "name": "Pro",
      "price": 1999,
      "currency": "rub",
      "features": [
        "Неограниченные задачи",
        "Все ИИ модели",
        "Командная работа",
        "API доступ"
      ]
    }
  }
}
```

### Создать checkout сессию

```http
POST /api/subscriptions/create-checkout
```

**Тело запроса:**
```json
{
  "planId": "premium",
  "successUrl": "https://app.example.com/success",
  "cancelUrl": "https://app.example.com/cancel"
}
```

**Ответ:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_123...",
  "sessionId": "cs_1234567890"
}
```

### Получить статус подписки

```http
GET /api/subscriptions/status
```

**Ответ:**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "planId": "premium",
    "currentPeriodStart": "2025-01-01T00:00:00Z",
    "currentPeriodEnd": "2025-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

## 🔔 Уведомления

### Подписаться на рассылку

```http
POST /api/subscribe
```

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "name": "Иван Иванов"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

## 🚨 Обработка ошибок

### Стандартный формат ошибки

```json
{
  "success": false,
  "error": "Описание ошибки",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Коды ошибок

- `VALIDATION_ERROR` - Ошибка валидации данных
- `AUTH_ERROR` - Ошибка аутентификации
- `NOT_FOUND` - Ресурс не найден
- `RATE_LIMIT` - Превышен лимит запросов
- `SERVER_ERROR` - Внутренняя ошибка сервера

### Примеры ошибок

```json
// 400 Bad Request
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "Title is required",
    "priority": "Priority must be one of: low, medium, high"
  }
}

// 401 Unauthorized
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_ERROR"
}

// 404 Not Found
{
  "success": false,
  "error": "Task not found",
  "code": "NOT_FOUND"
}
```

## 📊 Rate Limiting

API имеет ограничения на количество запросов:

- **Free план**: 100 запросов/час
- **Premium план**: 1000 запросов/час  
- **Pro план**: 10000 запросов/час

Заголовки ответа:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔒 Безопасность

### HTTPS

Все API endpoints доступны только по HTTPS.

### CORS

API поддерживает CORS для доменов:
- `https://personal-productivity-ai.vercel.app`
- `https://app.personal-productivity-ai.com`

### Валидация

Все входные данные валидируются:
- Типы данных
- Обязательные поля
- Форматы (email, даты)
- Размеры данных

## 📚 SDK и примеры

### JavaScript/TypeScript

```typescript
import { PersonalProductivityAPI } from '@personal-productivity-ai/sdk'

const api = new PersonalProductivityAPI({
  baseUrl: 'https://personal-productivity-ai.vercel.app/api',
  apiKey: 'your-api-key'
})

// Создание задачи
const task = await api.tasks.create({
  title: 'Новая задача',
  priority: 'high'
})

// Получение метрик
const metrics = await api.analytics.getProductivity('user-123')
```

### cURL примеры

```bash
# Получить задачи
curl -X GET "https://personal-productivity-ai.vercel.app/api/tasks?userId=user-123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Создать задачу
curl -X POST "https://personal-productivity-ai.vercel.app/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Новая задача", "priority": "high"}'
```

## 📞 Поддержка

- **Документация**: [GitHub Wiki](https://github.com/ni-okr/personal-productivity-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/ni-okr/personal-productivity-ai/issues)
- **Email**: api-support@personal-productivity-ai.com
- **Discord**: [Сервер сообщества](https://discord.gg/personal-productivity-ai)

---

**Последнее обновление**: 17 января 2025
