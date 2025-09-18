'use client'

import { signIn, signUp, signOut, resetPassword, getCurrentUser, onAuthStateChange } from '@/lib/auth'
import { useAppStore } from '@/stores/useAppStore'
import { User } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface AuthState {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
}

export interface AuthActions {
    // Основные действия
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
    signOut: () => Promise<{ success: boolean; error?: string }>
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
    
    // OAuth
    signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
    signInWithGitHub: () => Promise<{ success: boolean; error?: string }>
    
    // Утилиты
    clearError: () => void
    refreshUser: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
    const { user, setUser, clearUserData } = useAppStore()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Инициализация авторизации
    useEffect(() => {
        const initAuth = async () => {
            try {
                setIsLoading(true)
                const currentUser = await getCurrentUser()
                if (currentUser) {
                    setUser(currentUser)
                }
            } catch (err: any) {
                console.error('Ошибка инициализации авторизации:', err)
                setError(err.message || 'Ошибка загрузки пользователя')
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()

        // Подписка на изменения авторизации
        const { data: { subscription } } = onAuthStateChange((user) => {
            setUser(user)
            setIsLoading(false)
        })

        return () => {
            subscription?.unsubscribe?.()
        }
    }, [setUser])

    // Вход
    const handleSignIn = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const result = await signIn({ email, password })
            
            if (result.success && result.user) {
                setUser(result.user)
                return { success: true }
            } else {
                setError(result.error || 'Ошибка входа')
                return { success: false, error: result.error }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Произошла ошибка при входе'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [setUser])

    // Регистрация
    const handleSignUp = useCallback(async (email: string, password: string, name: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const result = await signUp({ email, password, name })
            
            if (result.success) {
                if (result.user) {
                    setUser(result.user)
                }
                return { success: true }
            } else {
                setError(result.error || 'Ошибка регистрации')
                return { success: false, error: result.error }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Произошла ошибка при регистрации'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [setUser])

    // Выход
    const handleSignOut = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const result = await signOut()
            
            if (result.success) {
                clearUserData()
                router.push('/')
                return { success: true }
            } else {
                setError(result.error || 'Ошибка выхода')
                return { success: false, error: result.error }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Произошла ошибка при выходе'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [clearUserData, router])

    // Сброс пароля
    const handleResetPassword = useCallback(async (email: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const result = await resetPassword(email)
            
            if (result.success) {
                return { success: true }
            } else {
                setError(result.error || 'Ошибка сброса пароля')
                return { success: false, error: result.error }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Произошла ошибка при сбросе пароля'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // OAuth входы
    const handleSignInWithGoogle = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const { signInWithGoogle } = await import('@/lib/auth')
            const result = await signInWithGoogle()
            
            if (result.success) {
                if (result.user) {
                    setUser(result.user)
                }
                return { success: true }
            } else {
                setError(result.error || 'Ошибка входа через Google')
                return { success: false, error: result.error }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Произошла ошибка при входе через Google'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [setUser])

    const handleSignInWithGitHub = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const { signInWithGitHub } = await import('@/lib/auth')
            const result = await signInWithGitHub()
            
            if (result.success) {
                return { success: true }
            } else {
                setError(result.error || 'Ошибка входа через GitHub')
                return { success: false, error: result.error }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Произошла ошибка при входе через GitHub'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Утилиты
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const refreshUser = useCallback(async () => {
        try {
            setIsLoading(true)
            const currentUser = await getCurrentUser()
            if (currentUser) {
                setUser(currentUser)
            }
        } catch (err: any) {
            console.error('Ошибка обновления пользователя:', err)
            setError(err.message || 'Ошибка обновления пользователя')
        } finally {
            setIsLoading(false)
        }
    }, [setUser])

    return {
        // Состояние
        user,
        isLoading,
        isAuthenticated: !!user,
        error,

        // Действия
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithGitHub: handleSignInWithGitHub,
        clearError,
        refreshUser
    }
}