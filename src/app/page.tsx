'use client'

import { MobileOptimized } from '@/components/MobileOptimized'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  Calendar,
  Clock,
  Mail,
  Sparkles,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
      }
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setSubscriptionStatus({
        type: 'error',
        message: 'Пожалуйста, введите email адрес'
      })
      return
    }

    setIsSubscribing(true)
    setSubscriptionStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSubscriptionStatus({
          type: 'success',
          message: data.message
        })
        setEmail('')
      } else {
        setSubscriptionStatus({
          type: 'error',
          message: data.error || 'Произошла ошибка при подписке'
        })
      }
    } catch (error) {
      setSubscriptionStatus({
        type: 'error',
        message: 'Ошибка сети. Проверьте подключение и попробуйте снова.'
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <MobileOptimized>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <header className="container py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Personal AI</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                Войти
              </Button>
              {isInstallable && (
                <Button onClick={handleInstallClick} size="sm">
                  Установить приложение
                </Button>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container">
          <section className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                Скоро: Революция в персональной продуктивности
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
                Встречайте
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Personal AI{' '}
                </span>
                - ваш будущий ассистент
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
                Мы создаем ИИ-ассистента, который превратит хаос в систему за 5 минут.
                Автоматизация рутины, обучение планированию, умные предложения.
              </p>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="text-indigo-800 font-medium text-center">
                  🚀 <strong>Релиз запланирован на Q4 2026</strong> • Сейчас идет активная разработка
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="text-lg px-8 py-4 bg-orange-600 hover:bg-orange-700">
                  🔔 Уведомить о релизе
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link href="/roadmap">
                  <Button variant="ghost" size="lg" className="text-lg px-8 py-4">
                    📋 Roadmap разработки
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Бесплатные уведомления • Эксклюзивный ранний доступ для подписчиков
              </p>
            </motion.div>
          </section>

          {/* Features */}
          <section className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Что будет решать Personal AI
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Мы создаем решения для самых болезненных проблем продуктивности
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: 'Расфокусировка',
                  problem: 'Берётесь за много дел одновременно?',
                  solution: 'ИИ поможет выбрать одну важную задачу и сфокусироваться на ней'
                },
                {
                  icon: Zap,
                  title: 'Рутина съедает энергию',
                  problem: 'Тратите креативность на планирование?',
                  solution: '90% автоматизации - ИИ планирует, вы творите'
                },
                {
                  icon: Clock,
                  title: 'Не умеете планировать',
                  problem: 'Хотите планировать день, но не знаете как?',
                  solution: 'ИИ-коуч обучит с нуля: от простых планов к сложным'
                },
                {
                  icon: Mail,
                  title: 'Почта отвлекает',
                  problem: 'Письма превращаются в хаос задач?',
                  solution: 'Автоматическое создание задач из писем с приоритетами'
                },
                {
                  icon: Calendar,
                  title: 'Забываете про дела',
                  problem: 'Важные задачи теряются в потоке?',
                  solution: 'Умные напоминания в нужный момент, когда вы готовы'
                },
                {
                  icon: Brain,
                  title: 'Нет системы',
                  problem: 'Каждый день начинаете с нуля?',
                  solution: 'ИИ создаёт персональную систему под ваши паттерны'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-red-600 mb-3 font-medium">
                    {feature.problem}
                  </p>
                  <p className="text-sm text-gray-600">
                    {feature.solution}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="py-20">
            <div className="card bg-gradient-to-r from-orange-600 to-red-600 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Хотите первыми узнать о релизе?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Подпишитесь на уведомления и получите эксклюзивный ранний доступ к Personal AI
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <input
                  type="email"
                  placeholder="Ваш email для уведомлений"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                  className="px-4 py-3 rounded-lg text-gray-900 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  disabled={isSubscribing}
                  className="text-lg px-8 py-3 bg-white text-orange-600 hover:bg-gray-50 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? '⏳ Подписываем...' : '🔔 Подписаться'}
                </Button>
              </form>

              {/* Статус подписки */}
              {subscriptionStatus.type && (
                <div className={`mb-4 p-3 rounded-lg text-center ${subscriptionStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                  {subscriptionStatus.message}
                </div>
              )}
              <p className="text-sm opacity-75">
                ✨ Подписчики получат скидку 50% на первый месяц
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="container py-12 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Personal Productivity AI. Скоро превратим хаос в систему.</p>
            <p className="text-sm mt-2 opacity-75">
              🚧 Сайт в разработке • Релиз Q4 2026 • Следите за обновлениями
            </p>
          </div>
        </footer>
      </div>
    </MobileOptimized>
  )
}
