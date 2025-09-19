import { quickStart, testLogger } from '../framework'
import { signUp } from '@/lib/auth'

describe('Auth Integration', () => {
  beforeAll(() => {
    quickStart.integration()
  })

  test('Регистрация пользователя через signUp (Supabase)', async () => {
    testLogger.step('Регистрация нового пользователя через Supabase')
    const unique = Date.now()
    const email = `integration-${unique}@taskai.space`
    const result = await signUp({ email, password: 'Password123!', name: 'Integration Test' })
    expect(result.success).toBe(true)
    expect(result.user).toBeDefined()
    expect(result.user?.email).toBe(email)
    testLogger.assertion('Регистрация прошла успешно', true)
  })
})
