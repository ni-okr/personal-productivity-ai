'use client'

import { MobileOptimized } from '@/components/MobileOptimized'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Brain,
    Calendar,
    CheckCircle,
    Rocket,
    Star,
    Target,
    Users,
    Zap
} from 'lucide-react'
import Link from 'next/link'

interface RoadmapItem {
    quarter: string
    period: string
    status: 'completed' | 'in-progress' | 'planned'
    title: string
    description: string
    features: string[]
    icon: any
    color: string
}

const roadmapData: RoadmapItem[] = [
    {
        quarter: 'Q3 2024',
        period: 'Июль - Сентябрь 2024',
        status: 'completed',
        title: 'Фундамент и MVP',
        description: 'Создание базовой архитектуры и первых функций',
        features: [
            'Landing page с анонсом',
            'PWA манифест и мобильная адаптация',
            'Система подписок на уведомления',
            'Базовая архитектура приложения',
            'Интеграция с Supabase'
        ],
        icon: Rocket,
        color: 'from-green-500 to-emerald-600'
    },
    {
        quarter: 'Q4 2024',
        period: 'Октябрь - Декабрь 2024',
        status: 'in-progress',
        title: 'Основные функции ИИ',
        description: 'Разработка ядра ИИ-ассистента и базовых возможностей',
        features: [
            'ИИ-планировщик задач',
            'Автоматическое создание расписания',
            'Умные напоминания',
            'Анализ продуктивности',
            'Базовая интеграция с календарем'
        ],
        icon: Brain,
        color: 'from-blue-500 to-indigo-600'
    },
    {
        quarter: 'Q1 2025',
        period: 'Январь - Март 2025',
        status: 'planned',
        title: 'Интеграции и автоматизация',
        description: 'Подключение внешних сервисов и расширенная автоматизация',
        features: [
            'Интеграция с Gmail/Outlook',
            'Автоматическое создание задач из писем',
            'Синхронизация с Google Calendar',
            'Интеграция с Telegram',
            'API для сторонних приложений'
        ],
        icon: Zap,
        color: 'from-purple-500 to-violet-600'
    },
    {
        quarter: 'Q2 2025',
        period: 'Апрель - Июнь 2025',
        status: 'planned',
        title: 'Персонализация и обучение',
        description: 'Адаптация под пользователя и машинное обучение',
        features: [
            'Персональные паттерны продуктивности',
            'ИИ-коуч для обучения планированию',
            'Адаптивные рекомендации',
            'Анализ эффективности',
            'Персональные метрики'
        ],
        icon: Target,
        color: 'from-orange-500 to-red-600'
    },
    {
        quarter: 'Q3 2025',
        period: 'Июль - Сентябрь 2025',
        status: 'planned',
        title: 'Командная работа',
        description: 'Функции для команд и совместной работы',
        features: [
            'Командные проекты',
            'Делегирование задач',
            'Общие календари',
            'Аналитика команды',
            'Интеграция с Slack/Teams'
        ],
        icon: Users,
        color: 'from-teal-500 to-cyan-600'
    },
    {
        quarter: 'Q4 2025',
        period: 'Октябрь - Декабрь 2025',
        status: 'planned',
        title: 'Полный релиз',
        description: 'Финальная версия со всеми функциями',
        features: [
            'Расширенная аналитика',
            'Мобильные приложения (iOS/Android)',
            'Офлайн режим',
            'Экспорт данных',
            'Премиум функции'
        ],
        icon: Star,
        color: 'from-pink-500 to-rose-600'
    }
]

export default function RoadmapPage() {
    return (
        <MobileOptimized>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                {/* Header */}
                <header className="container py-6">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Назад
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">Personal AI</span>
                            </div>
                        </div>
                    </nav>
                </header>

                {/* Hero */}
                <main className="container">
                    <section className="text-center py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <Calendar className="w-4 h-4" />
                                Roadmap разработки
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Путь к революции в
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {' '}продуктивности
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                                Следите за нашим прогрессом в создании ИИ-ассистента, который изменит ваш подход к планированию и продуктивности
                            </p>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                                <p className="text-orange-800 font-medium text-center">
                                    🎯 <strong>Текущий этап:</strong> Q4 2024 - Разработка основных функций ИИ
                                </p>
                            </div>
                        </motion.div>
                    </section>

                    {/* Roadmap Timeline */}
                    <section className="py-12">
                        <div className="max-w-4xl mx-auto">
                            {roadmapData.map((item, index) => (
                                <motion.div
                                    key={item.quarter}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="relative mb-12 last:mb-0"
                                >
                                    {/* Timeline line */}
                                    {index < roadmapData.length - 1 && (
                                        <div className="absolute left-8 top-20 w-0.5 h-32 bg-gray-200 z-0" />
                                    )}

                                    <div className="flex items-start gap-6">
                                        {/* Icon */}
                                        <div className={`relative z-10 w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <item.icon className="w-8 h-8 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="card">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-sm font-medium text-gray-500">{item.period}</span>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : item.status === 'in-progress'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {item.status === 'completed' && '✅ Завершено'}
                                                        {item.status === 'in-progress' && '🔄 В процессе'}
                                                        {item.status === 'planned' && '📋 Запланировано'}
                                                    </div>
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                    {item.quarter}: {item.title}
                                                </h3>

                                                <p className="text-gray-600 mb-4">
                                                    {item.description}
                                                </p>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">Ключевые функции:</h4>
                                                    <ul className="space-y-1">
                                                        {item.features.map((feature, featureIndex) => (
                                                            <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                                                <CheckCircle className={`w-4 h-4 ${item.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                                                                    }`} />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="py-16">
                        <div className="card bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                Хотите быть в курсе прогресса?
                            </h2>
                            <p className="text-lg mb-8 opacity-90">
                                Подпишитесь на уведомления и узнавайте о каждом важном обновлении первыми
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="text-lg px-8 py-3 bg-white text-indigo-600 hover:bg-gray-50"
                                    >
                                        🔔 Подписаться на уведомления
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="text-lg px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-indigo-600"
                                >
                                    📧 Связаться с нами
                                </Button>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="container py-12 border-t border-gray-200">
                    <div className="text-center text-gray-600">
                        <p>&copy; 2024 Personal Productivity AI. Превращаем планы в реальность.</p>
                        <p className="text-sm mt-2 opacity-75">
                            🚀 Roadmap обновляется ежемесячно • Следите за прогрессом
                        </p>
                    </div>
                </footer>
            </div>
        </MobileOptimized>
    )
}
