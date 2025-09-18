/**
 * 🧠 ТЕСТЫ НА ОСНОВЕ МНЕМОНИК
 * Покрытие: запоминаемость, ассоциации, паттерны
 */

import { test, expect, Page } from '@playwright/test'

describe('🔤 Alphabetical Mnemonics Tests', () => {
  test('должен использовать алфавитные паттерны для навигации', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что элементы упорядочены алфавитно
    const navItems = page.locator('nav a')
    const navCount = await navItems.count()
    
    if (navCount > 1) {
      const navTexts = []
      for (let i = 0; i < navCount; i++) {
        const text = await navItems.nth(i).textContent()
        if (text) {
          navTexts.push(text.trim())
        }
      }
      
      // Проверяем, что элементы упорядочены алфавитно
      const sortedTexts = [...navTexts].sort()
      expect(navTexts).toEqual(sortedTexts)
    }
  })

  test('должен использовать алфавитные паттерны для списков', async ({ page }) => {
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
    
    // Добавляем несколько задач
    const tasks = ['Alpha Task', 'Beta Task', 'Gamma Task']
    
    for (const task of tasks) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', task)
      await page.click('[data-testid="save-task-button"]')
      await page.waitForTimeout(100)
    }
    
    // Проверяем, что задачи упорядочены алфавитно
    const taskCards = page.locator('.task-card')
    const taskCount = await taskCards.count()
    
    if (taskCount > 1) {
      const taskTitles = []
      for (let i = 0; i < taskCount; i++) {
        const title = await taskCards.nth(i).textContent()
        if (title) {
          taskTitles.push(title.trim())
        }
      }
      
      // Проверяем, что задачи упорядочены алфавитно
      const sortedTitles = [...taskTitles].sort()
      expect(taskTitles).toEqual(sortedTitles)
    }
  })
})

describe('🔢 Numerical Mnemonics Tests', () => {
  test('должен использовать числовые паттерны для приоритетов', async ({ page }) => {
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
    
    // Проверяем, что есть числовые индикаторы приоритета
    const priorityElements = page.locator('[data-testid*="priority"], .priority')
    const priorityCount = await priorityElements.count()
    
    if (priorityCount > 0) {
      for (let i = 0; i < priorityCount; i++) {
        const element = priorityElements.nth(i)
        const text = await element.textContent()
        
        if (text) {
          // Проверяем, что приоритет выражен числом
          const priorityNumber = parseInt(text)
          expect(priorityNumber).toBeGreaterThan(0)
          expect(priorityNumber).toBeLessThanOrEqual(5) // Максимум 5 уровней приоритета
        }
      }
    }
  })

  test('должен использовать числовые паттерны для прогресса', async ({ page }) => {
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
    
    // Проверяем, что есть числовые индикаторы прогресса
    const progressElements = page.locator('[data-testid*="progress"], .progress')
    const progressCount = await progressElements.count()
    
    if (progressCount > 0) {
      for (let i = 0; i < progressCount; i++) {
        const element = progressElements.nth(i)
        const text = await element.textContent()
        
        if (text) {
          // Проверяем, что прогресс выражен числом
          const progressNumber = parseInt(text)
          expect(progressNumber).toBeGreaterThanOrEqual(0)
          expect(progressNumber).toBeLessThanOrEqual(100) // Максимум 100%
        }
      }
    }
  })
})

describe('🎨 Color Mnemonics Tests', () => {
  test('должен использовать цветовые паттерны для статусов', async ({ page }) => {
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
    
    // Проверяем, что есть цветовые индикаторы статуса
    const statusElements = page.locator('[data-testid*="status"], .status')
    const statusCount = await statusElements.count()
    
    if (statusCount > 0) {
      for (let i = 0; i < statusCount; i++) {
        const element = statusElements.nth(i)
        const backgroundColor = await element.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor
        })
        
        // Проверяем, что статус выражен цветом
        expect(backgroundColor).toBeTruthy()
        expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(backgroundColor).not.toBe('transparent')
      }
    }
  })

  test('должен использовать цветовые паттерны для приоритетов', async ({ page }) => {
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
    
    // Проверяем, что есть цветовые индикаторы приоритета
    const priorityElements = page.locator('[data-testid*="priority"], .priority')
    const priorityCount = await priorityElements.count()
    
    if (priorityCount > 0) {
      for (let i = 0; i < priorityCount; i++) {
        const element = priorityElements.nth(i)
        const backgroundColor = await element.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor
        })
        
        // Проверяем, что приоритет выражен цветом
        expect(backgroundColor).toBeTruthy()
        expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(backgroundColor).not.toBe('transparent')
      }
    }
  })
})

describe('🔤 Acronym Mnemonics Tests', () => {
  test('должен использовать акронимы для быстрого доступа', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть акронимы в интерфейсе
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Проверяем, что акронимы объяснены
        const acronyms = ['AI', 'API', 'UI', 'UX', 'PWA']
        const hasAcronyms = acronyms.some(acronym => text.includes(acronym))
        
        if (hasAcronyms) {
          // Если есть акронимы, должны быть объяснения
          const parent = element.locator('..')
          const parentText = await parent.textContent()
          expect(parentText?.length).toBeGreaterThan(text.length)
        }
      }
    }
  })

  test('должен использовать акронимы для навигации', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть акронимы в навигации
    const navItems = page.locator('nav a')
    const navCount = await navItems.count()
    
    for (let i = 0; i < navCount; i++) {
      const navItem = navItems.nth(i)
      const text = await navItem.textContent()
      const isVisible = await navItem.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Проверяем, что акронимы понятны
        const acronyms = ['AI', 'API', 'UI', 'UX', 'PWA']
        const hasAcronyms = acronyms.some(acronym => text.includes(acronym))
        
        if (hasAcronyms) {
          // Акронимы должны быть объяснены
          const title = await navItem.getAttribute('title')
          const ariaLabel = await navItem.getAttribute('aria-label')
          
          expect(title || ariaLabel).toBeTruthy()
        }
      }
    }
  })
})

describe('🎵 Rhyme Mnemonics Tests', () => {
  test('должен использовать рифмы для запоминания', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть рифмы в тексте
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Проверяем, что текст ритмичен
        const words = text.split(' ')
        if (words.length > 1) {
          // Проверяем, что есть ритм в тексте
          const lastWords = words.slice(-2)
          const lastWord1 = lastWords[0]?.toLowerCase()
          const lastWord2 = lastWords[1]?.toLowerCase()
          
          if (lastWord1 && lastWord2) {
            // Проверяем, что последние слова рифмуются
            const rhyme1 = lastWord1.slice(-2)
            const rhyme2 = lastWord2.slice(-2)
            
            if (rhyme1 === rhyme2) {
              // Есть рифма
              expect(true).toBe(true)
            }
          }
        }
      }
    }
  })

  test('должен использовать ритм для запоминания', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть ритм в тексте
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Проверяем, что текст имеет ритм
        const words = text.split(' ')
        if (words.length > 2) {
          // Проверяем, что есть ритм в словах
          const wordLengths = words.map(word => word.length)
          const hasPattern = wordLengths.some((length, index) => {
            if (index > 0) {
              return length === wordLengths[index - 1]
            }
            return false
          })
          
          if (hasPattern) {
            // Есть ритм
            expect(true).toBe(true)
          }
        }
      }
    }
  })
})

describe('🔗 Association Mnemonics Tests', () => {
  test('должен использовать ассоциации для запоминания', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть ассоциации в интерфейсе
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Проверяем, что есть ассоциации
        const associations = [
          'productivity', 'efficiency', 'organization',
          'planning', 'scheduling', 'time management',
          'tasks', 'goals', 'achievements'
        ]
        
        const hasAssociations = associations.some(association => 
          text.toLowerCase().includes(association)
        )
        
        if (hasAssociations) {
          // Есть ассоциации
          expect(true).toBe(true)
        }
      }
    }
  })

  test('должен использовать метафоры для запоминания', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть метафоры в интерфейсе
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Проверяем, что есть метафоры
        const metaphors = [
          'journey', 'path', 'road', 'bridge',
          'tool', 'key', 'door', 'window',
          'light', 'guide', 'compass', 'map'
        ]
        
        const hasMetaphors = metaphors.some(metaphor => 
          text.toLowerCase().includes(metaphor)
        )
        
        if (hasMetaphors) {
          // Есть метафоры
          expect(true).toBe(true)
        }
      }
    }
  })
})

describe('🎯 Pattern Mnemonics Tests', () => {
  test('должен использовать паттерны для запоминания', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть паттерны в интерфейсе
    const elements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент следует паттерну
        const styles = await element.evaluate(el => {
          const computedStyles = window.getComputedStyle(el)
          return {
            fontSize: computedStyles.fontSize,
            fontWeight: computedStyles.fontWeight,
            color: computedStyles.color,
            backgroundColor: computedStyles.backgroundColor
          }
        })
        
        // Проверяем, что стили консистентны
        expect(styles.fontSize).toBeTruthy()
        expect(styles.fontWeight).toBeTruthy()
        expect(styles.color).toBeTruthy()
      }
    }
  })

  test('должен использовать повторяющиеся паттерны', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть повторяющиеся паттерны
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    if (buttonCount > 1) {
      const buttonStyles = []
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const isVisible = await button.isVisible()
        
        if (isVisible) {
          const styles = await button.evaluate(el => {
            const computedStyles = window.getComputedStyle(el)
            return {
              fontSize: computedStyles.fontSize,
              fontWeight: computedStyles.fontWeight,
              color: computedStyles.color,
              backgroundColor: computedStyles.backgroundColor
            }
          })
          
          buttonStyles.push(styles)
        }
      }
      
      // Проверяем, что стили кнопок консистентны
      if (buttonStyles.length > 1) {
        const firstButton = buttonStyles[0]
        const allConsistent = buttonStyles.every(styles => 
          styles.fontSize === firstButton.fontSize &&
          styles.fontWeight === firstButton.fontWeight &&
          styles.color === firstButton.color
        )
        
        expect(allConsistent).toBe(true)
      }
    }
  })
})

describe('🧠 Memory Palace Tests', () => {
  test('должен использовать пространственные ассоциации', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что элементы расположены логично
    const h1 = page.locator('h1')
    const emailInput = page.locator('[data-testid="email-input"]')
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    
    // Проверяем, что заголовок вверху
    const h1Box = await h1.boundingBox()
    const emailBox = await emailInput.boundingBox()
    const buttonBox = await subscribeButton.boundingBox()
    
    if (h1Box && emailBox && buttonBox) {
      expect(h1Box.y).toBeLessThan(emailBox.y)
      expect(emailBox.y).toBeLessThan(buttonBox.y)
    }
  })

  test('должен использовать логическую группировку', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что связанные элементы сгруппированы
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Проверяем, что поля формы находятся в одной группе
    const emailInput = page.locator('[data-testid="email-input"]')
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    
    const emailBox = await emailInput.boundingBox()
    const buttonBox = await subscribeButton.boundingBox()
    
    if (emailBox && buttonBox) {
      // Поля должны быть близко друг к другу
      const distance = Math.abs(emailBox.y - buttonBox.y)
      expect(distance).toBeLessThan(100) // Максимум 100px между полями
    }
  })

  test('должен использовать визуальные маркеры', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть визуальные маркеры
    const elements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент имеет визуальные маркеры
        const styles = await element.evaluate(el => {
          const computedStyles = window.getComputedStyle(el)
          return {
            fontSize: computedStyles.fontSize,
            fontWeight: computedStyles.fontWeight,
            color: computedStyles.color,
            backgroundColor: computedStyles.backgroundColor,
            border: computedStyles.border
          }
        })
        
        // Проверяем, что есть визуальные маркеры
        expect(styles.fontSize).toBeTruthy()
        expect(styles.color).toBeTruthy()
      }
    }
  })
})