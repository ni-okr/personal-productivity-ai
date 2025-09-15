'use client'

import { getCurrentUser, onAuthStateChange } from '@/lib/auth'
import { useAppStore } from '@/stores/useAppStore'
import { User } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuth() {
    const { user, setUser, clearUserData } = useAppStore()
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let mounted = true

        // Получаем текущего пользователя при загрузке
        const initAuth = async () => {
            try {
                const currentUser = await getCurrentUser()
                if (mounted) {
                    setUser(currentUser)
                }
            } catch (error) {
                console.error('Ошибка инициализации авторизации:', error)
                if (mounted) {
                    clearUserData()
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        initAuth()

        // Подписываемся на изменения авторизации
        const { data: { subscription } } = onAuthStateChange((user: User | null) => {
            if (mounted) {
                setUser(user)
                setIsLoading(false)
            }
        })

        return () => {
            mounted = false
            if (subscription && typeof (subscription as any).unsubscribe === 'function') {
                (subscription as any).unsubscribe()
            }
        }
    }, [setUser, clearUserData])

    const requireAuth = (redirectTo = '/') => {
        if (!isLoading && !user) {
            router.push(redirectTo)
        }
    }

    const requireGuest = (redirectTo = '/') => {
        if (!isLoading && user) {
            router.push(redirectTo)
        }
    }

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        requireAuth,
        requireGuest
    }
}
