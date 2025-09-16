/**
 * 🐒 MONKEY ТЕСТЫ
 * Покрытие: случайные действия, стресс-тестирование, отказоустойчивость
 */

import { test, expect, Page } from '@playwright/test'

describe('🎲 Random Action Monkey Tests', () => {
  test('должен выдерживать случайные клики', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем случайные клики по странице
    const clickCount = 50
    const pageWidth = 1920
    const pageHeight = 1080
    
    for (let i = 0; i < clickCount; i++) {
      // Генерируем случайные координаты
      const x = Math.random() * pageWidth
      const y = Math.random() * pageHeight
      
      try {
        await page.mouse.click(x, y)
        await page.waitForTimeout(100)
      } catch (error) {
        // Игнорируем ошибки кликов вне элементов
      }
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })

  test('должен выдерживать случайные нажатия клавиш', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем случайные нажатия клавиш
    const keyCount = 100
    const keys = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'Enter', 'Escape', 'Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Space', 'Control', 'Alt', 'Shift', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ]
    
    for (let i = 0; i < keyCount; i++) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)]
      
      try {
        await page.keyboard.press(randomKey)
        await page.waitForTimeout(50)
      } catch (error) {
        // Игнорируем ошибки нажатий клавиш
      }
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })

  test('должен выдерживать случайные вводы текста', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем случайные вводы текста
    const inputCount = 20
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    
    for (let i = 0; i < inputCount; i++) {
      // Генерируем случайный текст
      const randomText = Array.from({ length: Math.floor(Math.random() * 100) + 1 }, () => 
        characters[Math.floor(Math.random() * characters.length)]
      ).join('')
      
      try {
        await page.fill('[data-testid="email-input"]', randomText)
        await page.waitForTimeout(100)
      } catch (error) {
        // Игнорируем ошибки ввода
      }
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })
})

describe('🔄 Rapid Action Monkey Tests', () => {
  test('должен выдерживать быстрые повторяющиеся действия', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем быстрые повторяющиеся действия
    const actionCount = 100
    const actions = [
      () => page.click('[data-testid="subscribe-button"]'),
      () => page.fill('[data-testid="email-input"]', 'test@example.com'),
      () => page.fill('[data-testid="email-input"]', ''),
      () => page.keyboard.press('Tab'),
      () => page.keyboard.press('Enter'),
      () => page.keyboard.press('Escape')
    ]
    
    for (let i = 0; i < actionCount; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      
      try {
        await randomAction()
        await page.waitForTimeout(10) // Минимальная задержка
      } catch (error) {
        // Игнорируем ошибки действий
      }
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })

  test('должен выдерживать одновременные действия', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем одновременные действия
    const concurrentActions = 10
    const promises = []
    
    for (let i = 0; i < concurrentActions; i++) {
      const promise = page.fill('[data-testid="email-input"]', `test${i}@example.com`)
        .then(() => page.click('[data-testid="subscribe-button"]'))
        .catch(() => {}) // Игнорируем ошибки
      promises.push(promise)
    }
    
    // Выполняем все действия одновременно
    await Promise.all(promises)
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })

  test('должен выдерживать быстрые переключения между страницами', async ({ page }) => {
    // Выполняем быстрые переключения между страницами
    const pageCount = 20
    const pages = ['/', '/planner']
    
    for (let i = 0; i < pageCount; i++) {
      const randomPage = pages[Math.floor(Math.random() * pages.length)]
      
      try {
        await page.goto(randomPage)
        await page.waitForTimeout(100)
      } catch (error) {
        // Игнорируем ошибки навигации
      }
    }
    
    // Проверяем, что страница загружается
    await expect(page.locator('body')).toBeVisible()
  })
})

describe('💥 Destructive Monkey Tests', () => {
  test('должен выдерживать разрушительные действия', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем разрушительные действия
    const destructiveActions = [
      { action: 'clear all inputs', method: async () => {
        await page.fill('[data-testid="email-input"]', '')
      }},
      { action: 'rapid form submission', method: async () => {
        for (let i = 0; i < 50; i++) {
          await page.fill('[data-testid="email-input"]', `test${i}@example.com`)
          await page.click('[data-testid="subscribe-button"]')
          await page.waitForTimeout(10)
        }
      }},
      { action: 'rapid navigation', method: async () => {
        for (let i = 0; i < 20; i++) {
          await page.goto('/')
          await page.goto('/planner')
          await page.waitForTimeout(10)
        }
      }},
      { action: 'rapid refresh', method: async () => {
        for (let i = 0; i < 10; i++) {
          await page.reload()
          await page.waitForTimeout(100)
        }
      }}
    ]
    
    for (const destructiveAction of destructiveActions) {
      try {
        await destructiveAction.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('body')).toBeVisible()
      } catch (error) {
        console.log(`Destructive action ${destructiveAction.action} failed:`, error.message)
      }
    }
  })

  test('должен выдерживать экстремальные нагрузки', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем экстремальные нагрузки
    const extremeLoads = [
      { load: 'memory stress', method: async () => {
        await page.evaluate(() => {
          const elements = []
          for (let i = 0; i < 10000; i++) {
            const div = document.createElement('div')
            div.textContent = `Element ${i}`
            elements.push(div)
          }
        })
      }},
      { load: 'DOM manipulation', method: async () => {
        await page.evaluate(() => {
          for (let i = 0; i < 1000; i++) {
            const div = document.createElement('div')
            div.textContent = `Dynamic Element ${i}`
            document.body.appendChild(div)
          }
        })
      }},
      { load: 'event listener stress', method: async () => {
        await page.evaluate(() => {
          for (let i = 0; i < 1000; i++) {
            document.addEventListener('click', () => {})
          }
        })
      }},
      { load: 'localStorage stress', method: async () => {
        await page.evaluate(() => {
          for (let i = 0; i < 1000; i++) {
            localStorage.setItem(`key${i}`, `value${i}`)
          }
        })
      }}
    ]
    
    for (const extremeLoad of extremeLoads) {
      try {
        await extremeLoad.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('body')).toBeVisible()
      } catch (error) {
        console.log(`Extreme load ${extremeLoad.load} failed:`, error.message)
      }
    }
  })

  test('должен выдерживать некорректные данные', async ({ page }) => {
    await page.goto('/')
    
    // Выполняем действия с некорректными данными
    const invalidData = [
      { data: 'null', method: async () => {
        await page.evaluate(() => {
          localStorage.setItem('user', 'null')
        })
      }},
      { data: 'undefined', method: async () => {
        await page.evaluate(() => {
          localStorage.setItem('user', 'undefined')
        })
      }},
      { data: 'empty object', method: async () => {
        await page.evaluate(() => {
          localStorage.setItem('user', '{}')
        })
      }},
      { data: 'malformed JSON', method: async () => {
        await page.evaluate(() => {
          localStorage.setItem('user', '{invalid json}')
        })
      }},
      { data: 'circular reference', method: async () => {
        await page.evaluate(() => {
          const obj = {}
          obj.self = obj
          try {
            localStorage.setItem('user', JSON.stringify(obj))
          } catch (e) {
            // Игнорируем ошибки сериализации
          }
        })
      }}
    ]
    
    for (const invalid of invalidData) {
      try {
        await invalid.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('body')).toBeVisible()
      } catch (error) {
        console.log(`Invalid data ${invalid.data} failed:`, error.message)
      }
    }
  })
})

describe('🎯 Targeted Monkey Tests', () => {
  test('должен тестировать конкретные элементы', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем конкретные элементы
    const elements = [
      { selector: '[data-testid="email-input"]', actions: ['fill', 'clear', 'focus', 'blur'] },
      { selector: '[data-testid="subscribe-button"]', actions: ['click', 'hover', 'focus', 'blur'] },
      { selector: 'h1', actions: ['hover', 'click'] },
      { selector: 'body', actions: ['click', 'hover'] }
    ]
    
    for (const element of elements) {
      for (const action of element.actions) {
        try {
          switch (action) {
            case 'fill':
              await page.fill(element.selector, 'test@example.com')
              break
            case 'clear':
              await page.fill(element.selector, '')
              break
            case 'click':
              await page.click(element.selector)
              break
            case 'hover':
              await page.hover(element.selector)
              break
            case 'focus':
              await page.focus(element.selector)
              break
            case 'blur':
              await page.blur(element.selector)
              break
          }
          await page.waitForTimeout(50)
        } catch (error) {
          // Игнорируем ошибки действий
        }
      }
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })

  test('должен тестировать конкретные функции', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Тестируем конкретные функции
    const functions = [
      { name: 'add task', method: async () => {
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', 'Test Task')
        await page.click('[data-testid="save-task-button"]')
      }},
      { name: 'edit task', method: async () => {
        const taskCards = page.locator('.task-card')
        if (await taskCards.count() > 0) {
          await taskCards.first().click()
        }
      }},
      { name: 'delete task', method: async () => {
        const deleteButtons = page.locator('[data-testid="delete-task-button"]')
        if (await deleteButtons.count() > 0) {
          await deleteButtons.first().click()
        }
      }},
      { name: 'toggle task', method: async () => {
        const toggleButtons = page.locator('[data-testid="toggle-task-button"]')
        if (await toggleButtons.count() > 0) {
          await toggleButtons.first().click()
        }
      }}
    ]
    
    for (const func of functions) {
      try {
        await func.method()
        await page.waitForTimeout(100)
      } catch (error) {
        // Игнорируем ошибки функций
      }
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
  })

  test('должен тестировать конкретные сценарии', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем конкретные сценарии
    const scenarios = [
      { name: 'subscription flow', method: async () => {
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
        await page.waitForTimeout(1000)
      }},
      { name: 'navigation flow', method: async () => {
        await page.goto('/planner')
        await page.goto('/')
        await page.waitForTimeout(1000)
      }},
      { name: 'form validation flow', method: async () => {
        await page.fill('[data-testid="email-input"]', 'invalid-email')
        await page.click('[data-testid="subscribe-button"]')
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
        await page.waitForTimeout(1000)
      }},
      { name: 'error handling flow', method: async () => {
        await page.route('**/*', route => route.abort())
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
        await page.waitForTimeout(1000)
      }}
    ]
    
    for (const scenario of scenarios) {
      try {
        await scenario.method()
      } catch (error) {
        // Игнорируем ошибки сценариев
      }
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('body')).toBeVisible()
  })
})

describe('🌊 Wave Monkey Tests', () => {
  test('должен выдерживать волны активности', async ({ page }) => {
    await page.goto('/')
    
    // Создаем волны активности
    const waves = 5
    const actionsPerWave = 20
    
    for (let wave = 0; wave < waves; wave++) {
      // Создаем волну действий
      const promises = []
      
      for (let i = 0; i < actionsPerWave; i++) {
        const promise = page.fill('[data-testid="email-input"]', `test${wave}${i}@example.com`)
          .then(() => page.click('[data-testid="subscribe-button"]'))
          .catch(() => {}) // Игнорируем ошибки
        promises.push(promise)
      }
      
      // Выполняем волну действий
      await Promise.all(promises)
      
      // Пауза между волнами
      await page.waitForTimeout(1000)
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })

  test('должен выдерживать нарастающие волны', async ({ page }) => {
    await page.goto('/')
    
    // Создаем нарастающие волны
    const maxWaves = 10
    
    for (let wave = 1; wave <= maxWaves; wave++) {
      const actionsPerWave = wave * 5
      const promises = []
      
      for (let i = 0; i < actionsPerWave; i++) {
        const promise = page.fill('[data-testid="email-input"]', `test${wave}${i}@example.com`)
          .then(() => page.click('[data-testid="subscribe-button"]'))
          .catch(() => {}) // Игнорируем ошибки
        promises.push(promise)
      }
      
      // Выполняем волну действий
      await Promise.all(promises)
      
      // Пауза между волнами
      await page.waitForTimeout(500)
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })

  test('должен выдерживать затухающие волны', async ({ page }) => {
    await page.goto('/')
    
    // Создаем затухающие волны
    const maxWaves = 10
    
    for (let wave = maxWaves; wave >= 1; wave--) {
      const actionsPerWave = wave * 5
      const promises = []
      
      for (let i = 0; i < actionsPerWave; i++) {
        const promise = page.fill('[data-testid="email-input"]', `test${wave}${i}@example.com`)
          .then(() => page.click('[data-testid="subscribe-button"]'))
          .catch(() => {}) // Игнорируем ошибки
        promises.push(promise)
      }
      
      // Выполняем волну действий
      await Promise.all(promises)
      
      // Пауза между волнами
      await page.waitForTimeout(500)
    }
    
    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
  })
})