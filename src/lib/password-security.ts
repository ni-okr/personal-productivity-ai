// 🔐 Система безопасности паролей

export interface PasswordSecurityLevel {
    level: 'weak' | 'medium' | 'strong'
    score: number
    suggestions: string[]
    requiresChange: boolean
}

export function analyzePasswordSecurity(password: string): PasswordSecurityLevel {
    let score = 0
    const suggestions: string[] = []

    // Базовая длина
    if (password.length >= 8) score += 1
    else suggestions.push('Используйте минимум 8 символов')

    // Содержит цифры
    if (/\d/.test(password)) score += 1
    else suggestions.push('Добавьте цифры')

    // Содержит заглавные буквы
    if (/[A-Z]/.test(password)) score += 1
    else suggestions.push('Добавьте заглавные буквы')

    // Содержит строчные буквы
    if (/[a-z]/.test(password)) score += 1
    else suggestions.push('Добавьте строчные буквы')

    // Содержит специальные символы
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else suggestions.push('Добавьте специальные символы (!@#$%^&*)')

    // Проверка на слабые пароли
    const weakPasswords = ['123', 'password', 'qwerty', 'admin', '123456', '12345678']
    if (weakPasswords.includes(password.toLowerCase())) {
        score = 0
        suggestions.push('Этот пароль слишком распространен')
    }

    let level: 'weak' | 'medium' | 'strong'
    let requiresChange = false

    if (score <= 2) {
        level = 'weak'
        requiresChange = true
    } else if (score <= 4) {
        level = 'medium'
        requiresChange = false
    } else {
        level = 'strong'
        requiresChange = false
    }

    return {
        level,
        score,
        suggestions,
        requiresChange
    }
}

export function generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''

    // Гарантируем наличие разных типов символов
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'

    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]

    // Заполняем остальные символы
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
    }

    // Перемешиваем символы
    return password.split('').sort(() => Math.random() - 0.5).join('')
}

export function shouldShowPasswordWarning(subscription: string, passwordLevel: PasswordSecurityLevel): boolean {
    // Показываем предупреждение только для платных подписок со слабым паролем
    return (subscription === 'premium' || subscription === 'pro' || subscription === 'enterprise') &&
        passwordLevel.level === 'weak'
}
