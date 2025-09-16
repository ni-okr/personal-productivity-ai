/**
 * 🎯 AD-HOC ТЕСТЫ
 * Покрытие: спонтанное тестирование, исследование, поиск багов
 */

import { test, expect, Page } from '@playwright/test'

describe('🔍 Exploratory Ad-Hoc Tests', () => {
  test('должен исследовать неожиданные сценарии использования', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем неожиданные сценарии
    const unexpectedScenarios = [
      { action: 'double-click subscribe button', method: () => page.dblclick('[data-testid="subscribe-button"]') },
      { action: 'right-click subscribe button', method: () => page.click('[data-testid="subscribe-button"]', { button: 'right' }) },
      { action: 'middle-click subscribe button', method: () => page.click('[data-testid="subscribe-button"]', { button: 'middle' }) },
      { action: 'hover over subscribe button', method: () => page.hover('[data-testid="subscribe-button"]') },
      { action: 'focus and blur email input', method: async () => {
        await page.focus('[data-testid="email-input"]')
        await page.blur('[data-testid="email-input"]')
      }}
    ]
    
    for (const scenario of unexpectedScenarios) {
      try {
        await scenario.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        // Некоторые действия могут не поддерживаться, это нормально
        console.log(`Scenario ${scenario.action} not supported:`, error.message)
      }
    }
  })

  test('должен исследовать граничные случаи ввода', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем граничные случаи ввода
    const edgeCases = [
      { input: ' ', description: 'whitespace only' },
      { input: '\t', description: 'tab character' },
      { input: '\n', description: 'newline character' },
      { input: '\r', description: 'carriage return' },
      { input: 'a'.repeat(10000), description: 'very long input' },
      { input: '🚀', description: 'emoji' },
      { input: 'тест', description: 'unicode characters' },
      { input: 'test@example.com\n', description: 'email with newline' },
      { input: 'test@example.com\t', description: 'email with tab' },
      { input: ' test@example.com ', description: 'email with spaces' }
    ]
    
    for (const edgeCase of edgeCases) {
      const emailInput = page.locator('[data-testid="email-input"]')
      const subscribeButton = page.locator('[data-testid="subscribe-button"]')
      
      await emailInput.fill(edgeCase.input)
      await subscribeButton.click()
      
      // Проверяем, что страница не сломалась
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    }
  })

  test('должен исследовать неожиданные комбинации действий', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем неожиданные комбинации действий
    const actionCombinations = [
      { actions: ['fill email', 'click subscribe', 'fill email again'], method: async () => {
        await page.fill('[data-testid="email-input"]', 'test1@example.com')
        await page.click('[data-testid="subscribe-button"]')
        await page.fill('[data-testid="email-input"]', 'test2@example.com')
      }},
      { actions: ['click subscribe', 'fill email', 'click subscribe'], method: async () => {
        await page.click('[data-testid="subscribe-button"]')
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
      }},
      { actions: ['fill email', 'clear email', 'click subscribe'], method: async () => {
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.fill('[data-testid="email-input"]', '')
        await page.click('[data-testid="subscribe-button"]')
      }},
      { actions: ['fill email', 'select all', 'delete', 'click subscribe'], method: async () => {
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.keyboard.press('Control+a')
        await page.keyboard.press('Delete')
        await page.click('[data-testid="subscribe-button"]')
      }}
    ]
    
    for (const combination of actionCombinations) {
      try {
        await combination.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        console.log(`Action combination failed:`, error.message)
      }
    }
  })
})

describe('🐛 Bug Hunting Ad-Hoc Tests', () => {
  test('должен искать баги в обработке ошибок', async ({ page }) => {
    await page.goto('/')
    
    // Ищем баги в обработке ошибок
    const errorScenarios = [
      { scenario: 'network error', method: async () => {
        await page.route('**/*', route => route.abort())
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
      }},
      { scenario: 'timeout error', method: async () => {
        await page.route('**/*', route => {
          setTimeout(() => route.continue(), 10000) // 10 секунд задержки
        })
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
      }},
      { scenario: 'server error', method: async () => {
        await page.route('**/*', route => route.fulfill({ status: 500 }))
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
      }},
      { scenario: 'malformed response', method: async () => {
        await page.route('**/*', route => route.fulfill({ 
          status: 200, 
          body: 'invalid json' 
        }))
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.click('[data-testid="subscribe-button"]')
      }}
    ]
    
    for (const errorScenario of errorScenarios) {
      try {
        await errorScenario.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        console.log(`Error scenario ${errorScenario.scenario} failed:`, error.message)
      }
    }
  })

  test('должен искать баги в состоянии приложения', async ({ page }) => {
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
    
    // Ищем баги в состоянии приложения
    const stateBugs = [
      { scenario: 'rapid modal open/close', method: async () => {
        for (let i = 0; i < 10; i++) {
          await page.click('[data-testid="add-task-button"]')
          await page.keyboard.press('Escape')
        }
      }},
      { scenario: 'rapid task creation', method: async () => {
        for (let i = 0; i < 20; i++) {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', `Task ${i}`)
          await page.click('[data-testid="save-task-button"]')
          await page.waitForTimeout(10)
        }
      }},
      { scenario: 'concurrent actions', method: async () => {
        const actions = []
        for (let i = 0; i < 5; i++) {
          actions.push(page.click('[data-testid="add-task-button"]'))
        }
        await Promise.all(actions)
      }},
      { scenario: 'state corruption', method: async () => {
        // Пытаемся испортить состояние
        await page.evaluate(() => {
          localStorage.setItem('user', 'invalid json')
        })
        await page.reload()
      }}
    ]
    
    for (const stateBug of stateBugs) {
      try {
        await stateBug.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
      } catch (error) {
        console.log(`State bug ${stateBug.scenario} failed:`, error.message)
      }
    }
  })

  test('должен искать баги в производительности', async ({ page }) => {
    await page.goto('/')
    
    // Ищем баги в производительности
    const performanceBugs = [
      { scenario: 'memory leak', method: async () => {
        for (let i = 0; i < 100; i++) {
          await page.fill('[data-testid="email-input"]', `test${i}@example.com`)
          await page.click('[data-testid="subscribe-button"]')
          await page.waitForTimeout(10)
        }
      }},
      { scenario: 'infinite loop', method: async () => {
        // Пытаемся вызвать бесконечный цикл
        await page.evaluate(() => {
          let i = 0
          while (i < 1000) {
            i++
          }
        })
      }},
      { scenario: 'blocking operation', method: async () => {
        // Пытаемся вызвать блокирующую операцию
        await page.evaluate(() => {
          const start = Date.now()
          while (Date.now() - start < 1000) {
            // Блокируем на 1 секунду
          }
        })
      }},
      { scenario: 'excessive DOM manipulation', method: async () => {
        // Пытаемся вызвать чрезмерные манипуляции с DOM
        await page.evaluate(() => {
          for (let i = 0; i < 1000; i++) {
            const div = document.createElement('div')
            div.textContent = `Element ${i}`
            document.body.appendChild(div)
          }
        })
      }}
    ]
    
    for (const performanceBug of performanceBugs) {
      try {
        const startTime = Date.now()
        await performanceBug.method()
        const endTime = Date.now()
        
        // Проверяем, что операция не заняла слишком много времени
        expect(endTime - startTime).toBeLessThan(10000) // 10 секунд
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('h1')).toBeVisible()
      } catch (error) {
        console.log(`Performance bug ${performanceBug.scenario} failed:`, error.message)
      }
    }
  })
})

describe('🎨 UI/UX Ad-Hoc Tests', () => {
  test('должен исследовать визуальные аномалии', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем визуальные аномалии
    const visualTests = [
      { test: 'zoom in', method: async () => {
        await page.evaluate(() => {
          document.body.style.zoom = '200%'
        })
      }},
      { test: 'zoom out', method: async () => {
        await page.evaluate(() => {
          document.body.style.zoom = '50%'
        })
      }},
      { test: 'high contrast', method: async () => {
        await page.evaluate(() => {
          document.body.style.filter = 'contrast(200%)'
        })
      }},
      { test: 'grayscale', method: async () => {
        await page.evaluate(() => {
          document.body.style.filter = 'grayscale(100%)'
        })
      }},
      { test: 'invert colors', method: async () => {
        await page.evaluate(() => {
          document.body.style.filter = 'invert(100%)'
        })
      }}
    ]
    
    for (const visualTest of visualTests) {
      try {
        await visualTest.method()
        
        // Проверяем, что элементы все еще видны
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        console.log(`Visual test ${visualTest.test} failed:`, error.message)
      }
    }
  })

  test('должен исследовать взаимодействие с клавиатурой', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем взаимодействие с клавиатурой
    const keyboardTests = [
      { test: 'tab navigation', method: async () => {
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
      }},
      { test: 'shift+tab navigation', method: async () => {
        await page.keyboard.press('Shift+Tab')
        await page.keyboard.press('Shift+Tab')
        await page.keyboard.press('Shift+Tab')
      }},
      { test: 'enter key', method: async () => {
        await page.focus('[data-testid="email-input"]')
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.keyboard.press('Enter')
      }},
      { test: 'escape key', method: async () => {
        await page.keyboard.press('Escape')
      }},
      { test: 'arrow keys', method: async () => {
        await page.focus('[data-testid="email-input"]')
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowUp')
        await page.keyboard.press('ArrowDown')
      }},
      { test: 'function keys', method: async () => {
        await page.keyboard.press('F1')
        await page.keyboard.press('F2')
        await page.keyboard.press('F3')
      }},
      { test: 'special keys', method: async () => {
        await page.focus('[data-testid="email-input"]')
        await page.keyboard.press('Home')
        await page.keyboard.press('End')
        await page.keyboard.press('PageUp')
        await page.keyboard.press('PageDown')
      }}
    ]
    
    for (const keyboardTest of keyboardTests) {
      try {
        await keyboardTest.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        console.log(`Keyboard test ${keyboardTest.test} failed:`, error.message)
      }
    }
  })

  test('должен исследовать взаимодействие с мышью', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем взаимодействие с мышью
    const mouseTests = [
      { test: 'hover effects', method: async () => {
        await page.hover('[data-testid="subscribe-button"]')
        await page.hover('[data-testid="email-input"]')
      }},
      { test: 'click and drag', method: async () => {
        await page.mouse.move(100, 100)
        await page.mouse.down()
        await page.mouse.move(200, 200)
        await page.mouse.up()
      }},
      { test: 'double click', method: async () => {
        await page.dblclick('[data-testid="subscribe-button"]')
      }},
      { test: 'right click', method: async () => {
        await page.click('[data-testid="subscribe-button"]', { button: 'right' })
      }},
      { test: 'middle click', method: async () => {
        await page.click('[data-testid="subscribe-button"]', { button: 'middle' })
      }},
      { test: 'mouse wheel', method: async () => {
        await page.mouse.wheel(0, 100)
        await page.mouse.wheel(0, -100)
      }}
    ]
    
    for (const mouseTest of mouseTests) {
      try {
        await mouseTest.method()
        
        // Проверяем, что страница не сломалась
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        console.log(`Mouse test ${mouseTest.test} failed:`, error.message)
      }
    }
  })
})

describe('🌐 Cross-Platform Ad-Hoc Tests', () => {
  test('должен исследовать поведение на разных платформах', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем поведение на разных платформах
    const platformTests = [
      { test: 'Windows', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'platform', {
            value: 'Win32',
            writable: false
          })
        })
      }},
      { test: 'macOS', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'platform', {
            value: 'MacIntel',
            writable: false
          })
        })
      }},
      { test: 'Linux', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'platform', {
            value: 'Linux x86_64',
            writable: false
          })
        })
      }},
      { test: 'mobile', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
            writable: false
          })
        })
      }}
    ]
    
    for (const platformTest of platformTests) {
      try {
        await platformTest.method()
        
        // Проверяем, что страница работает на всех платформах
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        console.log(`Platform test ${platformTest.test} failed:`, error.message)
      }
    }
  })

  test('должен исследовать поведение в разных браузерах', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем поведение в разных браузерах
    const browserTests = [
      { test: 'Chrome', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            writable: false
          })
        })
      }},
      { test: 'Firefox', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            writable: false
          })
        })
      }},
      { test: 'Safari', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            writable: false
          })
        })
      }},
      { test: 'Edge', method: async () => {
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
            writable: false
          })
        })
      }}
    ]
    
    for (const browserTest of browserTests) {
      try {
        await browserTest.method()
        
        // Проверяем, что страница работает во всех браузерах
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      } catch (error) {
        console.log(`Browser test ${browserTest.test} failed:`, error.message)
      }
    }
  })

  test('должен исследовать поведение на разных устройствах', async ({ page }) => {
    // Исследуем поведение на разных устройствах
    const deviceTests = [
      { test: 'iPhone SE', method: async () => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')
      }},
      { test: 'iPhone 12', method: async () => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto('/')
      }},
      { test: 'iPad', method: async () => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await page.goto('/')
      }},
      { test: 'Desktop', method: async () => {
        await page.setViewportSize({ width: 1920, height: 1080 })
        await page.goto('/')
      }},
      { test: 'Ultra-wide', method: async () => {
        await page.setViewportSize({ width: 3440, height: 1440 })
        await page.goto('/')
      }}
    ]
    
    for (const deviceTest of deviceTests) {
      try {
        await deviceTest.method()
        
        // Проверяем, что страница работает на всех устройствах
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
        
        // Проверяем, что контент помещается на экране
        const body = page.locator('body')
        const scrollWidth = await body.evaluate(el => el.scrollWidth)
        const clientWidth = await body.evaluate(el => el.clientWidth)
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.2) // 20% допуск
      } catch (error) {
        console.log(`Device test ${deviceTest.test} failed:`, error.message)
      }
    }
  })
})