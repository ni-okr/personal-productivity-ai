/**
 * Настройка переменных окружения для тестов
 */

// Supabase тестовые переменные (используем те же, что и в продакшене, но с осторожностью)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://zpgkzvflmgxrlgkecscg.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2t6dmZsbWd4cmxna2Vjc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDM5MDcsImV4cCI6MjA3MzQxOTkwN30.usDTWCrgyMiGY1BDhy-FBy-YTSOhPNEuAm1lh1FMH5c'

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
