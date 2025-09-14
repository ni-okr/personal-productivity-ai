// 🧠 Умные алгоритмы планирования (Псевдо-ИИ)
import { Task, TaskPriority, UserPreferences } from '@/types'

export interface TimeSlot {
    start: string // "09:00"
    end: string   // "10:30"
    duration: number // minutes
    type: 'focus' | 'break' | 'meeting' | 'flexible'
    energyRequired: 'low' | 'medium' | 'high'
}

export interface SmartSchedule {
    date: Date
    slots: ScheduledTask[]
    productivity_score: number
    recommendations: string[]
}

export interface ScheduledTask extends Task {
    scheduledStart?: Date
    scheduledEnd?: Date
    timeSlot?: TimeSlot
    aiReason?: string
}

export interface ProductivityPattern {
    hour: number
    energyLevel: 'low' | 'medium' | 'high'
    focusCapacity: number // 0-100
    taskTypes: TaskPriority[]
}

// Паттерны продуктивности по умолчанию
export const DEFAULT_PRODUCTIVITY_PATTERNS: ProductivityPattern[] = [
    { hour: 9, energyLevel: 'high', focusCapacity: 90, taskTypes: ['urgent', 'high'] },
    { hour: 10, energyLevel: 'high', focusCapacity: 95, taskTypes: ['urgent', 'high'] },
    { hour: 11, energyLevel: 'high', focusCapacity: 85, taskTypes: ['high', 'medium'] },
    { hour: 12, energyLevel: 'medium', focusCapacity: 60, taskTypes: ['medium', 'low'] },
    { hour: 13, energyLevel: 'low', focusCapacity: 40, taskTypes: ['low'] }, // обед
    { hour: 14, energyLevel: 'medium', focusCapacity: 70, taskTypes: ['medium'] },
    { hour: 15, energyLevel: 'medium', focusCapacity: 80, taskTypes: ['medium', 'high'] },
    { hour: 16, energyLevel: 'medium', focusCapacity: 75, taskTypes: ['medium'] },
    { hour: 17, energyLevel: 'low', focusCapacity: 50, taskTypes: ['low', 'medium'] },
]

/**
 * 🎯 Умный алгоритм сортировки задач по приоритету
 */
export function smartTaskPrioritization(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
        // 1. Срочность (urgent > high > medium > low)
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
        if (priorityDiff !== 0) return priorityDiff

        // 2. Дедлайн (ближайший дедлайн первый)
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        }
        if (a.dueDate && !b.dueDate) return -1
        if (!a.dueDate && b.dueDate) return 1

        // 3. Время выполнения (короткие задачи первые для быстрых побед)
        const aTime = a.estimatedMinutes || 30
        const bTime = b.estimatedMinutes || 30
        return aTime - bTime
    })
}

/**
 * ⏰ Определение оптимального времени для задачи
 */
export function findOptimalTimeSlot(
    task: Task,
    availableSlots: TimeSlot[],
    patterns: ProductivityPattern[] = DEFAULT_PRODUCTIVITY_PATTERNS
): TimeSlot | null {
    const taskDuration = task.estimatedMinutes || 30

    // Находим подходящие слоты по времени
    const suitableSlots = availableSlots.filter(slot => slot.duration >= taskDuration)

    if (suitableSlots.length === 0) return null

    // Оцениваем каждый слот по соответствию задаче
    const scoredSlots = suitableSlots.map(slot => {
        const hour = parseInt(slot.start.split(':')[0])
        const pattern = patterns.find(p => p.hour === hour) || patterns[0]

        let score = 0

        // Соответствие энергетическому уровню
        const taskEnergyRequirement = getTaskEnergyRequirement(task)
        if (pattern.energyLevel === taskEnergyRequirement) score += 30
        else if (Math.abs(getEnergyValue(pattern.energyLevel) - getEnergyValue(taskEnergyRequirement)) === 1) score += 15

        // Соответствие типу задачи
        if (pattern.taskTypes.includes(task.priority)) score += 25

        // Фокусная способность
        score += pattern.focusCapacity * 0.2

        // Бонус за утренние часы для важных задач
        if (task.priority === 'urgent' && hour >= 9 && hour <= 11) score += 20

        return { slot, score }
    })

    // Возвращаем слот с наивысшим счетом
    scoredSlots.sort((a, b) => b.score - a.score)
    return scoredSlots[0]?.slot || null
}

/**
 * 📊 Анализ продуктивности и предложения
 */
export function analyzeProductivityAndSuggest(
    completedTasks: Task[],
    currentTime: Date = new Date()
): {
    score: number
    insights: string[]
    recommendations: string[]
} {
    const insights: string[] = []
    const recommendations: string[] = []
    let score = 0

    // Анализ выполненных задач
    const todayTasks = completedTasks.filter(task =>
        task.completedAt &&
        new Date(task.completedAt).toDateString() === currentTime.toDateString()
    )

    // Базовый счет за количество задач
    score += Math.min(todayTasks.length * 15, 60)

    if (todayTasks.length === 0) {
        insights.push("📊 Сегодня еще не выполнено ни одной задачи")
        recommendations.push("🎯 Начните с самой простой задачи для создания импульса")
    } else {
        insights.push(`✅ Выполнено ${todayTasks.length} задач сегодня`)
    }

    // Анализ приоритетов
    const urgentCompleted = todayTasks.filter(t => t.priority === 'urgent').length
    const highCompleted = todayTasks.filter(t => t.priority === 'high').length

    if (urgentCompleted > 0) {
        score += 25
        insights.push(`🔥 Отлично! Выполнено ${urgentCompleted} срочных задач`)
    }

    if (highCompleted > 0) {
        score += 15
        insights.push(`⚡ Выполнено ${highCompleted} важных задач`)
    }

    // Анализ времени
    const currentHour = currentTime.getHours()
    const pattern = DEFAULT_PRODUCTIVITY_PATTERNS.find(p => p.hour === currentHour)

    if (pattern) {
        if (pattern.energyLevel === 'high') {
            recommendations.push("🚀 Сейчас пик продуктивности - идеальное время для сложных задач!")
        } else if (pattern.energyLevel === 'low') {
            recommendations.push("😴 Энергия на низком уровне - займитесь простыми задачами или сделайте перерыв")
        } else {
            recommendations.push("⚡ Хорошее время для задач средней сложности")
        }
    }

    // Рекомендации по времени дня
    if (currentHour >= 9 && currentHour <= 11) {
        recommendations.push("🌅 Утренние часы - лучшее время для креативной работы")
    } else if (currentHour >= 14 && currentHour <= 16) {
        recommendations.push("☀️ Послеобеденное время - хорошо для встреч и коммуникации")
    } else if (currentHour >= 17) {
        recommendations.push("🌆 Вечер - время для планирования завтрашнего дня")
    }

    // Нормализация счета (0-100)
    score = Math.min(Math.max(score, 0), 100)

    return { score, insights, recommendations }
}

/**
 * 🔄 Автоматическое создание расписания на день
 */
export function createDailySchedule(
    tasks: Task[],
    preferences: Partial<UserPreferences> = {},
    date: Date = new Date()
): SmartSchedule {
    const workStart = preferences.workingHours?.start || "09:00"
    const workEnd = preferences.workingHours?.end || "18:00"
    const focusTime = preferences.focusTime || 90 // minutes
    const breakTime = preferences.breakTime || 15 // minutes

    // Создаем временные слоты
    const timeSlots = generateTimeSlots(workStart, workEnd, focusTime, breakTime)

    // Сортируем задачи по приоритету
    const prioritizedTasks = smartTaskPrioritization(
        tasks.filter(task => task.status === 'todo')
    )

    const scheduledTasks: ScheduledTask[] = []
    const availableSlots = [...timeSlots]

    // Распределяем задачи по слотам
    for (const task of prioritizedTasks) {
        const optimalSlot = findOptimalTimeSlot(task, availableSlots)

        if (optimalSlot) {
            const scheduledTask: ScheduledTask = {
                ...task,
                scheduledStart: parseTimeToDate(optimalSlot.start, date),
                scheduledEnd: parseTimeToDate(optimalSlot.end, date),
                timeSlot: optimalSlot,
                aiReason: generateSchedulingReason(task, optimalSlot)
            }

            scheduledTasks.push(scheduledTask)

            // Удаляем использованный слот
            const slotIndex = availableSlots.indexOf(optimalSlot)
            if (slotIndex > -1) {
                availableSlots.splice(slotIndex, 1)
            }
        }
    }

    // Анализируем продуктивность
    const analysis = analyzeProductivityAndSuggest(
        tasks.filter(t => t.status === 'completed')
    )

    return {
        date,
        slots: scheduledTasks,
        productivity_score: analysis.score,
        recommendations: analysis.recommendations
    }
}

// Вспомогательные функции

function getTaskEnergyRequirement(task: Task): 'low' | 'medium' | 'high' {
    switch (task.priority) {
        case 'urgent': return 'high'
        case 'high': return 'high'
        case 'medium': return 'medium'
        case 'low': return 'low'
    }
}

function getEnergyValue(energy: 'low' | 'medium' | 'high'): number {
    switch (energy) {
        case 'low': return 1
        case 'medium': return 2
        case 'high': return 3
    }
}

function generateTimeSlots(
    startTime: string,
    endTime: string,
    focusMinutes: number,
    breakMinutes: number
): TimeSlot[] {
    const slots: TimeSlot[] = []
    let currentTime = parseTime(startTime)
    const endTimeMinutes = parseTime(endTime)

    while (currentTime < endTimeMinutes) {
        // Фокус-слот
        const focusEnd = Math.min(currentTime + focusMinutes, endTimeMinutes)
        slots.push({
            start: formatTime(currentTime),
            end: formatTime(focusEnd),
            duration: focusEnd - currentTime,
            type: 'focus',
            energyRequired: 'high'
        })

        currentTime = focusEnd

        // Перерыв (если не конец дня)
        if (currentTime < endTimeMinutes) {
            const breakEnd = Math.min(currentTime + breakMinutes, endTimeMinutes)
            slots.push({
                start: formatTime(currentTime),
                end: formatTime(breakEnd),
                duration: breakEnd - currentTime,
                type: 'break',
                energyRequired: 'low'
            })

            currentTime = breakEnd
        }
    }

    return slots.filter(slot => slot.type === 'focus') // Возвращаем только рабочие слоты
}

function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
}

function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function parseTimeToDate(timeStr: string, date: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    return result
}

function generateSchedulingReason(task: Task, slot: TimeSlot): string {
    const reasons = []

    if (task.priority === 'urgent') {
        reasons.push("срочная задача")
    }

    if (slot.start.startsWith('09') || slot.start.startsWith('10')) {
        reasons.push("утренний пик продуктивности")
    }

    if (task.estimatedMinutes && task.estimatedMinutes <= 30) {
        reasons.push("быстрая задача для импульса")
    }

    return `Запланировано: ${reasons.join(', ')}`
}
