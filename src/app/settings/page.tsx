'use client'

import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { HomeIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SettingsPage() {
    const { user, isAuthenticated, signOut } = useAuth()
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        reminders: true
    })
    const [privacy, setPrivacy] = useState({
        profileVisible: false,
        analytics: true
    })

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SettingsIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Необходима авторизация</h1>
                    <p className="text-gray-600 mb-6">Войдите в аккаунт для доступа к настройкам</p>
                    <Link href="/">
                        <Button>На главную</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const handleSaveSettings = () => {
        // TODO: Реализовать сохранение настроек
        console.log('Сохранение настроек:', { notifications, privacy })
        alert('Настройки сохранены!')
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
                                <SettingsIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
                                <p className="text-sm text-gray-600">Персонализация приложения</p>
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
                                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <UserIcon className="w-4 h-4" />
                                    Профиль
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
                    <div className="space-y-8">
                        {/* Уведомления */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Уведомления</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Email уведомления</h3>
                                        <p className="text-sm text-gray-500">Получать уведомления на email</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Push уведомления</h3>
                                        <p className="text-sm text-gray-500">Получать уведомления в браузере</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Напоминания о задачах</h3>
                                        <p className="text-sm text-gray-500">Уведомления о приближающихся дедлайнах</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.reminders}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, reminders: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Приватность */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Приватность</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Публичный профиль</h3>
                                        <p className="text-sm text-gray-500">Разрешить другим пользователям видеть ваш профиль</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={privacy.profileVisible}
                                            onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisible: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Аналитика использования</h3>
                                        <p className="text-sm text-gray-500">Помогать улучшать продукт, отправляя анонимную статистику</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={privacy.analytics}
                                            onChange={(e) => setPrivacy(prev => ({ ...prev, analytics: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Действия */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Действия</h2>

                            <div className="space-y-4">
                                <Button onClick={handleSaveSettings} className="w-full">
                                    Сохранить настройки
                                </Button>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Опасная зона</h3>
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
                                                alert('Функция удаления аккаунта будет добавлена в следующих версиях')
                                            }
                                        }}
                                    >
                                        Удалить аккаунт
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
