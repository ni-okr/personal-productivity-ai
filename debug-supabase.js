// 🔍 Диагностика Supabase подключения
const { createClient } = require('@supabase/supabase-js')

async function testSupabaseConnection() {
    console.log('🔍 Тестирование подключения к Supabase...')
    
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('📋 Переменные окружения:')
    console.log('  SUPABASE_URL:', supabaseUrl ? '✅ Настроен' : '❌ Отсутствует')
    console.log('  SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Настроен' : '❌ Отсутствует')
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.log('❌ Переменные окружения не настроены!')
        return
    }
    
    // Создаем клиент
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
        // Тестируем подключение
        console.log('🔌 Тестирование подключения...')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
            console.log('❌ Ошибка подключения:', error.message)
        } else {
            console.log('✅ Подключение успешно!')
        }
        
        // Тестируем регистрацию с тестовыми данными
        console.log('🧪 Тестирование регистрации...')
        const testEmail = `test-${Date.now()}@gmail.com`
        const testPassword = 'TestPassword123'
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: 'Test User'
                }
            }
        })
        
        if (signUpError) {
            console.log('❌ Ошибка регистрации:', signUpError.message)
            console.log('📋 Детали ошибки:', signUpError)
        } else {
            console.log('✅ Регистрация успешна!')
            console.log('📋 Данные пользователя:', signUpData)
        }
        
    } catch (error) {
        console.log('❌ Критическая ошибка:', error.message)
    }
}

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' })

testSupabaseConnection()
