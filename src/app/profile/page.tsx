'use client'

import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { HomeIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ProfilePage() {
    const { user, isAuthenticated, signOut } = useAuth()
    const { subscription, plan, isLoading } = useSubscription()
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(user?.name || '')

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Необходима авторизация</h1>
                    <p className="text-gray-600 mb-6">Войдите в аккаунт для доступа к профилю</p>
                    <Link href="/">
                        <Button>На главную</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const handleSaveProfile = () => {
        // TODO: Реализовать сохранение профиля
        console.log('Сохранение профиля:', editedName)
        setIsEditing(false)
    }

    const handleSignOut = async () => {
        await signOut()
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
                                <p className="text-sm text-gray-600">Управление аккаунтом</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Навигация */}
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <HomeIcon className="w-4 h-4" />
                                    Главная
                                </Link>
                                <Link href="/planner" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    Планировщик
                                </Link>
                                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <SettingsIcon className="w-4 h-4" />
                                    Настройки
                                </Link>
                            </div>

                            <Button
                                onClick={handleSignOut}
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

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Информация о профиле */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Личная информация</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Имя
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user?.name || 'Не указано'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <p className="text-gray-900">{user?.email}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Часовой пояс
                                        </label>
                                        <p className="text-gray-900">{user?.timezone || 'Europe/Moscow'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Дата регистрации
                                        </label>
                                        <p className="text-gray-900">
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    {isEditing ? (
                                        <>
                                            <Button onClick={handleSaveProfile}>
                                                Сохранить
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    setIsEditing(false)
                                                    setEditedName(user?.name || '')
                                                }}
                                            >
                                                Отмена
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setIsEditing(true)}>
                                            Редактировать
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Информация о подписке */}
                        <div>
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Подписка</h2>
                                
                                {isLoading ? (
                                    <p className="text-gray-500">Загрузка...</p>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Текущий план
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    plan?.tier === 'free' ? 'bg-gray-100 text-gray-800' :
                                                    plan?.tier === 'premium' ? 'bg-indigo-100 text-indigo-800' :
                                                    plan?.tier === 'pro' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {plan?.name || 'Free'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Статус
                                            </label>
                                            <p className="text-gray-900 capitalize">
                                                {subscription?.status || 'active'}
                                            </p>
                                        </div>

                                        {plan?.tier !== 'free' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Следующий платеж
                                                </label>
                                                <p className="text-gray-900">
                                                    {subscription?.currentPeriodEnd 
                                                        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ru-RU')
                                                        : 'Неизвестно'
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <Link href="/planner">
                                                <Button className="w-full">
                                                    Управление подпиской
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
