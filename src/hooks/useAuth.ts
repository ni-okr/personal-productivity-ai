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

        // В mock режиме просто устанавливаем isLoading = false
        if (process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true') {
            if (mounted) {
                setIsLoading(false)
            }
            return
        }

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

        // Инициализируем авторизацию и подписку
        const initAuthAndSubscription = async () => {
            await initAuth()

            // Подписываемся на изменения авторизации
            const realSubscription = await onAuthStateChange((user: User | null) => {
                if (mounted) {
                    setUser(user)
                    setIsLoading(false)
                }
            })

            return realSubscription
        }

        let subscription: any = null
        initAuthAndSubscription().then(sub => {
            subscription = sub
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
        user: process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true' ? user : user,
        isLoading: process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true' ? false : isLoading,
        isAuthenticated: !!user,
        requireAuth,
        requireGuest
    }
}
