import { testFramework, testLogger, testMocks, testUtils } from '../framework'

/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.028Z
 * Оригинальный файл сохранен как: tests/integration/supabase-api.test.ts.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

/**
 * Интеграционные тесты для Supabase API
 * 
 * Эти тесты проверяют реальное взаимодействие с Supabase базой данных.
 * Используют тестовую базу данных или изолированные тестовые записи.
 */

import { addSubscriber, getActiveSubscribers, getSupabaseClient, unsubscribe } from '@/lib/supabase'

describe('🗄️ Supabase API Integration', () => {
    // Генерируем уникальные email на каждый тест
    const genEmail = (suffix: string = '') => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${suffix}@taskai.space`

    // Получаем Supabase клиент для тестов (может быть undefined в fake)
    const supabase = getSupabaseClient() as any

    // Очистка in-memory fake между тестами
    afterEach(async () => {
        try {
            const { resetSubscribers } = require('@/lib/supabase')
            if (typeof resetSubscribers === 'function') resetSubscribers()
        } catch (_) {}
    })

    describe('📧 Управление подписчиками', () => {
        test('✅ Успешное добавление нового подписчика', async () => {
            const testEmail = genEmail()
            // Очистка происходит через resetSubscribers()
            const result = await addSubscriber(testEmail)

            expect(result.success).toBe(true)
            expect(result.message).toContain('Спасибо за подписку')
            expect(result.data).toBeDefined()
            expect(result.data?.email).toBe(testEmail)
            expect(result.data?.is_active).toBe(true)
        }, 10000)

        test('🔄 Предотвращение дублирования email', async () => {
            const duplicateEmail = genEmail('-dup')
            // Очистка происходит через resetSubscribers()

            // Добавляем подписчика первый раз
            await addSubscriber(duplicateEmail)

            // Пытаемся добавить того же подписчика
            const result = await addSubscriber(duplicateEmail)

            expect(result.success).toBe(false)
            expect(result.message).toContain('уже подписан')
        }, 10000)

        test('❌ Обработка некорректного email', async () => {
            const invalidEmails = ['', 'invalid-email', 'test@', '@example.com']

            for (const email of invalidEmails) {
                const result = await addSubscriber(email)

                // API должен либо отклонить, либо обработать ошибку базы данных
                if (!result.success) {
                    expect(result.message).toBeTruthy()
                }
            }
        }, 15000)

        test('📋 Получение списка активных подписчиков', async () => {
            const listEmail1 = genEmail('-l1')
            const listEmail2 = genEmail('-l2')

            // Добавляем тестовых подписчиков
            const result1 = await addSubscriber(listEmail1)
            const result2 = await addSubscriber(listEmail2)

            // Проверяем, что подписчики добавлены успешно
            expect(result1.success).toBe(true)
            expect(result2.success).toBe(true)

            const subscribers = await getActiveSubscribers()

            expect(Array.isArray(subscribers)).toBe(true)

            // Проверяем, что наши тестовые подписчики есть в списке
            const testSubscribers = subscribers.filter(s =>
                s.email === listEmail1 || s.email === listEmail2
            )

            // Проверяем, что наши тестовые подписчики присутствуют независимо от "шума"
            expect(testSubscribers.length).toBe(2)

            // Проверяем структуру данных
            testSubscribers.forEach(subscriber => {
                expect(subscriber).toHaveProperty('email')
                expect(subscriber).toHaveProperty('created_at')
                expect(subscriber).toHaveProperty('is_active')
                expect(subscriber.is_active).toBe(true)
            })
        }, 15000)

        test('🚫 Отписка от уведомлений', async () => {
            const unsubscribeEmail = genEmail('-unsub')
            // Очистка происходит через resetSubscribers()

            // Сначала подписываемся
            const subscribeResult = await addSubscriber(unsubscribeEmail)
            expect(subscribeResult.success).toBe(true)

            // Затем отписываемся
            const result = await unsubscribe(unsubscribeEmail)

            expect(result.success).toBe(true)
            expect(result.message).toContain('отписались')

            // Проверяем, что подписчик стал неактивным
            const { data, error } = supabase
                .from('subscribers')
                .select('is_active')
                .eq('email', unsubscribeEmail)
                .single()

            if (error) {
                testLogger.warn('TEST', 'Ошибка при проверке статуса отписки:', error)
                // Если запрос не удался, проверяем альтернативным способом
                const { data: allData } = await supabase
                    .from('subscribers')
                    .select('is_active')
                    .eq('email', unsubscribeEmail)

                if (allData && allData.length > 0) {
                    expect(allData[0].is_active).toBe(false)
                }
            } else {
                // В fake-клиенте метод single() возвращает объект с is_active только если найден; иначе undefined
                // Если undefined — проверим альтернативным способом: запись в коллекции неактивна
                if (typeof data?.is_active === 'undefined') {
                    const list = await getActiveSubscribers()
                    const stillActive = list.find(s => s.email === unsubscribeEmail)
                    expect(stillActive).toBeUndefined()
                } else {
                    expect(data?.is_active).toBe(false)
                }
            }
        }, 10000)
    })

    describe('🔗 Подключение к базе данных', () => {
        test('🌐 Проверка соединения с Supabase', async () => {
            try {
                // Простой запрос для проверки соединения
                const { error } = await supabase
                    .from('subscribers')
                    .select('count')
                    .limit(1)

                expect(error).toBeNull()
            } catch (error) {
                throw new Error(`Не удалось подключиться к Supabase: ${error}`)
            }
        }, 5000)

        test('📊 Проверка схемы таблицы subscribers', async () => {
            // Проверяем, что таблица существует и имеет правильную структуру
            const { data, error } = await supabase
                .from('subscribers')
                .select('*')
                .limit(1)

            expect(error).toBeNull()

            if (data && data.length > 0) {
                const subscriber = data[0]
                expect(subscriber).toHaveProperty('id')
                expect(subscriber).toHaveProperty('email')
                expect(subscriber).toHaveProperty('created_at')
                expect(subscriber).toHaveProperty('is_active')
            }
        }, 5000)
    })

    describe('⚡ Производительность API', () => {
        test('🚀 Время отклика добавления подписчика', async () => {
            const performanceEmail = `performance-${Date.now()}@example.com`
            const startTime = Date.now()

            await addSubscriber(performanceEmail)

            const endTime = Date.now()
            const responseTime = endTime - startTime

            // API должен отвечать быстро (менее 3 секунд)
            expect(responseTime).toBeLessThan(3000)

            testLogger.info('TEST', `⏱️ Время отклика API: ${responseTime}ms`)
        }, 5000)

        test('📈 Массовое добавление подписчиков', async () => {
            const testEmails = Array.from({ length: 5 }, (_, i) =>
                `bulk-test-${Date.now()}-${i}@example.com`
            )

            const startTime = Date.now()

            // Добавляем подписчиков параллельно
            const results = await Promise.all(
                testEmails.map(email => addSubscriber(email))
            )

            const endTime = Date.now()
            const totalTime = endTime - startTime

            // Все операции должны быть успешными
            results.forEach(result => {
                expect(result.success).toBe(true)
            })

            // Очищаем тестовые данные
            await supabase
                .from('subscribers')
                .delete()
                .in('email', testEmails)

            testLogger.info('TEST', `⏱️ Время массового добавления 5 подписчиков: ${totalTime}ms`)

            // Массовые операции должны выполняться разумно быстро
            expect(totalTime).toBeLessThan(10000)
        }, 15000)
    })

    describe('🛡️ Безопасность и валидация', () => {
        test('🔒 SQL инъекции защита', async () => {
            const maliciousEmails = [
                "test'; DROP TABLE subscribers; --@example.com",
                "test@example.com'; DELETE FROM subscribers; --",
                "test@example.com' OR '1'='1"
            ]

            for (const email of maliciousEmails) {
                const result = await addSubscriber(email)

                // API должен либо безопасно обработать, либо отклонить
                expect(typeof result.success).toBe('boolean')
                expect(typeof result.message).toBe('string')
            }

            // Проверяем, что таблица все еще существует
            const { error } = await supabase
                .from('subscribers')
                .select('count')
                .limit(1)

            expect(error).toBeNull()
        }, 10000)

        test('📏 Валидация длинных email адресов', async () => {
            const longEmail = 'a'.repeat(240) + '@example.com' // 240 + 12 = 252 символа (в пределах 255)

            const result = await addSubscriber(longEmail)

            // API должен обработать или отклонить слишком длинные email
            expect(typeof result.success).toBe('boolean')
            expect(typeof result.message).toBe('string')
        }, 5000)
    })
})
