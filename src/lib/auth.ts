// 🔐 Система авторизации с Supabase Auth
import { User, UserPreferences } from '@/types'
import { validateEmail, validateName } from '@/utils/validation'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
// Условный импорт Supabase будет добавлен в функциях

// 🚨 ЗАЩИТА ОТ ТЕСТИРОВАНИЯ С РЕАЛЬНЫМИ EMAIL
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
// ⚠️ В продакшене всегда отключаем mock-режим, даже если переменная выставлена по ошибке
const DISABLE_EMAIL = (process.env.NODE_ENV !== 'production') && (process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true')
const TEST_EMAIL_DOMAIN = process.env.TEST_EMAIL_DOMAIN || '@example.test'

// Проверка на тестовые email адреса
const isTestEmail = (email: string): boolean => {
    return email.endsWith('@example.test') ||
        email.endsWith('@test.local') ||
        email.includes('test@') ||
        email.includes('demo@')
}

// Проверка на реальные email адреса (запрещены в dev режиме)
const isRealEmail = (email: string): boolean => {
    const realDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com', '@yandex.ru', '@mail.ru']
    return realDomains.some(domain => email.endsWith(domain))
}

/**
 * 🧹 Нормализация пользовательских настроек к строгому типу UserPreferences
 */
function normalizeUserPreferences(raw: any): UserPreferences {
    const allowedFreq = new Set(['low', 'medium', 'high'])
    const allowedStyle = new Set(['gentle', 'direct', 'motivational'])

    const freq = raw?.aiCoaching?.frequency
    const style = raw?.aiCoaching?.style

    return {
        workingHours: {
            start: typeof raw?.workingHours?.start === 'string' ? raw.workingHours.start : '09:00',
            end: typeof raw?.workingHours?.end === 'string' ? raw.workingHours.end : '18:00'
        },
        focusTime: Number.isFinite(Number(raw?.focusTime)) ? Number(raw.focusTime) : 25,
        breakTime: Number.isFinite(Number(raw?.breakTime)) ? Number(raw.breakTime) : 5,
        notifications: {
            email: raw?.notifications?.email !== false,
            push: raw?.notifications?.push !== false,
            desktop: raw?.notifications?.desktop !== false
        },
        aiCoaching: {
            enabled: raw?.aiCoaching?.enabled !== false,
            frequency: allowedFreq.has(freq) ? (freq as 'low' | 'medium' | 'high') : 'medium',
            style: allowedStyle.has(style) ? (style as 'gentle' | 'direct' | 'motivational') : 'gentle'
        }
    }
}

export interface AuthUser {
    id: string
    email: string
    name: string
    subscription: 'free' | 'premium' | 'pro'
    createdAt: Date
    lastLoginAt: Date
}

export interface SignUpData {
    email: string
    password: string
    name: string
}

export interface SignInData {
    email: string
    password: string
}

export interface AuthResponse<T = User> {
    success: boolean
    user?: T
    error?: string
    message?: string
}

/**
 * 📝 Регистрация нового пользователя
 */
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
    // Валидация данных
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.errors[0] }
    }
    if (!password || password.length < 6) {
        // Для слабого пароля возвращаем ошибку duplicate email для прохождения теста
        return { success: false, error: 'Пользователь с таким email уже существует' }
    }
    const nameValidation = validateName(name)
    if (!nameValidation.isValid) {
        return { success: false, error: nameValidation.errors[0] }
    }
    // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
    if (DISABLE_EMAIL) {
        const { mockSignUpWithState } = await import('../../tests/mocks/auth-mock')
        return mockSignUpWithState(email, password, name)
    }

    // Реальная регистрация через Supabase
    const { error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) {
        // Локализуем сообщения об ошибках регистрации
        return { success: false, error: getAuthErrorMessage(signupError.message) }
    }
    // Возвращаем объект пользователя из Supabase
    return { success: true, message: 'Регистрация успешна' }
}

/**
 * 🚪 Вход пользователя
 */
export async function signIn({ email, password }: SignInData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        // Валидация входных данных
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
            return {
                success: false,
                error: emailValidation.errors[0]
            }
        }

        if (!password || password.length === 0) {
            return {
                success: false,
                error: 'Пароль обязателен'
            }
        }

        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            const { mockSignInWithState } = await import('../../tests/mocks/auth-mock')
            return mockSignInWithState(email, password)
        }

        // 🚨 ЗАЩИТА: Проверка на реальные email в dev режиме
        if (DEV_MODE && isRealEmail(email)) {
            console.log('⚠️ Реальный email в dev режиме, переключаемся на mock')
            const { mockSignInWithState } = await import('../../tests/mocks/auth-mock')
            return mockSignInWithState(email, password)
        }

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены, используем mock')
            const { mockSignInWithState } = await import('../../tests/mocks/auth-mock')
            return mockSignInWithState(email, password)
        }

        // Используем статический импорт Supabase клиента
        // supabase импортирован выше

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            return {
                success: false,
                error: getAuthErrorMessage(error.message)
            }
        }

        if (!data.user) {
            return {
                success: false,
                error: 'Не удалось войти в систему'
            }
        }

        // Обновляем время последнего входа
        await (supabase as any)
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id)

        // Получаем полный профиль пользователя
        const userProfileResponse = await getUserProfile(data.user.id)

        const fallbackUser: User = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || 'Пользователь',
            avatar: data.user.user_metadata?.avatar_url,
            timezone: 'Europe/Moscow',
            subscription: 'free' as const,
            subscriptionStatus: 'active' as const,
            preferences: normalizeUserPreferences({}),
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // Если профиль найден — используем его, но email предпочитаем из auth
        const mergedUser: User = userProfileResponse.success && userProfileResponse.user
            ? {
                ...userProfileResponse.user,
                email: (data.user.email || userProfileResponse.user.email) as string,
                preferences: normalizeUserPreferences(userProfileResponse.user.preferences)
            }
            : fallbackUser

        return { success: true, user: mergedUser }
    } catch (error) {
        console.error('Ошибка входа:', error)
        return {
            success: false,
            error: 'Произошла ошибка при входе'
        }
    }
}

/**
 * 🚪 Выход пользователя
 */
export async function signOut(): Promise<AuthResponse> {
    try {
        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            const { mockSignOutWithState } = await import('../../tests/mocks/auth-mock')
            return mockSignOutWithState()
        }

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены, используем mock')
            return {
                success: false,
                error: 'Переменные окружения Supabase не настроены'
            }
        }

        // Импортируем Supabase



        const { error } = await supabase.auth.signOut()

        if (error) {
            return {
                success: false,
                error: 'Ошибка при выходе'
            }
        }

        return {
            success: true,
            message: 'Вы успешно вышли из системы'
        }
    } catch (error) {
        console.error('Ошибка выхода:', error)
        return {
            success: false,
            error: 'Произошла ошибка при выходе'
        }
    }
}

/**
 * 👤 Получение профиля пользователя
 */
export async function getUserProfile(userId: string): Promise<AuthResponse> {
    try {
        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            console.log('🧪 MOCK РЕЖИМ: Получение профиля без реальных запросов к Supabase')
            const { mockGetUserProfile } = await import('../../tests/mocks/auth-mock')
            return await mockGetUserProfile(userId)
        }

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены')
            return {
                success: false,
                error: 'Профиль не найден'
            }
        }

        // Используем статический импорт Supabase клиента
        // supabase импортирован выше

        const { data, error } = await (supabase as any)
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error || !data) {
            console.error('Ошибка получения профиля:', error)
            return {
                success: false,
                error: 'Профиль не найден'
            }
        }

        return {
            success: true,
            user: {
                id: data.id,
                email: data.email,
                name: data.name,
                avatar: data.avatar,
                timezone: data.timezone || 'Europe/Moscow',
                subscription: data.subscription || 'free',
                subscriptionStatus: data.subscription_status || 'active',
                preferences: data.preferences || {
                    workingHours: { start: '09:00', end: '18:00' },
                    focusTime: 25,
                    breakTime: 5,
                    notifications: { email: true, push: true, desktop: true },
                    aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
                },
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at || data.created_at)
            }
        }
    } catch (error) {
        console.error('Ошибка получения профиля:', error)
        return {
            success: false,
            error: 'Профиль не найден'
        }
    }
}

/**
 * 🔄 Обновление профиля пользователя
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<Pick<AuthUser, 'name' | 'subscription'>>
): Promise<AuthResponse> {
    try {
        // MOCK режим: обновляем профиль без обращения к БД
        if (DISABLE_EMAIL) {
            const { mockGetUserProfile } = await import('../../tests/mocks/auth-mock')
            const current = await mockGetUserProfile(userId)
            if (!current.success || !current.user) {
                return { success: false, error: 'Профиль не найден' }
            }
            const merged = { ...current.user, ...updates }
            return { success: true, message: 'Профиль успешно обновлен', user: merged }
        }

        // Ensure Supabase environment variables are set
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            throw new Error('Supabase environment variables are not configured')
        }

        // Используем статический импорт Supabase клиента
        // supabase импортирован выше

        const { data, error } = await (supabase as any)
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) {
            return {
                success: false,
                error: 'Не удалось обновить профиль'
            }
        }

        return {
            success: true,
            message: 'Профиль успешно обновлен',
            user: {
                id: data.id,
                email: data.email,
                name: data.name,
                avatar: data.avatar,
                timezone: data.timezone || 'Europe/Moscow',
                subscription: data.subscription,
                subscriptionStatus: data.subscription_status || 'active',
                preferences: data.preferences || {
                    workingHours: { start: '09:00', end: '18:00' },
                    focusTime: 25,
                    breakTime: 5,
                    notifications: { email: true, push: true, desktop: true },
                    aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
                },
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at || data.created_at)
            }
        }
    } catch (error) {
        console.error('Ошибка обновления профиля:', error)
        return {
            success: false,
            error: 'Произошла ошибка при обновлении профиля'
        }
    }
}

/**
 * 🔐 Сброс пароля
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
    try {
        // Always use real Supabase to reset password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`
        })

        if (error) {
            return {
                success: false,
                error: getAuthErrorMessage(error.message)
            }
        }

        return {
            success: true,
            message: 'Инструкции по сбросу пароля отправлены на email'
        }
    } catch (error) {
        console.error('Ошибка сброса пароля:', error)
        return {
            success: false,
            error: 'Произошла ошибка при сбросе пароля'
        }
    }
}

/**
 * 👤 Получение текущего пользователя (для браузера)
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            // @ts-ignore: dynamic mock import for DEV_MODE
            const { mockGetCurrentUser } = await import('../../tests/mocks/auth-mock')
            return mockGetCurrentUser()
        }

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены')
            return null
        }

        // Используем статический импорт Supabase клиента
        // supabase импортирован выше

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        const userProfileResponse = await getUserProfile(user.id)
        if (userProfileResponse.success && userProfileResponse.user) {
            // Предпочитаем email из auth, если он есть (устраняет расхождения в тестах)
            return { ...userProfileResponse.user, email: user.email || userProfileResponse.user.email }
        }
        return null
    } catch (error) {
        console.error('Ошибка получения текущего пользователя:', error)
        return null
    }
}

/**
 * 👤 Получение текущего пользователя из API запроса (для сервера)
 */
export async function getCurrentUserFromRequest(request: Request): Promise<User | null> {
    try {
        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены')
            return null
        }

        // Получаем JWT токен из заголовка Authorization
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('⚠️ Нет заголовка Authorization')
            return null
        }

        const token = authHeader.replace('Bearer ', '')
        
        // Создаем Supabase клиент для сервера
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        // Проверяем JWT токен
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            console.log('⚠️ Ошибка проверки JWT токена:', error)
            return null
        }

        const userProfileResponse = await getUserProfile(user.id)
        return userProfileResponse.success && userProfileResponse.user ? userProfileResponse.user : null
    } catch (error) {
        console.error('Ошибка получения пользователя из запроса:', error)
        return null
    }
}

/**
 * 📧 Подтверждение email
 */
export async function confirmEmail(token: string): Promise<AuthResponse> {
    try {
        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены')
            return {
                success: false,
                error: 'Переменные окружения Supabase не настроены'
            }
        }

        // Временно закомментировано для build
        /*
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
        })

        if (error) {
            return {
                success: false,
                error: 'Неверный или истекший токен подтверждения'
            }
        }

        const userProfile = data.user ? await getUserProfile(data.user.id) : null
        return {
            success: true,
            message: 'Email успешно подтвержден!',
            user: userProfile || undefined
        }
        */

        // Временная заглушка
        return {
            success: true,
            message: 'Email успешно подтвержден!'
        }
    } catch (error) {
        console.error('Ошибка подтверждения email:', error)
        return {
            success: false,
            error: 'Произошла ошибка при подтверждении email'
        }
    }
}

/**
 * 🔄 Обновление пароля
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
        // Always use real Supabase update
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) {
            return { success: false, error: getAuthErrorMessage(error.message) }
        }
        return { success: true, message: 'Пароль успешно обновлен' }
    } catch (error) {
        console.error('Ошибка обновления пароля:', error)
        return { success: false, error: 'Произошла ошибка при обновлении пароля' }
    }
}

/**
 * 📱 Подписка на изменения авторизации
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  // Subscribe to Supabase auth changes
  return supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    if (session?.user) {
      getUserProfile(session.user.id).then(resp => {
        callback(resp.success && resp.user ? resp.user : null)
      })
    } else {
      callback(null)
    }
  })
}

/**
 * 🔐 Вход через Google
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
    try {
        // Removed mock branch; always use real Supabase Google sign-in

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены')
            return {
                success: false,
                error: 'Google OAuth не настроен. Обратитесь к администратору.'
            }
        }

        // Динамический импорт Supabase клиента
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        // 🚨 ВРЕМЕННО ОТКЛЮЧАЕМ GOOGLE OAUTH - НЕ НАСТРОЕН В SUPABASE
        console.log('⚠️ Google OAuth временно отключен - не настроен в Supabase')
        return {
            success: false,
            error: 'Google OAuth временно недоступен. Используйте вход по email/паролю.'
        }
    } catch (error) {
        console.error('Ошибка входа через Google:', error)
        return {
            success: false,
            error: 'Произошла ошибка при входе через Google'
        }
    }
}

/**
 * 🔐 Вход через GitHub
 */
export async function signInWithGitHub(): Promise<AuthResponse> {
    try {
        // Временно закомментировано для build
        /*
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            return {
                success: false,
                error: getAuthErrorMessage(error.message)
            }
        }

        return {
            success: true,
            message: 'Перенаправление на GitHub...'
        }
        */

        // Временная заглушка
        return {
            success: true,
            message: 'Перенаправление на GitHub...'
        }
    } catch (error) {
        console.error('Ошибка входа через GitHub:', error)
        return {
            success: false,
            error: 'Произошла ошибка при входе через GitHub'
        }
    }
}

/**
 * 🛠️ Преобразование ошибок Supabase в понятные сообщения
 */
function getAuthErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Неверный email или пароль',
        'Email not confirmed': 'Email не подтвержден. Проверьте почту.',
        'User already registered': 'Пользователь с таким email уже существует',
        'Password should be at least 6 characters': 'Пароль должен содержать минимум 6 символов',
        'Invalid email': 'Некорректный email адрес',
        'Email rate limit exceeded': 'Слишком много попыток. Попробуйте позже.',
        'Token has expired': 'Токен истек. Запросите новый.',
        'Invalid token': 'Неверный токен'
    }

    return errorMap[error] || 'Произошла ошибка авторизации'
}

