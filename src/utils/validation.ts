// 🔒 Утилиты для валидации данных

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

export interface TaskValidation {
    title: string
    description?: string
    priority: string
    estimatedMinutes: number
    dueDate?: string
}

/**
 * 📝 Валидация данных задачи
 */
export function validateTask(data: Partial<TaskValidation>): ValidationResult {
    const errors: string[] = []

    // Проверка названия
    if (!data.title || data.title.trim().length === 0) {
        errors.push('Название задачи обязательно')
    } else if (data.title.trim().length > 200) {
        errors.push('Название задачи не должно превышать 200 символов')
    } else if (data.title.trim().length < 3) {
        errors.push('Название задачи должно содержать минимум 3 символа')
    }

    // Проверка описания
    if (data.description && data.description.length > 1000) {
        errors.push('Описание не должно превышать 1000 символов')
    }

    // Проверка приоритета
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (data.priority && !validPriorities.includes(data.priority)) {
        errors.push('Некорректный приоритет задачи')
    }

    // Проверка времени выполнения
    if (data.estimatedMinutes !== undefined) {
        if (data.estimatedMinutes < 1) {
            errors.push('Время выполнения должно быть больше 0 минут')
        } else if (data.estimatedMinutes > 480) { // 8 часов
            errors.push('Время выполнения не должно превышать 480 минут (8 часов)')
        }
    }

    // Проверка даты выполнения
    if (data.dueDate) {
        const dueDate = new Date(data.dueDate)
        const now = new Date()

        if (isNaN(dueDate.getTime())) {
            errors.push('Некорректная дата выполнения')
        } else if (dueDate < now) {
            errors.push('Дата выполнения не может быть в прошлом')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 📧 Валидация email
 */
export function validateEmail(email: string): ValidationResult {
    const errors: string[] = []

    if (!email || email.trim().length === 0) {
        errors.push('Email обязателен')
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            errors.push('Некорректный формат email')
        } else if (email.length > 254) {
            errors.push('Email слишком длинный')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 🔐 Валидация пароля
 */
export function validatePassword(password: string): ValidationResult {
    const errors: string[] = []

    if (!password) {
        errors.push('Пароль обязателен')
    } else {
        if (password.length < 8) {
            errors.push('Пароль должен содержать минимум 8 символов')
        }
        if (password.length > 128) {
            errors.push('Пароль не должен превышать 128 символов')
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Пароль должен содержать строчные буквы')
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Пароль должен содержать заглавные буквы')
        }
        if (!/\d/.test(password)) {
            errors.push('Пароль должен содержать цифры')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 👤 Валидация имени пользователя
 */
export function validateName(name: string): ValidationResult {
    const errors: string[] = []

    if (!name || name.trim().length === 0) {
        errors.push('Имя обязательно')
    } else if (name.trim().length < 2) {
        errors.push('Имя должно содержать минимум 2 символа')
    } else if (name.trim().length > 50) {
        errors.push('Имя не должно превышать 50 символов')
    } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-']+$/.test(name.trim())) {
        errors.push('Имя может содержать только буквы, пробелы, дефисы и апострофы')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 🛡️ Санитизация строк (защита от XSS)
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim()
}

/**
 * 🔢 Валидация числовых значений
 */
export function validateNumber(
    value: number,
    min?: number,
    max?: number,
    fieldName: string = 'Значение'
): ValidationResult {
    const errors: string[] = []

    if (isNaN(value) || !isFinite(value)) {
        errors.push(`${fieldName} должно быть числом`)
    } else {
        if (min !== undefined && value < min) {
            errors.push(`${fieldName} не должно быть меньше ${min}`)
        }
        if (max !== undefined && value > max) {
            errors.push(`${fieldName} не должно быть больше ${max}`)
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 📅 Валидация временного диапазона
 */
export function validateTimeRange(start: string, end: string): ValidationResult {
    const errors: string[] = []

    // Проверка формата времени (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (!timeRegex.test(start)) {
        errors.push('Некорректный формат времени начала (используйте HH:MM)')
    }

    if (!timeRegex.test(end)) {
        errors.push('Некорректный формат времени окончания (используйте HH:MM)')
    }

    if (errors.length === 0) {
        const [startHour, startMin] = start.split(':').map(Number)
        const [endHour, endMin] = end.split(':').map(Number)

        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        if (startMinutes >= endMinutes) {
            errors.push('Время начала должно быть раньше времени окончания')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 🌐 Проверка доступности API
 */
export async function validateApiConnection(url: string): Promise<ValidationResult> {
    const errors: string[] = []

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 секунд таймаут

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            errors.push(`API недоступен (статус: ${response.status})`)
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errors.push('Таймаут подключения к API')
            } else {
                errors.push(`Ошибка подключения: ${error.message}`)
            }
        } else {
            errors.push('Неизвестная ошибка подключения к API')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 🎨 Утилита для отображения ошибок валидации
 */
export function formatValidationErrors(errors: string[]): string {
    if (errors.length === 0) return ''
    if (errors.length === 1) return errors[0]

    return errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
}
