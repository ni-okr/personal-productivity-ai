import { quickStart, testLogger } from '../framework'
import { signUp } from '@/lib/auth'

describe('Auth Integration', () => {
  beforeAll(() => {
    quickStart.integration()
  })

  test('Регистрация пользователя через signUp (Supabase)', async () => {
    testLogger.step('Регистрация нового пользователя через Supabase')
    const result = await signUp({ email: 'integration@test.com', password: 'Password123!', name: 'Integration Test' })
    expect(result.success).toBe(true)
    expect(result.user).toBeDefined()
    testLogger.assertion('Регистрация прошла успешно', true)
  })
})
