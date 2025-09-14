// 🤖 Система интеграции с ИИ моделями (ФАЗА 3)
import { Task, TaskForm, UserPreferences } from '@/types'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local' | 'mock'
export type AITier = 'free' | 'premium' | 'pro' | 'self-hosted'

export interface AIModelConfig {
    id: string
    name: string
    provider: AIProvider
    tier: AITier
    costPerRequest: number
    maxTokens: number
    capabilities: AICapability[]
    setupInstructions?: string
    apiEndpoint?: string
}

export type AICapability =
    | 'task_generation'
    | 'task_prioritization'
    | 'schedule_optimization'
    | 'productivity_analysis'
    | 'smart_reminders'
    | 'goal_tracking'
    | 'habit_formation'

export interface AIRequest {
    prompt: string
    context?: {
        tasks?: Task[]
        preferences?: UserPreferences
        history?: string[]
    }
    maxTokens?: number
    temperature?: number
}

export interface AIResponse {
    success: boolean
    content: string
    usage?: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
        cost: number
    }
    model: string
    error?: string
}

// Доступные модели ИИ
export const AI_MODELS: Record<string, AIModelConfig> = {
    // 🆓 FREE TIER
    'mock-ai': {
        id: 'mock-ai',
        name: 'Mock AI (Демо)',
        provider: 'mock',
        tier: 'free',
        costPerRequest: 0,
        maxTokens: 1000,
        capabilities: ['task_generation', 'task_prioritization']
    },

    // 💎 PREMIUM TIER  
    'gpt-4o-mini': {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        tier: 'premium',
        costPerRequest: 0.001,
        maxTokens: 16000,
        capabilities: ['task_generation', 'task_prioritization', 'schedule_optimization', 'smart_reminders'],
        apiEndpoint: 'https://api.openai.com/v1/chat/completions'
    },

    'claude-haiku': {
        id: 'claude-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        tier: 'premium',
        costPerRequest: 0.0008,
        maxTokens: 200000,
        capabilities: ['productivity_analysis', 'goal_tracking', 'habit_formation'],
        apiEndpoint: 'https://api.anthropic.com/v1/messages'
    },

    // 🚀 PRO TIER
    'gpt-4o': {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        tier: 'pro',
        costPerRequest: 0.01,
        maxTokens: 128000,
        capabilities: ['task_generation', 'task_prioritization', 'schedule_optimization', 'productivity_analysis', 'smart_reminders', 'goal_tracking'],
        apiEndpoint: 'https://api.openai.com/v1/chat/completions'
    },

    'claude-sonnet': {
        id: 'claude-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        tier: 'pro',
        costPerRequest: 0.015,
        maxTokens: 200000,
        capabilities: ['task_generation', 'task_prioritization', 'schedule_optimization', 'productivity_analysis', 'smart_reminders', 'goal_tracking', 'habit_formation'],
        apiEndpoint: 'https://api.anthropic.com/v1/messages'
    },

    'gemini-pro': {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        tier: 'pro',
        costPerRequest: 0.005,
        maxTokens: 32000,
        capabilities: ['schedule_optimization', 'productivity_analysis', 'smart_reminders'],
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
    },

    // 🏠 SELF-HOSTED
    'llama-3.1-8b': {
        id: 'llama-3.1-8b',
        name: 'Llama 3.1 8B (Local)',
        provider: 'local',
        tier: 'self-hosted',
        costPerRequest: 0,
        maxTokens: 8192,
        capabilities: ['task_generation', 'task_prioritization'],
        setupInstructions: `
# Установка локальной модели Llama 3.1 8B

## Требования:
- 16GB RAM минимум
- 20GB свободного места на диске
- NVIDIA GPU (опционально, для ускорения)

## Установка через Ollama:
\`\`\`bash
# 1. Установите Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Загрузите модель
ollama pull llama3.1:8b

# 3. Запустите сервер
ollama serve
\`\`\`

## Настройка для динамических IP:
1. Используйте ngrok для туннелирования:
   \`ngrok http 11434\`
2. Или настройте DynamicDNS сервис
3. В настройках приложения укажите ваш внешний URL

⚠️ **Предупреждения:**
- Потребляет 8-12GB RAM
- Медленнее облачных моделей
- Требует технических знаний
- Обновления моделей - ваша ответственность

✅ **Преимущества:**
- Полная приватность данных
- Нет ограничений по запросам
- Работает оффлайн
`,
        apiEndpoint: 'http://localhost:11434/api/chat'
    }
}

/**
 * 🧠 Главный класс для работы с ИИ
 */
export class AIPlanner {
    private model: AIModelConfig
    private apiKey?: string

    constructor(modelId: string, apiKey?: string) {
        this.model = AI_MODELS[modelId]
        if (!this.model) {
            throw new Error(`Модель ${modelId} не найдена`)
        }
        this.apiKey = apiKey
    }

    /**
     * 📝 Генерация задач на основе описания
     */
    async generateTasks(description: string, context?: {
        existingTasks?: Task[]
        preferences?: UserPreferences
    }): Promise<TaskForm[]> {
        const prompt = this.buildTaskGenerationPrompt(description, context)

        const response = await this.makeRequest({
            prompt,
            context: {
                tasks: context?.existingTasks,
                preferences: context?.preferences
            },
            maxTokens: 1000,
            temperature: 0.7
        })

        if (!response.success) {
            throw new Error(`Ошибка ИИ: ${response.error}`)
        }

        return this.parseTasksFromResponse(response.content)
    }

    /**
     * 🎯 Умная приоритизация задач
     */
    async prioritizeTasks(tasks: Task[], context?: {
        deadline?: Date
        workingHours?: { start: string; end: string }
        currentGoals?: string[]
    }): Promise<Task[]> {
        const prompt = this.buildPrioritizationPrompt(tasks, context)

        const response = await this.makeRequest({
            prompt,
            context: { tasks },
            maxTokens: 800,
            temperature: 0.3
        })

        if (!response.success) {
            throw new Error(`Ошибка ИИ: ${response.error}`)
        }

        return this.parsePrioritizedTasks(response.content, tasks)
    }

    /**
     * 📊 Анализ продуктивности с рекомендациями
     */
    async analyzeProductivity(
        completedTasks: Task[],
        metrics?: {
            focusTime: number
            distractions: number
            mood: 'low' | 'medium' | 'high'
        }
    ): Promise<{
        score: number
        insights: string[]
        recommendations: string[]
        nextActions: string[]
    }> {
        const prompt = this.buildProductivityAnalysisPrompt(completedTasks, metrics)

        const response = await this.makeRequest({
            prompt,
            context: { tasks: completedTasks },
            maxTokens: 1200,
            temperature: 0.5
        })

        if (!response.success) {
            throw new Error(`Ошибка ИИ: ${response.error}`)
        }

        return this.parseProductivityAnalysis(response.content)
    }

    /**
     * 💡 Генерация умных напоминаний
     */
    async generateSmartReminders(
        upcomingTasks: Task[],
        userPatterns?: {
            bestFocusHours: number[]
            averageTaskDuration: number
            procrastinationTriggers: string[]
        }
    ): Promise<{
        reminders: Array<{
            task: Task
            message: string
            timing: 'now' | 'in_30min' | 'in_1hour' | 'tomorrow'
            type: 'motivation' | 'preparation' | 'deadline' | 'energy'
        }>
    }> {
        const prompt = this.buildSmartRemindersPrompt(upcomingTasks, userPatterns)

        const response = await this.makeRequest({
            prompt,
            context: { tasks: upcomingTasks },
            maxTokens: 800,
            temperature: 0.6
        })

        if (!response.success) {
            throw new Error(`Ошибка ИИ: ${response.error}`)
        }

        return this.parseSmartReminders(response.content, upcomingTasks)
    }

    /**
     * 🔄 Основной метод для запросов к ИИ
     */
    private async makeRequest(request: AIRequest): Promise<AIResponse> {
        // Mock ответ для демонстрации (ФАЗА 3 - заменить на реальные API)
        if (this.model.provider === 'mock') {
            return this.mockAIResponse(request)
        }

        // Реальные API вызовы (TODO: реализовать для каждого провайдера)
        switch (this.model.provider) {
            case 'openai':
                return this.callOpenAI(request)
            case 'anthropic':
                return this.callClaude(request)
            case 'google':
                return this.callGemini(request)
            case 'local':
                return this.callLocalModel(request)
            default:
                throw new Error(`Провайдер ${this.model.provider} не поддерживается`)
        }
    }

    // Mock ответ для демонстрации
    private mockAIResponse(request: AIRequest): AIResponse {
        const mockResponses = {
            task_generation: `[
        {
          "title": "Изучить основы TypeScript",
          "description": "Пройти базовый курс и сделать практические упражнения",
          "priority": "high",
          "estimatedMinutes": 120,
          "tags": ["обучение", "разработка"]
        },
        {
          "title": "Настроить проектную среду",
          "description": "Установить необходимые инструменты и зависимости",
          "priority": "medium",
          "estimatedMinutes": 45,
          "tags": ["настройка", "инструменты"]
        }
      ]`,

            productivity_analysis: `{
        "score": 78,
        "insights": [
          "Отличная работа! Вы выполнили 85% запланированных задач",
          "Наиболее продуктивное время: 10:00-12:00",
          "Сложные задачи лучше удаются утром"
        ],
        "recommendations": [
          "Планируйте важные задачи на утро",
          "Добавьте 15-минутные перерывы между задачами",
          "Используйте технику Pomodoro для фокуса"
        ],
        "nextActions": [
          "Запланировать самую важную задачу на завтра на 10:00",
          "Подготовить рабочее место с вечера"
        ]
      }`,

            smart_reminders: `{
        "reminders": [
          {
            "taskId": "task-1",
            "message": "💪 Самое время заняться этой задачей! У вас сейчас пик энергии",
            "timing": "now",
            "type": "energy"
          },
          {
            "taskId": "task-2", 
            "message": "📋 Подготовьте материалы для завтрашней задачи",
            "timing": "in_1hour",
            "type": "preparation"
          }
        ]
      }`
        }

        // Определяем тип запроса по промпту
        let responseType = 'task_generation'
        if (request.prompt.includes('productivity') || request.prompt.includes('анализ')) {
            responseType = 'productivity_analysis'
        } else if (request.prompt.includes('reminder') || request.prompt.includes('напоминание')) {
            responseType = 'smart_reminders'
        }

        return {
            success: true,
            content: mockResponses[responseType as keyof typeof mockResponses] || mockResponses.task_generation,
            model: this.model.id,
            usage: {
                promptTokens: 150,
                completionTokens: 200,
                totalTokens: 350,
                cost: this.model.costPerRequest
            }
        }
    }

    // Заглушки для реальных API (TODO: реализовать)
    private async callOpenAI(request: AIRequest): Promise<AIResponse> {
        throw new Error('OpenAI интеграция в разработке')
    }

    private async callClaude(request: AIRequest): Promise<AIResponse> {
        throw new Error('Claude интеграция в разработке')
    }

    private async callGemini(request: AIRequest): Promise<AIResponse> {
        throw new Error('Gemini интеграция в разработке')
    }

    private async callLocalModel(request: AIRequest): Promise<AIResponse> {
        throw new Error('Локальная модель интеграция в разработке')
    }

    // Методы для построения промптов
    private buildTaskGenerationPrompt(description: string, context?: any): string {
        return `
Создай список задач на основе описания: "${description}"

Контекст:
- Существующие задачи: ${context?.existingTasks?.length || 0}
- Рабочие часы: ${context?.preferences?.workingHours?.start || '09:00'} - ${context?.preferences?.workingHours?.end || '18:00'}

Верни JSON массив задач с полями: title, description, priority, estimatedMinutes, tags
Приоритеты: low, medium, high, urgent
`
    }

    private buildPrioritizationPrompt(tasks: Task[], context?: any): string {
        return `
Отсортируй задачи по приоритету и важности:

Задачи: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority })))}

Контекст:
- Дедлайн: ${context?.deadline || 'не указан'}
- Рабочие часы: ${JSON.stringify(context?.workingHours)}
- Цели: ${context?.currentGoals?.join(', ') || 'не указаны'}

Верни массив ID задач в порядке приоритета
`
    }

    private buildProductivityAnalysisPrompt(tasks: Task[], metrics?: any): string {
        return `
Проанализируй продуктивность на основе выполненных задач:

Задачи: ${JSON.stringify(tasks)}
Метрики: ${JSON.stringify(metrics)}

Верни JSON с полями: score (0-100), insights (массив строк), recommendations (массив строк), nextActions (массив строк)
`
    }

    private buildSmartRemindersPrompt(tasks: Task[], patterns?: any): string {
        return `
Создай умные напоминания для задач:

Задачи: ${JSON.stringify(tasks)}
Паттерны пользователя: ${JSON.stringify(patterns)}

Верни JSON с массивом reminders, каждое с полями: taskId, message, timing, type
`
    }

    // Методы парсинга ответов
    private parseTasksFromResponse(content: string): TaskForm[] {
        try {
            return JSON.parse(content)
        } catch {
            return []
        }
    }

    private parsePrioritizedTasks(content: string, originalTasks: Task[]): Task[] {
        try {
            const taskIds = JSON.parse(content)
            return taskIds.map((id: string) => originalTasks.find(t => t.id === id)).filter(Boolean)
        } catch {
            return originalTasks
        }
    }

    private parseProductivityAnalysis(content: string) {
        try {
            return JSON.parse(content)
        } catch {
            return {
                score: 50,
                insights: ['Ошибка анализа'],
                recommendations: ['Попробуйте позже'],
                nextActions: []
            }
        }
    }

    private parseSmartReminders(content: string, tasks: Task[]) {
        try {
            const data = JSON.parse(content)
            return {
                reminders: data.reminders.map((r: any) => ({
                    task: tasks.find(t => t.id === r.taskId),
                    message: r.message,
                    timing: r.timing,
                    type: r.type
                }))
            }
        } catch {
            return { reminders: [] }
        }
    }
}

/**
 * 💰 Система управления подписками и оплатой
 */
export class AISubscriptionManager {
    private userTier: AITier = 'free'

    constructor(userTier: AITier = 'free') {
        this.userTier = userTier
    }

    getAvailableModels(): AIModelConfig[] {
        return Object.values(AI_MODELS).filter(model => {
            switch (this.userTier) {
                case 'free':
                    return model.tier === 'free'
                case 'premium':
                    return ['free', 'premium'].includes(model.tier)
                case 'pro':
                    return ['free', 'premium', 'pro'].includes(model.tier)
                case 'self-hosted':
                    return true // Все модели доступны
                default:
                    return model.tier === 'free'
            }
        })
    }

    async upgradeToModel(modelId: string): Promise<{
        success: boolean
        paymentUrl?: string
        apiKey?: string
        error?: string
    }> {
        const model = AI_MODELS[modelId]
        if (!model) {
            return { success: false, error: 'Модель не найдена' }
        }

        // Mock для демонстрации
        return {
            success: true,
            paymentUrl: `https://billing.personal-ai.com/upgrade/${modelId}`,
            apiKey: 'demo-api-key-' + modelId
        }
    }

    calculateMonthlyCost(usage: { requests: number; tokens: number }): number {
        // Примерный расчет стоимости
        return usage.requests * 0.002 + usage.tokens * 0.00001
    }
}
