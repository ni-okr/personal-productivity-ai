/**
 * @jest-environment node
 */

import { POST, GET } from '@/app/api/subscribe/route'
import { NextRequest } from 'next/server'

// Мокаем Supabase
jest.mock('@/lib/supabase', () => ({
  addSubscriber: jest.fn()
}))

import { addSubscriber } from '@/lib/supabase'
const mockAddSubscriber = addSubscriber as jest.MockedFunction<typeof addSubscriber>

describe('/api/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/subscribe', () => {
    test('возвращает информацию об API', async () => {
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('endpoint', '/api/subscribe')
      expect(data).toHaveProperty('method', 'POST')
    })
  })

  describe('POST /api/subscribe', () => {
    test('✅ успешная подписка с валидным email', async () => {
      const mockSubscription = {
        id: '123',
        email: 'test@example.com',
        subscribed_at: new Date().toISOString(),
        source: 'landing_page',
        is_active: true
      }
      
      mockAddSubscriber.mockResolvedValueOnce(mockSubscription)
      
      const request = new NextRequest('http://localhost:3001/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Спасибо за подписку')
      expect(mockAddSubscriber).toHaveBeenCalledWith('test@example.com', 'landing_page')
    })

    test('❌ невалидный email', async () => {
      const request = new NextRequest('http://localhost:3001/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid-email' }),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Некорректный email')
    })

    test('🔄 дублирующийся email', async () => {
      mockAddSubscriber.mockRejectedValueOnce(
        new Error('Этот email уже подписан на уведомления')
      )
      
      const request = new NextRequest('http://localhost:3001/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'duplicate@example.com' }),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200) // Возвращаем 200 для дубликатов
      expect(data.success).toBe(false)
      expect(data.error).toContain('уже подписан')
    })

    test('💥 ошибка базы данных', async () => {
      mockAddSubscriber.mockRejectedValueOnce(
        new Error('Database connection failed')
      )
      
      const request = new NextRequest('http://localhost:3001/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Произошла ошибка при подписке')
    })

    test('📝 пустое тело запроса', async () => {
      const request = new NextRequest('http://localhost:3001/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    test('🔍 различные невалидные email форматы', async () => {
      const invalidEmails = [
        '',
        'test',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example',
        'test@.com'
      ]
      
      for (const email of invalidEmails) {
        const request = new NextRequest('http://localhost:3001/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' }
        })
        
        const response = await POST(request)
        const data = await response.json()
        
        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toContain('Некорректный email')
      }
    })
  })
})
