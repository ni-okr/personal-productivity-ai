'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { MobileOptimized, mobileUtils } from '@/components/MobileOptimized'
import { 
  Brain, 
  Calendar, 
  Mail, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  Smartphone
} from 'lucide-react'

export default function HomePage() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

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
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Превратите хаос в систему за 5 минут
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Персональный
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {' '}ИИ-ассистент{' '}
              </span>
              для продуктивности
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
              Автоматизируем рутину, обучаем планированию, предлагаем решения. 
              Для тех, кто устал от хаоса и хочет фокусироваться на важном.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-4">
                Начать бесплатно
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="ghost" size="lg" className="text-lg px-8 py-4">
                Посмотреть демо
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              7 дней полного доступа • Без кредитной карты
            </p>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Решаем ваши главные проблемы
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы знаем эти боли, потому что сами через них прошли
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
          <div className="card bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Готовы превратить хаос в систему?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Присоединяйтесь к тысячам людей, которые уже нашли свою систему продуктивности
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-indigo-600 hover:bg-gray-50"
            >
              Начать за 5 минут
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container py-12 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 Personal Productivity AI. Превращаем хаос в систему.</p>
        </div>
      </footer>
    </div>
    </MobileOptimized>
  )
}
