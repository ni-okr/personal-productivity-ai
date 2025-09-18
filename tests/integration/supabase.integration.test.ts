import { quickStart, testLogger } from '../framework'
import { supabase } from '@/lib/supabase'

describe('Supabase Integration', () => {
  beforeAll(() => {
    quickStart.integration()
  })

  test('Подключение к Supabase и получение данных из таблицы tasks', async () => {
    testLogger.step('Запрос к таблице tasks')
    const { data, error } = await supabase.from('tasks').select('*').limit(1)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    testLogger.assertion('Успешное подключение к Supabase и данные получены', true)
  })
})
