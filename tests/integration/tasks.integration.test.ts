import { quickStart, testLogger } from '../framework'
import { createTask, getTasks, updateTask, deleteTask } from '@/lib/tasks'
import { Task } from '@/types'

describe('Tasks Integration: CRUD операции с задачами в Supabase', () => {
  beforeAll(() => {
    quickStart.integration()
  })

  test('Полный цикл CRUD: создать, получить, обновить, удалить задачу', async () => {
    let createdTask: Task
    const userId = 'integration-user'
    testLogger.step('Создание задачи')
    const createRes = await createTask(userId, { title: 'Integration Task', description: 'desc', estimatedMinutes: 15 })
    expect(createRes.success).toBe(true)
    createdTask = createRes.task as Task

    testLogger.step('Получение задач')
    const getRes = await getTasks(userId)
    expect(getRes.success).toBe(true)
    expect(getRes.tasks.some(t => t.id === createdTask.id)).toBe(true)

    testLogger.step('Обновление задачи')
    const updateRes = await updateTask(userId, createdTask.id, { title: 'Updated Title' })
    expect(updateRes.success).toBe(true)

    testLogger.step('Удаление задачи')
    const deleteRes = await deleteTask(userId, createdTask.id)
    expect(deleteRes.success).toBe(true)

    testLogger.assertion('CRUD операций успешно выполнены', true)
  })
})
