'use client'

import { AuthModal, useAuth } from '@/components/auth/AuthModal'
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
  User,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Используем хук авторизации
  const { user, isAuthModalOpen, openAuthModal, closeAuthModal, signOut, isAuthenticated } = useAuth()

  // Обработка авторизации с выбранным планом
  useEffect(() => {
    if (isAuthenticated && selectedPlan && !isAuthModalOpen) {
      console.log('✅ Пользователь авторизован, переходим к оплате плана:', selectedPlan)
      // Небольшая задержка для обновления состояния
      setTimeout(() => {
        handleSubscriptionFlow(selectedPlan)
        setSelectedPlan(null) // Сбрасываем выбранный план
      }, 100)
    }
  }, [isAuthenticated, selectedPlan, isAuthModalOpen])

  // Валидация email в реальном времени
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Очищаем статус при изменении email
    if (subscriptionStatus.type) {
      setSubscriptionStatus({ type: null, message: '' })
    }

    // Валидация в реальном времени
    if (value.trim() && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        setSubscriptionStatus({
          type: 'error',
          message: 'Введите корректный email'
        })
      }
    }
  }

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Fallback: показываем кнопку через 3 секунды если событие не сработало
    const fallbackTimer = setTimeout(() => {
      if (!isInstallable) {
        console.log('🔄 Fallback: показываем кнопку PWA без события beforeinstallprompt')
        setIsInstallable(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(fallbackTimer)
    }
  }, [isInstallable])

  const handleInstallClick = async () => {
    if (typeof window === 'undefined') return

    // Определяем платформу пользователя
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = {
      isAndroid: /android/.test(userAgent),
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isWindows: /windows/.test(userAgent),
      isMac: /macintosh|mac os x/.test(userAgent),
      isLinux: /linux/.test(userAgent) && !/android/.test(userAgent)
    }

    console.log('🔍 Платформа пользователя:', platform)

    // Для мобильных устройств - используем PWA
    if (platform.isAndroid || platform.isIOS) {
      if (deferredPrompt) {
        try {
          console.log('📱 Запуск PWA установки для мобильного устройства')
          deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice

          if (outcome === 'accepted') {
            console.log('✅ PWA установлено на мобильное устройство')
            setDeferredPrompt(null)
            setIsInstallable(false)
          } else {
            console.log('❌ Пользователь отклонил PWA установку')
          }
        } catch (error: any) {
          console.error('❌ Ошибка PWA установки:', error)

          // Fallback для iOS - показываем инструкции
          if (platform.isIOS) {
            alert('📱 Для установки на iOS:\n1. Нажмите кнопку "Поделиться" в Safari\n2. Выберите "Добавить на главный экран"')
          }
        }
      } else {
        // Показываем инструкции для ручной установки
        if (platform.isIOS) {
          alert('📱 Для установки на iOS:\n1. Откройте в Safari\n2. Нажмите "Поделиться"\n3. Выберите "Добавить на главный экран"')
        } else if (platform.isAndroid) {
          alert('📱 Для установки на Android:\n1. Откройте в Chrome\n2. Нажмите меню (⋮)\n3. Выберите "Установить приложение"')
        }
      }
      return
    }

    // Для десктопа - предлагаем скачать нативное приложение
    let downloadUrl = ''
    let fileName = ''

    if (platform.isWindows) {
      // В будущем здесь будет ссылка на .exe файл
      downloadUrl = '/downloads/PersonalProductivityAI-Setup.exe'
      fileName = 'PersonalProductivityAI-Setup.exe'
      console.log('💻 Windows: Подготовка .exe установщика')
    } else if (platform.isMac) {
      // В будущем здесь будет ссылка на .dmg файл
      downloadUrl = '/downloads/PersonalProductivityAI.dmg'
      fileName = 'PersonalProductivityAI.dmg'
      console.log('🍎 macOS: Подготовка .dmg установщика')
    } else if (platform.isLinux) {
      // В будущем здесь будет ссылка на .deb/.AppImage файл
      downloadUrl = '/downloads/PersonalProductivityAI.AppImage'
      fileName = 'PersonalProductivityAI.AppImage'
      console.log('🐧 Linux: Подготовка AppImage установщика')
    }

    // Пока нативные приложения не готовы - используем PWA для десктопа
    if (deferredPrompt) {
      try {
        console.log('🖥️ Запуск PWA установки для десктопа')
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          console.log('✅ PWA установлено на десктоп')
          setDeferredPrompt(null)
          setIsInstallable(false)
        }
      } catch (error: any) {
        console.error('❌ Ошибка PWA установки:', error)
      }
    } else {
      // Показываем сообщение о будущих нативных приложениях
      alert(`🚀 Нативное приложение для вашей платформы будет доступно в следующих обновлениях!\n\nПока вы можете:\n• Добавить сайт в закладки\n• Использовать веб-версию\n• Подписаться на уведомления о релизе`)
    }
  }

  const scrollToSubscription = () => {
    console.log('🔍 scrollToSubscription вызван')
    // Проверяем, что мы в браузере (не на сервере)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      console.log('✅ Браузерная среда подтверждена')

      // Добавляем небольшую задержку для гидрации
      setTimeout(() => {
        const subscriptionSection = document.getElementById('subscription-form')
        if (subscriptionSection) {
          console.log('✅ Секция найдена, выполняю прокрутку')
          subscriptionSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        } else {
          console.log('❌ Секция subscription-form не найдена')
          // Fallback - прокручиваем к низу страницы
          window.scrollTo({
            top: document.body.scrollHeight - window.innerHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    } else {
      console.log('❌ Серверная среда - пропускаем прокрутку')
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

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setSubscriptionStatus({
        type: 'error',
        message: 'Введите корректный email'
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
    } catch (error: any) {
      setSubscriptionStatus({
        type: 'error',
        message: 'Ошибка сети. Проверьте подключение и попробуйте снова.'
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  // Обработчик выбора плана подписки
  const handlePlanSelect = (planId: string) => {
    console.log('🎯 Выбран план:', planId)
    
    // Если пользователь не авторизован, показываем модальное окно входа
    if (!isAuthenticated) {
      // Сохраняем выбранный план для после авторизации
      setSelectedPlan(planId)
      openAuthModal('login')
      return
    }

    // Если пользователь авторизован, переходим к оплате
    handleSubscriptionFlow(planId)
  }

  // Обработчик потока подписки
  const handleSubscriptionFlow = async (planId: string) => {
    console.log('💳 Начинаем процесс подписки для плана:', planId)
    
    try {
      // Создаем checkout сессию
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/planner?payment=success&plan=${planId}`,
          cancelUrl: `${window.location.origin}/?canceled=true`
        })
      })

      const result = await response.json()

      if (result.success) {
        // Перенаправляем на страницу оплаты
        window.location.href = result.data.url || `/planner?plan=${planId}`
      } else {
        console.error('Ошибка создания checkout сессии:', result.error)
        // Fallback - переходим на планировщик
        window.location.href = `/planner?plan=${planId}`
      }
    } catch (error) {
      console.error('Ошибка при создании подписки:', error)
      // Fallback - переходим на планировщик
      window.location.href = `/planner?plan=${planId}`
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

            <div className="flex items-center gap-4 relative z-10">
              <Link
                href="/planner"
                className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                data-testid="planner-link"
              >
                Планировщик
              </Link>
              <Link
                href="/roadmap"
                className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                data-testid="roadmap-link"
              >
                Roadmap
              </Link>
              {/* Кнопка авторизации */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.name || user?.email}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="relative z-10"
                    data-testid="logout-button"
                  >
                    Выйти
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal('login')}
                  className="relative z-10"
                  data-testid="login-button"
                >
                  Войти
                </Button>
              )}
              {isInstallable && (
                <Button
                  type="button"
                  onClick={handleInstallClick}
                  size="sm"
                  className="relative z-20"
                  data-testid="install-app-button"
                >
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
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Personal Productivity AI
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
                Умный планировщик задач с ИИ-ассистентом, который превратит хаос в систему за 5 минут.
                Автоматизация рутины, обучение планированию, умные предложения.
              </p>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="text-indigo-800 font-medium text-center">
                  🚀 <strong>Релиз запланирован на Q4 2026</strong> • Сейчас идет активная разработка
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/planner">
                  <Button
                    type="button"
                    size="lg"
                    className="text-lg px-8 py-4 bg-indigo-600 hover:bg-indigo-700"
                    data-testid="planner-button"
                  >
                    🧠 Планировщик
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  onClick={scrollToSubscription}
                  size="lg"
                  className="text-lg px-8 py-4 bg-orange-600 hover:bg-orange-700"
                  data-testid="notify-release-button"
                >
                  🔔 Уведомить о релизе
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const pricingSection = document.querySelector('[data-testid="pricing-section"]')
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                  }}
                  size="lg"
                  className="text-lg px-8 py-4"
                  data-testid="pricing-button"
                >
                  💰 Посмотреть цены
                </Button>
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

          {/* Pricing Section */}
          <section className="py-20" data-testid="pricing-section">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Тарифные планы
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Выберите подходящий план для ваших потребностей
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="card text-center" data-testid="plan-free">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">0 ₽</div>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>До 50 задач в месяц</li>
                  <li>Базовое планирование</li>
                  <li>Email поддержка</li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  data-testid="select-free-plan"
                  onClick={() => handlePlanSelect('free')}
                >
                  Выбрать Free
                </Button>
              </div>

              {/* Premium Plan */}
              <div className="card text-center border-indigo-200 bg-indigo-50" data-testid="plan-premium">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">999 ₽<span className="text-sm font-normal text-gray-500">/мес</span></div>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>До 500 задач в месяц</li>
                  <li>ИИ планировщик</li>
                  <li>Приоритетная поддержка</li>
                </ul>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700" 
                  data-testid="select-premium-plan"
                  onClick={() => handlePlanSelect('premium')}
                >
                  Выбрать Premium
                </Button>
                {/* Кнопки оплаты через Тинькофф */}
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const r = await fetch('/api/tinkoff/test-payment', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: 99900, description: 'Подписка Premium', planId: 'premium' })
                        })
                        const j = await r.json()
                        if (j?.data?.paymentUrl) {
                          // Прямой переход в этой вкладке, чтобы исключить блокировку попапов
                          window.location.href = j.data.paymentUrl
                        } else if (j?.error) {
                          alert(`Ошибка тестового платежа: ${j.error}`)
                        }
                      } catch (e: any) {
                        alert(`Ошибка сети: ${e?.message || e}`)
                      }
                    }}
                  >
                    Тестовая оплата (Тинькофф)
                  </Button>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        const r = await fetch('/api/tinkoff/live-payment', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: 99900, description: 'Подписка Premium', planId: 'premium' })
                        })
                        const j = await r.json()
                        if (j?.data?.paymentUrl) {
                          window.location.href = j.data.paymentUrl
                        } else if (j?.error) {
                          alert(`Ошибка платежа: ${j.error}`)
                        }
                      } catch (e: any) {
                        alert(`Ошибка сети: ${e?.message || e}`)
                      }
                    }}
                  >
                    Живая оплата (Тинькофф)
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="card text-center" data-testid="plan-pro">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">1999 ₽<span className="text-sm font-normal text-gray-500">/мес</span></div>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>Неограниченно</li>
                  <li>Все ИИ модели</li>
                  <li>Персональный менеджер</li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  data-testid="select-pro-plan"
                  onClick={() => handlePlanSelect('pro')}
                >
                  Выбрать Pro
                </Button>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="subscription-form" className="py-20 pointer-events-none">
            <div className="card bg-gradient-to-r from-orange-600 to-red-600 text-white text-center pointer-events-auto">
              <h2 className="text-3xl font-bold mb-4">
                Хотите первыми узнать о релизе?
              </h2>
              <p className="text-lg mb-8 opacity-90 pointer-events-none">
                Подпишитесь на уведомления и получите эксклюзивный ранний доступ к Personal AI
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 pointer-events-auto" data-testid="subscription-form">
                <input
                  type="email"
                  placeholder="Ваш email для уведомлений"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubscribing}
                  className="px-4 py-3 rounded-lg text-gray-900 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="email-input"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  disabled={isSubscribing}
                  className="text-lg px-8 py-3 bg-white text-orange-600 hover:bg-gray-50 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="subscribe-button"
                >
                  {isSubscribing ? '⏳ Подписываем...' : '🔔 Подписаться'}
                </Button>
              </form>

              {/* Статус подписки */}
              {subscriptionStatus.type && (
                <div className={`mb-4 p-3 rounded-lg text-center ${subscriptionStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                  }`} data-testid="subscription-status">
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

      {/* Модальное окно авторизации */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode="login"
        onSuccess={() => {
          console.log('✅ Авторизация успешна')
        }}
      />
    </MobileOptimized>
  )
}
