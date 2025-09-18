import { quickStart, testLogger } from './index'
import { supabase } from '@/lib/supabase'

describe('Supabase Client Initialization', () => {
  beforeAll(() => {
    quickStart.unit()
  })

  test('supabase client should be instantiated', () => {
    testLogger.step('Проверяем, что supabase клиент существует и имеет метод from')
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
    testLogger.assertion('Supabase client инициализирован', true)
  })
})