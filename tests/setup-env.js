/**
 * Настройка переменных окружения для тестов
 */

// Проверяем наличие переменных окружения для тестов
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not found. Tests may fail.')
  console.warn('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  
  // Устанавливаем тестовые значения только если переменные не найдены
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'
}

// Режим разработки для более подробных ошибок
process.env.NODE_ENV = 'test'

// Мокаем IntersectionObserver для Framer Motion
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

// Мокаем ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

// Мокаем Request для Next.js API тестов
global.Request = class Request {
    constructor(url, options = {}) {
        this.url = url
        this.method = options.method || 'GET'
        this.headers = new Map(Object.entries(options.headers || {}))
        this.body = options.body
    }

    async json() {
        return JSON.parse(this.body || '{}')
    }
}

// Мокаем Response
global.Response = class Response {
    constructor(body, options = {}) {
        this.body = body
        this.status = options.status || 200
        this.headers = new Map(Object.entries(options.headers || {}))
    }

    async json() {
        return JSON.parse(this.body || '{}')
    }
}

console.log('🧪 Тестовое окружение настроено')
