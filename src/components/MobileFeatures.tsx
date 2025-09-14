'use client'

import { motion } from 'framer-motion'
import { Download, Smartphone, Wifi, Zap } from 'lucide-react'

interface MobileFeature {
    icon: React.ReactNode
    title: string
    description: string
}

const features: MobileFeature[] = [
    {
        icon: <Smartphone className="w-8 h-8" />,
        title: 'Адаптивный дизайн',
        description: 'Идеально работает на всех устройствах от смартфонов до планшетов'
    },
    {
        icon: <Download className="w-8 h-8" />,
        title: 'PWA поддержка',
        description: 'Установите как нативное приложение прямо из браузера'
    },
    {
        icon: <Wifi className="w-8 h-8" />,
        title: 'Офлайн режим',
        description: 'Продолжайте работать даже без интернет-соединения'
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: 'Быстрая загрузка',
        description: 'Молниеносная скорость загрузки и отзывчивый интерфейс'
    }
]

export default function MobileFeatures() {
    return (
        <section
            className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"
            data-testid="mobile-optimized"
            role="region"
            aria-labelledby="mobile-features-heading"
        >
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2
                        id="mobile-features-heading"
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        📱 Мобильная оптимизация
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Наше приложение создано с учетом мобильного опыта.
                        Получите полную функциональность в удобном мобильном формате.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                // Здесь можно добавить логику клика
                                console.log(`Clicked on ${feature.title}`)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    console.log(`Activated ${feature.title}`)
                                }
                            }}
                        >
                            <div className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Дополнительная информация */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            🚀 Готовы к мобильному будущему?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Наше приложение использует современные веб-технологии для создания
                            нативного мобильного опыта прямо в браузере.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Service Worker
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Web App Manifest
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Push Notifications
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Offline Storage
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
