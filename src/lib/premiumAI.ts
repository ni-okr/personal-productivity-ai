// 💎 Premium AI сервис с проверкой подписок
import { Task, User } from '@/types'
import { AIPlanner, AI_MODELS } from './aiModels'
import { getSubscription, getUserLimits, hasFeatureAccess } from './subscriptions'

export interface PremiumAIResponse {
    success: boolean
    data?: any
    error?: string
    message?: string
    requiresUpgrade?: boolean
    upgradeUrl?: string
}

export interface AIUsageStats {
    requestsUsed: number
    requestsLimit: number
    tokensUsed: number
    tokensLimit: number
    cost: number
    resetDate: Date
}

/**
 * 💎 Premium AI сервис с проверкой подписок
 */
export class PremiumAIService {
    private user: User
    private subscription: any = null

    constructor(user: User) {
        this.user = user
    }

    /**
     * 🔐 Инициализация с проверкой подписки
     */
    async initialize(): Promise<PremiumAIResponse> {
        try {
            const subscriptionResult = await getSubscription(this.user.id)

            if (!subscriptionResult.success) {
                return {
                    success: false,
                    error: 'Не удалось загрузить подписку',
                    requiresUpgrade: true
                }
            }

            this.subscription = subscriptionResult.subscription
            return { success: true }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Ошибка инициализации AI сервиса'
            }
        }
    }

    /**
     * 📝 Генерация задач с проверкой лимитов
     */
    async generateTasks(description: string, context?: any): Promise<PremiumAIResponse> {
        if (!this.subscription) {
            await this.initialize()
        }

        // Проверяем доступ к AI функциям
        if (!hasFeatureAccess(this.subscription, 'ai_requests')) {
            return {
                success: false,
                error: 'AI функции доступны только для Premium подписчиков',
                requiresUpgrade: true,
                upgradeUrl: '/pricing'
            }
        }

        // Проверяем лимиты
        const limits = getUserLimits(this.subscription)
        if (limits.aiRequests > 0) {
            // TODO: Проверить текущее использование
            // const currentUsage = await this.getCurrentUsage()
            // if (currentUsage.requestsUsed >= limits.aiRequests) {
            //   return {
            //     success: false,
            //     error: 'Превышен лимит AI запросов',
            //     requiresUpgrade: true
            //   }
            // }
        }

        try {
            const modelId = this.getBestAvailableModel()
            const aiPlanner = new AIPlanner(modelId, process.env.OPENAI_API_KEY)

            const tasks = await aiPlanner.generateTasks(description, {
                existingTasks: context?.existingTasks,
                preferences: context?.preferences
            })

            // TODO: Записать использование в базу данных
            await this.recordUsage('task_generation', 1, 100)

            return {
                success: true,
                data: tasks,
                message: 'Задачи успешно сгенерированы'
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Ошибка генерации задач'
            }
        }
    }

    /**
     * 🎯 Приоритизация задач
     */
    async prioritizeTasks(tasks: Task[], context?: any): Promise<PremiumAIResponse> {
        if (!this.subscription) {
            await this.initialize()
        }

        if (!hasFeatureAccess(this.subscription, 'ai_requests')) {
            return {
                success: false,
                error: 'AI функции доступны только для Premium подписчиков',
                requiresUpgrade: true,
                upgradeUrl: '/pricing'
            }
        }

        try {
            const modelId = this.getBestAvailableModel()
            const aiPlanner = new AIPlanner(modelId, process.env.OPENAI_API_KEY)

            const prioritizedTasks = await aiPlanner.prioritizeTasks(tasks, context)

            await this.recordUsage('task_prioritization', 1, 50)

            return {
                success: true,
                data: prioritizedTasks,
                message: 'Задачи успешно приоритизированы'
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Ошибка приоритизации задач'
            }
        }
    }

    /**
     * 📊 Анализ продуктивности
     */
    async analyzeProductivity(completedTasks: Task[], metrics?: any): Promise<PremiumAIResponse> {
        if (!this.subscription) {
            await this.initialize()
        }

        if (!hasFeatureAccess(this.subscription, 'ai_requests')) {
            return {
                success: false,
                error: 'AI функции доступны только для Premium подписчиков',
                requiresUpgrade: true,
                upgradeUrl: '/pricing'
            }
        }

        try {
            const modelId = this.getBestAvailableModel()
            const aiPlanner = new AIPlanner(modelId, process.env.OPENAI_API_KEY)

            const analysis = await aiPlanner.analyzeProductivity(completedTasks, metrics)

            await this.recordUsage('productivity_analysis', 1, 200)

            return {
                success: true,
                data: analysis,
                message: 'Анализ продуктивности завершен'
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Ошибка анализа продуктивности'
            }
        }
    }

    /**
     * 💡 Умные напоминания
     */
    async generateSmartReminders(upcomingTasks: Task[], patterns?: any): Promise<PremiumAIResponse> {
        if (!this.subscription) {
            await this.initialize()
        }

        if (!hasFeatureAccess(this.subscription, 'ai_requests')) {
            return {
                success: false,
                error: 'AI функции доступны только для Premium подписчиков',
                requiresUpgrade: true,
                upgradeUrl: '/pricing'
            }
        }

        try {
            const modelId = this.getBestAvailableModel()
            const aiPlanner = new AIPlanner(modelId, process.env.OPENAI_API_KEY)

            const reminders = await aiPlanner.generateSmartReminders(upcomingTasks, patterns)

            await this.recordUsage('smart_reminders', 1, 150)

            return {
                success: true,
                data: reminders,
                message: 'Умные напоминания созданы'
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Ошибка создания напоминаний'
            }
        }
    }

    /**
     * 📈 Получение статистики использования
     */
    async getUsageStats(): Promise<AIUsageStats> {
        // TODO: Реализовать получение статистики из базы данных
        const limits = getUserLimits(this.subscription)

        return {
            requestsUsed: 0,
            requestsLimit: limits.aiRequests,
            tokensUsed: 0,
            tokensLimit: 10000,
            cost: 0,
            resetDate: this.subscription?.currentPeriodEnd || new Date()
        }
    }

    /**
     * 🎯 Получение лучшей доступной модели
     */
    private getBestAvailableModel(): string {
        const availableModels = this.getAvailableModels()

        // Приоритет: GPT-4o > GPT-4o Mini > Mock
        const priorityOrder = ['gpt-4o', 'gpt-4o-mini', 'mock-ai']

        for (const modelId of priorityOrder) {
            if (availableModels.includes(modelId)) {
                return modelId
            }
        }

        return 'mock-ai' // Fallback
    }

    /**
     * 📋 Получение доступных моделей для пользователя
     */
    private getAvailableModels(): string[] {
        const tier = this.subscription?.tier || 'free'

        switch (tier) {
            case 'free':
                return ['mock-ai']
            case 'premium':
                return ['mock-ai', 'gpt-4o-mini']
            case 'pro':
                return ['mock-ai', 'gpt-4o-mini', 'gpt-4o', 'claude-sonnet']
            case 'enterprise':
                return Object.keys(AI_MODELS)
            default:
                return ['mock-ai']
        }
    }

    /**
     * 📊 Запись использования AI
     */
    private async recordUsage(feature: string, requests: number, tokens: number): Promise<void> {
        try {
            // TODO: Реализовать запись в базу данных
            console.log(`AI Usage recorded: ${feature}, requests: ${requests}, tokens: ${tokens}`)
        } catch (error) {
            console.error('Ошибка записи использования AI:', error)
        }
    }

    /**
     * 🔄 Проверка доступности функции
     */
    hasFeatureAccess(feature: string): boolean {
        if (!this.subscription) return false
        return hasFeatureAccess(this.subscription, feature)
    }

    /**
     * 💰 Получение информации о подписке
     */
    getSubscriptionInfo() {
        return {
            tier: this.subscription?.tier || 'free',
            status: this.subscription?.status || 'active',
            limits: getUserLimits(this.subscription),
            availableModels: this.getAvailableModels()
        }
    }
}

/**
 * 🏭 Фабрика для создания AI сервиса
 */
export function createPremiumAIService(user: User): PremiumAIService {
    return new PremiumAIService(user)
}

/**
 * 🎯 Быстрая проверка доступа к AI
 */
export async function checkAIAccess(userId: string, feature: string): Promise<{
    hasAccess: boolean
    requiresUpgrade: boolean
    upgradeUrl?: string
}> {
    try {
        const subscriptionResult = await getSubscription(userId)

        if (!subscriptionResult.success || !subscriptionResult.subscription) {
            return {
                hasAccess: false,
                requiresUpgrade: true,
                upgradeUrl: '/pricing'
            }
        }

        const hasAccess = hasFeatureAccess(subscriptionResult.subscription, feature)

        return {
            hasAccess,
            requiresUpgrade: !hasAccess,
            upgradeUrl: !hasAccess ? '/pricing' : undefined
        }
    } catch (error) {
        return {
            hasAccess: false,
            requiresUpgrade: true,
            upgradeUrl: '/pricing'
        }
    }
}
