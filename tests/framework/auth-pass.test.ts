import { quickStart, testLogger } from './index'
import { signUp, signInWithGoogle, signInWithGitHub } from '@/lib/auth'

describe('Регистрация и вход через OS-Pass (Auth)', () => {
  beforeAll(() => {
    quickStart.unit()
  })

  test('Функции signUp и входа должны существовать', () => {
    testLogger.step('Проверяем, что функции регистрации/входа определены')
    expect(typeof signUp).toBe('function')
    expect(typeof signInWithGoogle).toBe('function')
    expect(typeof signInWithGitHub).toBe('function')
    testLogger.assertion('Функции exist', true)
  })

  // Более подробные тесты интеграций можно добавить позже, после настройки pass
})