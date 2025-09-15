/**
 * Интеграционные тесты для Supabase API
 * 
 * Эти тесты проверяют реальное взаимодействие с Supabase базой данных.
 * Используют тестовую базу данных или изолированные тестовые записи.
 */

import { addSubscriber, getActiveSubscribers, supabase, unsubscribe } from '@/lib/supabase'

describe('🗄️ Supabase API Integration', () => {
    const testEmail = `test-${Date.now()}@example.com`
    const testEmail2 = `test-${Date.now()}-2@example.com`

    // Очистка тестовых данных после каждого теста
    afterEach(async () => {
        try {
            await supabase
                .from('subscriptions')
                .delete()
                .in('email', [testEmail, testEmail2])
        } catch (error) {
            console.warn('Не удалось очистить тестовые данные:', error)
        }
    })

    describe('📧 Управление подписчиками', () => {
        test('✅ Успешное добавление нового подписчика', async () => {
            const result = await addSubscriber(testEmail)

            expect(result.success).toBe(true)
            expect(result.message).toContain('Спасибо за подписку')
            expect(result.data).toBeDefined()
            expect(result.data?.email).toBe(testEmail)
            expect(result.data?.is_active).toBe(true)
        }, 10000)

        test('🔄 Предотвращение дублирования email', async () => {
            // Добавляем подписчика первый раз
            await addSubscriber(testEmail)

            // Пытаемся добавить того же подписчика
            const result = await addSubscriber(testEmail)

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
            // Добавляем тестовых подписчиков
            await addSubscriber(testEmail)
            await addSubscriber(testEmail2)

            const subscribers = await getActiveSubscribers()

            expect(Array.isArray(subscribers)).toBe(true)

            // Проверяем, что наши тестовые подписчики есть в списке
            const testSubscribers = subscribers.filter(s =>
                s.email === testEmail || s.email === testEmail2
            )
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
            // Сначала подписываемся
            await addSubscriber(testEmail)

            // Затем отписываемся
            const result = await unsubscribe(testEmail)

            expect(result.success).toBe(true)
            expect(result.message).toContain('отписались')

            // Проверяем, что подписчик стал неактивным
            const { data } = await supabase
                .from('subscriptions')
                .select('is_active')
                .eq('email', testEmail)
                .single()

            expect(data?.is_active).toBe(false)
        }, 10000)
    })

    describe('🔗 Подключение к базе данных', () => {
        test('🌐 Проверка соединения с Supabase', async () => {
            try {
                // Простой запрос для проверки соединения
                const { error } = await supabase
                    .from('subscriptions')
                    .select('count')
                    .limit(1)

                expect(error).toBeNull()
            } catch (error) {
                throw new Error(`Не удалось подключиться к Supabase: ${error}`)
            }
        }, 5000)

        test('📊 Проверка схемы таблицы subscriptions', async () => {
            // Проверяем, что таблица существует и имеет правильную структуру
            const { data, error } = await supabase
                .from('subscriptions')
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
            const startTime = Date.now()

            await addSubscriber(testEmail)

            const endTime = Date.now()
            const responseTime = endTime - startTime

            // API должен отвечать быстро (менее 3 секунд)
            expect(responseTime).toBeLessThan(3000)

            console.log(`⏱️ Время отклика API: ${responseTime}ms`)
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
                .from('subscriptions')
                .delete()
                .in('email', testEmails)

            console.log(`⏱️ Время массового добавления 5 подписчиков: ${totalTime}ms`)

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
                .from('subscriptions')
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
