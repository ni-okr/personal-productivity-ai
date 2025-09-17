'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { AI_MODELS } from '@/lib/aiModels'
import { checkAIAccess, createPremiumAIService } from '@/lib/premiumAI'
import { analyzeProductivityAndSuggest, smartTaskPrioritization } from '@/lib/smartPlanning'
import { useAppStore } from '@/stores/useAppStore'
import { Task, TaskPriority } from '@/types'
import { validateTask } from '@/utils/validation'
import { BrainIcon, CalendarIcon, CheckCircleIcon, ClockIcon, CrownIcon, HomeIcon, LightbulbIcon, LockIcon, LogOutIcon, PlusIcon, SettingsIcon, TrendingUpIcon, UserIcon, ZapIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function PlannerPageContent() {
    const { user, isAuthenticated, requireAuth } = useAuth()
    const {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        pendingTasks,
        urgentTasks,
        completedTasksToday,
        loadTasks,
        createTaskAsync,
        updateTaskAsync,
        deleteTaskAsync,
        completeTaskAsync,
        isLoading,
        error
    } = useAppStore()

    // Проверка тестовой среды
    const isTestEnvironment = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
        window.location.search.includes('test=true')

    // Мок пользователя для тестовой среды
    const testUser = isTestEnvironment ? {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        timezone: 'Europe/Moscow',
        subscription: 'free' as const,
        subscriptionStatus: 'active' as const,
        preferences: {
            workingHours: {
                start: '09:00',
                end: '18:00'
            },
            focusTime: 25,
            breakTime: 5,
            notifications: {
                email: true,
                push: true,
                desktop: true
            },
            aiCoaching: {
                enabled: true,
                frequency: 'medium' as const,
                style: 'gentle' as const
            }
        },
        createdAt: new Date(),
        updatedAt: new Date()
    } : null

    const [showAddTask, setShowAddTask] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium' as TaskPriority,
        estimatedMinutes: 30,
        dueDate: ''
    })

    // ИИ состояние
    const [aiInsights, setAiInsights] = useState<{
        score: number
        insights: string[]
        recommendations: string[]
    }>({ score: 0, insights: [], recommendations: [] })

    const [isAiLoading, setIsAiLoading] = useState(false)
    const [smartSortEnabled, setSmartSortEnabled] = useState(true)
    const [aiModel, setAiModel] = useState('mock-ai')
    const [premiumAI, setPremiumAI] = useState<any>(null)
    const [aiAccess, setAiAccess] = useState<{
        hasAccess: boolean
        requiresUpgrade: boolean
        upgradeUrl?: string
    }>({ hasAccess: false, requiresUpgrade: false })
    const [usageStats, setUsageStats] = useState<any>(null)

    // Подписки
    const {
        subscription,
        plan,
        isLoading: subscriptionLoading,
        createCheckoutSession,
        refreshSubscription
    } = useSubscription()
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

    // Валидация
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Умная сортировка задач
    const getSortedTasks = (taskList: Task[]) => {
        return smartSortEnabled ? smartTaskPrioritization(taskList) : taskList
    }

    // Загрузка задач при входе пользователя
    useEffect(() => {
        if ((isAuthenticated && user) || (isTestEnvironment && testUser)) {
            loadTasks()
            initializePremiumAI()
        }
    }, [isAuthenticated, user, isTestEnvironment, testUser, loadTasks])

    // Инициализация Premium AI
    const initializePremiumAI = async () => {
        const currentUser = testUser || user
        if (!currentUser) return

        try {
            const aiService = createPremiumAIService(currentUser)
            await aiService.initialize()
            setPremiumAI(aiService)

            // Проверяем доступ к AI функциям
            const access = await checkAIAccess(currentUser.id, 'ai_requests')
            setAiAccess(access)

            // Получаем статистику использования
            const stats = await aiService.getUsageStats()
            setUsageStats(stats)

            // Выбираем лучшую доступную модель
            const subscriptionInfo = aiService.getSubscriptionInfo()
            if (subscriptionInfo.availableModels.length > 0) {
                setAiModel(subscriptionInfo.availableModels[0])
            }
        } catch (error) {
            console.error('Ошибка инициализации Premium AI:', error)
        }
    }

    // Обработка выбора плана подписки
    const handleSelectPlan = async (planId: string) => {
        try {
            const result = await createCheckoutSession(planId)

            if (result.success && result.url) {
                window.location.href = result.url
            } else {
                console.error('Ошибка создания checkout сессии:', result.error)
            }
        } catch (error) {
            console.error('Ошибка выбора плана:', error)
        }
    }

    // Анализ продуктивности при загрузке
    useEffect(() => {
        const runProductivityAnalysis = async () => {
            setIsAiLoading(true)
            try {
                const completedTasks = tasks.filter(t => t.status === 'completed')
                const analysis = analyzeProductivityAndSuggest(completedTasks)

                // Если есть Premium AI - используем его
                if (premiumAI && aiAccess.hasAccess && completedTasks.length > 0) {
                    try {
                        const aiAnalysis = await premiumAI.analyzeProductivity(completedTasks)

                        if (aiAnalysis.success) {
                            setAiInsights({
                                score: aiAnalysis.data.score,
                                insights: [...analysis.insights, ...aiAnalysis.data.insights],
                                recommendations: [...analysis.recommendations, ...aiAnalysis.data.recommendations]
                            })
                        } else {
                            // Fallback к обычному анализу
                            setAiInsights(analysis)
                        }
                    } catch (error) {
                        console.error('Ошибка Premium AI анализа:', error)
                        setAiInsights(analysis)
                    }
                } else {
                    setAiInsights(analysis)
                }
            } catch (error) {
                console.error('Ошибка анализа:', error)
            } finally {
                setIsAiLoading(false)
            }
        }

        runProductivityAnalysis()
    }, [tasks, premiumAI, aiAccess.hasAccess])

    const handleAddTask = async () => {
        if (!isAuthenticated && !isTestEnvironment) {
            setValidationErrors(['Необходимо войти в систему'])
            return
        }

        if (!currentUser) {
            setValidationErrors(['Пользователь не найден'])
            return
        }

        setIsSubmitting(true)
        setValidationErrors([])

        try {
            // Валидация данных
            const validation = validateTask({
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                estimatedMinutes: newTask.estimatedMinutes,
                dueDate: newTask.dueDate
            })

            if (!validation.isValid) {
                setValidationErrors(validation.errors)
                setIsSubmitting(false)
                return
            }

            // Создание задачи через Supabase
            await createTaskAsync({
                title: newTask.title.trim(),
                description: newTask.description?.trim(),
                priority: newTask.priority,
                dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
                estimatedMinutes: newTask.estimatedMinutes,
                tags: []
            })

            // Сброс формы
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                estimatedMinutes: 30,
                dueDate: ''
            })
            setValidationErrors([])
            setShowAddTask(false)
        } catch (error) {
            console.error('Ошибка при добавлении задачи:', error)
            setValidationErrors(['Произошла ошибка при добавлении задачи'])
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleTask = async (task: Task) => {
        if (!isAuthenticated && !isTestEnvironment) return

        if (task.status === 'completed') {
            // Возвращаем задачу в работу
            await updateTaskAsync(task.id, {
                status: 'todo',
                completedAt: undefined
            })
        } else {
            // Завершаем задачу
            await completeTaskAsync(task.id, task.estimatedMinutes)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!isAuthenticated && !isTestEnvironment) return
        await deleteTaskAsync(taskId)
    }

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getPriorityIcon = (priority: TaskPriority) => {
        switch (priority) {
            case 'urgent': return '🔴'
            case 'high': return '🟠'
            case 'medium': return '🔵'
            case 'low': return '⚪'
        }
    }

    // Проверка авторизации (пропускаем для E2E тестов)
    if (!isAuthenticated && !isTestEnvironment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BrainIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">ИИ-Планировщик</h1>
                    <p className="text-gray-600 mb-6">Для доступа к планировщику необходимо войти в систему</p>
                    <Button onClick={() => requireAuth()}>
                        Войти в систему
                    </Button>
                </div>
            </div>
        )
    }

    // Используем testUser или user в зависимости от среды
    const currentUser = testUser || user

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <BrainIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ИИ-Планировщик</h1>
                                <p className="text-sm text-gray-600">Превращаем хаос в систему</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Мобильное меню */}
                            <div className="md:hidden">
                                <Button
                                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                                    variant="outline"
                                    size="sm"
                                >
                                    ☰
                                </Button>
                            </div>

                            {/* Навигационное меню */}
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <HomeIcon className="w-4 h-4" />
                                    Главная
                                </Link>
                                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <UserIcon className="w-4 h-4" />
                                    Профиль
                                </Link>
                                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <SettingsIcon className="w-4 h-4" />
                                    Настройки
                                </Link>
                            </div>

                            {/* Статистика */}
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Сегодня выполнено</p>
                                <p className="text-lg font-semibold text-green-600">{completedTasksToday().length} задач</p>
                            </div>

                            {/* Кнопка добавления задачи */}
                            <Button
                                onClick={() => setShowAddTask(true)}
                                className="gap-2"
                                disabled={isLoading}
                                data-testid="add-task-button"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Добавить задачу
                            </Button>

                            {/* Кнопка выхода */}
                            <Button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        window.location.href = '/'
                                    }
                                }}
                                variant="outline"
                                className="gap-2"
                            >
                                <LogOutIcon className="w-4 h-4" />
                                Выйти
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Мобильное меню */}
            {showMobileMenu && (
                <div className="md:hidden bg-white border-b shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Link 
                                href="/" 
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <HomeIcon className="w-4 h-4" />
                                Главная
                            </Link>
                            <Link 
                                href="/profile" 
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <UserIcon className="w-4 h-4" />
                                Профиль
                            </Link>
                            <Link 
                                href="/settings" 
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <SettingsIcon className="w-4 h-4" />
                                Настройки
                            </Link>
                            <button
                                onClick={() => {
                                    setShowMobileMenu(false)
                                    if (typeof window !== 'undefined') {
                                        window.location.href = '/'
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-left"
                            >
                                <LogOutIcon className="w-4 h-4" />
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ошибки */}
            {error && (
                <div className="container mx-auto px-4 py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            )}

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Срочные задачи */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold text-gray-900">Срочно</h2>
                            <span className="text-sm text-gray-500">({urgentTasks().length})</span>
                        </div>

                        <div className="space-y-3">
                            {getSortedTasks(urgentTasks()).map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggleTask}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                            {urgentTasks().length === 0 && (
                                <p className="text-gray-500 text-sm py-4 text-center">
                                    🎉 Нет срочных задач
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Все задачи */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold text-gray-900">В работе</h2>
                            <span className="text-sm text-gray-500">({pendingTasks().length})</span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {getSortedTasks(pendingTasks()).map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggleTask}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                            {pendingTasks().length === 0 && (
                                <p className="text-gray-500 text-sm py-4 text-center">
                                    ✨ Добавьте первую задачу
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Завершенные */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold text-gray-900">Выполнено сегодня</h2>
                            <span className="text-sm text-gray-500">({completedTasksToday().length})</span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {completedTasksToday().map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggleTask}
                                    onDelete={handleDeleteTask}
                                    completed
                                />
                            ))}
                            {completedTasksToday().length === 0 && (
                                <p className="text-gray-500 text-sm py-4 text-center">
                                    🎯 Пока ничего не выполнено
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ИИ Аналитика и Рекомендации */}
                <div className="mt-8 space-y-6">
                    {/* Панель управления ИИ */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <ZapIcon className="w-6 h-6 text-indigo-600" />
                                <h3 className="text-lg font-semibold">Умные функции</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={smartSortEnabled}
                                        onChange={(e) => setSmartSortEnabled(e.target.checked)}
                                        className="rounded"
                                    />
                                    Умная сортировка
                                </label>
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {AI_MODELS[aiModel]?.name || 'Модель не выбрана'}
                                </div>
                            </div>
                        </div>

                        {smartSortEnabled && (
                            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                🧠 Задачи автоматически сортируются по приоритету, дедлайнам и времени выполнения
                            </div>
                        )}
                    </div>

                    {/* Статус подписки */}
                    {currentUser && (
                        <SubscriptionStatus
                            userId={currentUser.id}
                            onUpgrade={() => setShowSubscriptionModal(true)}
                        />
                    )}

                    {/* Аналитика продуктивности */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <TrendingUpIcon className="w-6 h-6" />
                                <h3 className="text-lg font-semibold">Анализ продуктивности</h3>
                            </div>
                            <div className="text-2xl font-bold">
                                {isAiLoading ? '...' : `${aiInsights.score}%`}
                            </div>
                        </div>

                        {isAiLoading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
                                <p className="text-sm mt-2 opacity-90">ИИ анализирует вашу продуктивность...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Инсайты */}
                                <div className="bg-white/10 rounded-lg p-4">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <TrendingUpIcon className="w-4 h-4" />
                                        Анализ
                                    </h4>
                                    <div className="space-y-1">
                                        {aiInsights.insights.slice(0, 3).map((insight, index) => (
                                            <p key={index} className="text-sm opacity-90">• {insight}</p>
                                        ))}
                                        {aiInsights.insights.length === 0 && (
                                            <p className="text-sm opacity-75">Добавьте задачи для анализа</p>
                                        )}
                                    </div>
                                </div>

                                {/* Рекомендации */}
                                <div className="bg-white/10 rounded-lg p-4">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <LightbulbIcon className="w-4 h-4" />
                                        Рекомендации ИИ
                                    </h4>
                                    <div className="space-y-1">
                                        {aiInsights.recommendations.slice(0, 3).map((rec, index) => (
                                            <p key={index} className="text-sm opacity-90">• {rec}</p>
                                        ))}
                                        {aiInsights.recommendations.length === 0 && (
                                            <p className="text-sm opacity-75">Выполните несколько задач для рекомендаций</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Доступные модели */}
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="flex items-center justify-between text-sm">
                                <span className="opacity-75">Доступные ИИ модели:</span>
                                <div className="flex gap-2">
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs">🆓 Mock AI</span>
                                    {aiAccess.hasAccess ? (
                                        <>
                                            <span className="bg-white/20 px-2 py-1 rounded text-xs">💎 GPT-4o Mini</span>
                                            <span className="bg-white/20 px-2 py-1 rounded text-xs">🚀 Claude Sonnet</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="bg-white/10 px-2 py-1 rounded text-xs opacity-50 flex items-center gap-1">
                                                <LockIcon className="w-3 h-3" />
                                                GPT-4o Mini
                                            </span>
                                            <span className="bg-white/10 px-2 py-1 rounded text-xs opacity-50 flex items-center gap-1">
                                                <LockIcon className="w-3 h-3" />
                                                Claude Sonnet
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Статистика использования */}
                            {usageStats && (
                                <div className="mt-2 text-xs opacity-75">
                                    Использовано: {usageStats.requestsUsed}/{usageStats.requestsLimit} запросов
                                    {usageStats.cost > 0 && ` • Стоимость: $${usageStats.cost.toFixed(4)}`}
                                </div>
                            )}

                            {/* Кнопка апгрейда */}
                            {aiAccess.requiresUpgrade && (
                                <div className="mt-3">
                                    <Button
                                        onClick={() => window.open(aiAccess.upgradeUrl, '_blank')}
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <CrownIcon className="w-4 h-4" />
                                        Обновить до Premium
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Модал добавления задачи */}
            {showAddTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Добавить задачу</h3>

                        {/* Ошибки валидации */}
                        {validationErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <h4 className="text-sm font-medium text-red-800 mb-2">Исправьте ошибки:</h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">•</span>
                                            <span>{error}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название задачи *
                                </label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Что нужно сделать?"
                                    autoFocus
                                    data-testid="task-title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Описание
                                </label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={2}
                                    placeholder="Дополнительные детали..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Приоритет
                                    </label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="low">🟢 Низкий</option>
                                        <option value="medium">🔵 Средний</option>
                                        <option value="high">🟠 Высокий</option>
                                        <option value="urgent">🔴 Срочный</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Время (мин)
                                    </label>
                                    <input
                                        type="number"
                                        value={newTask.estimatedMinutes}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        min="5"
                                        step="5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Срок выполнения
                                </label>
                                <input
                                    type="datetime-local"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={handleAddTask}
                                className="flex-1"
                                disabled={isSubmitting}
                                isLoading={isSubmitting}
                                data-testid="save-task-button"
                            >
                                {isSubmitting ? 'Добавление...' : 'Добавить'}
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowAddTask(false)
                                    setValidationErrors([])
                                }}
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно подписки */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                currentTier={plan?.tier}
                onSelectPlan={handleSelectPlan}
            />
        </div>
    )
}

// Компонент карточки задачи
interface TaskCardProps {
    task: Task
    onToggle: (task: Task) => void
    onDelete: (id: string) => void
    completed?: boolean
}

function TaskCard({ task, onToggle, onDelete, completed }: TaskCardProps) {
    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getPriorityIcon = (priority: TaskPriority) => {
        switch (priority) {
            case 'urgent': return '🔴'
            case 'high': return '🟠'
            case 'medium': return '🔵'
            case 'low': return '⚪'
        }
    }

    return (
        <div className={`p-3 border rounded-lg transition-all hover:shadow-sm ${completed ? 'bg-gray-50 opacity-75' : 'bg-white hover:bg-gray-50'
            }`}>
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onToggle(task)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                        }`}
                    aria-label={`Toggle task ${task.title}`}
                >
                    {task.status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                            {task.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                            {getPriorityIcon(task.priority)}
                        </span>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        {task.estimatedMinutes && (
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {task.estimatedMinutes}м
                            </div>
                        )}
                        {task.dueDate && (
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString('ru')}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => onDelete(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Удалить задачу"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

// Компонент с ErrorBoundary
export default function PlannerPage() {
    return (
        <ErrorBoundary>
            <PlannerPageContent />
        </ErrorBoundary>
    )
}
