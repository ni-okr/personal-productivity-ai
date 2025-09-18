import { quickStart, testLogger } from './index'
import { createTask, getTasks, updateTask, deleteTask } from '@/lib/tasks'
import { Task } from '@/types'

describe('Основные операции с задачами (CRUD)', () => {
  beforeAll(() => {
    quickStart.unit()
  })

  let createdTask: Task
  const userId = 'test-user'
  const taskData = { title: 'Test Task', description: 'Описание задачи', estimatedMinutes: 30 }

  test('createTask создает задачу', async () => {
    testLogger.step('Создание задачи через createTask')
    const result = await createTask(userId, taskData)
    expect(result.success).toBe(true)
    expect(result.task).toBeDefined()
    createdTask = result.task as Task
    testLogger.assertion('Задача создана', true)
  })

  test('getTasks возвращает список задач', async () => {
    testLogger.step('Получение задач через getTasks')
    const result = await getTasks(userId)
    expect(result.success).toBe(true)
    expect(Array.isArray(result.tasks)).toBe(true)
    expect(result.tasks.find(t => t.id === createdTask.id)).toBeDefined()
    testLogger.assertion('Задачи получены', true)
  })

  test('updateTask обновляет задачу', async () => {
    testLogger.step('Обновляем задачу через updateTask')
    const newTitle = 'Updated Title'
    const result = await updateTask(createdTask.id, { title: newTitle })
    expect(result.success).toBe(true)
    expect(result.task).toBeDefined()
    expect((result.task as Task).title).toBe(newTitle)
    testLogger.assertion('Задача обновлена', true)
  })

  test('deleteTask удаляет задачу', async () => {
    testLogger.step('Удаление задачи через deleteTask')
    const result = await deleteTask(createdTask.id)
    expect(result.success).toBe(true)
    testLogger.assertion('Задача удалена', true)
  })
})