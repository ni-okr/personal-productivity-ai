// 🔐 Система авторизации с Supabase Auth
import { supabase } from './supabase'

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

export interface AuthResponse {
    success: boolean
    user?: AuthUser
    error?: string
    message?: string
}

/**
 * 📝 Регистрация нового пользователя
 */
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
    try {
        // 1. Создаем пользователя в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        })

        if (authError) {
            return {
                success: false,
                error: getAuthErrorMessage(authError.message)
            }
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'Не удалось создать пользователя'
            }
        }

        // 2. Создаем профиль пользователя в нашей таблице users
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: authData.user.email,
                name: name,
                subscription: 'free',
                created_at: new Date().toISOString(),
                last_login_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Ошибка создания профиля:', profileError)
            // Не критично, профиль можно создать позже
        }

        return {
            success: true,
            message: authData.user.email_confirmed_at
                ? 'Регистрация успешна! Добро пожаловать!'
                : 'Проверьте email для подтверждения регистрации',
            user: authData.user.email_confirmed_at ? {
                id: authData.user.id,
                email: authData.user.email!,
                name: name,
                subscription: 'free',
                createdAt: new Date(),
                lastLoginAt: new Date()
            } : undefined
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error)
        return {
            success: false,
            error: 'Произошла ошибка при регистрации'
        }
    }
}

/**
 * 🚪 Вход пользователя
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
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
        await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id)

        // Получаем полный профиль пользователя
        const userProfile = await getUserProfile(data.user.id)

        return {
            success: true,
            message: 'Добро пожаловать!',
            user: userProfile ?? {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || 'Пользователь',
                subscription: 'free',
                createdAt: new Date(),
                lastLoginAt: new Date()
            }
        }
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
export async function getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error || !data) {
            console.error('Ошибка получения профиля:', error)
            return null
        }

        return {
            id: data.id,
            email: data.email,
            name: data.name,
            subscription: data.subscription || 'free',
            createdAt: new Date(data.created_at),
            lastLoginAt: new Date(data.last_login_at)
        }
    } catch (error) {
        console.error('Ошибка получения профиля:', error)
        return null
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
        const { data, error } = await supabase
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
                subscription: data.subscription,
                createdAt: new Date(data.created_at),
                lastLoginAt: new Date(data.last_login_at)
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
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
 * 👤 Получение текущего пользователя
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        return await getUserProfile(user.id)
    } catch (error) {
        console.error('Ошибка получения текущего пользователя:', error)
        return null
    }
}

/**
 * 📧 Подтверждение email
 */
export async function confirmEmail(token: string): Promise<AuthResponse> {
    try {
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
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            return {
                success: false,
                error: getAuthErrorMessage(error.message)
            }
        }

        return {
            success: true,
            message: 'Пароль успешно обновлен'
        }
    } catch (error) {
        console.error('Ошибка обновления пароля:', error)
        return {
            success: false,
            error: 'Произошла ошибка при обновлении пароля'
        }
    }
}

/**
 * 📱 Подписка на изменения авторизации
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const userProfile = await getUserProfile(session.user.id)
            callback(userProfile)
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
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
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
            message: 'Перенаправление на Google...'
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
