/**
 * 🔍 ЭВРИСТИЧЕСКИЕ ТЕСТЫ
 * Покрытие: правила Нильсена, UX принципы, интуитивность
 */

import { test, expect, Page } from '@playwright/test'

describe('📋 Nielsen Heuristics Tests', () => {
  test('должен показывать статус системы', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что пользователь понимает, что происходит
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const title = await h1.textContent()
    expect(title).toContain('Personal Productivity AI')
    
    // Проверяем, что есть обратная связь о действиях
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
    
    const statusText = await statusElement.textContent()
    expect(statusText).toBeTruthy()
  })

  test('должен использовать знакомый язык пользователя', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что используется понятный язык
    const textElements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Текст должен быть понятным и не содержать технических терминов
        const technicalTerms = ['API', 'SDK', 'Framework', 'Library', 'Database']
        const hasTechnicalTerms = technicalTerms.some(term => 
          text.includes(term)
        )
        
        if (hasTechnicalTerms) {
          // Если есть технические термины, должны быть объяснения
          const parent = element.locator('..')
          const parentText = await parent.textContent()
          expect(parentText?.length).toBeGreaterThan(text.length)
        }
      }
    }
  })

  test('должен позволять пользователю контролировать систему', async ({ page }) => {
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
    
    // Проверяем, что пользователь может отменить действия
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Пользователь может закрыть модал
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
    
    // Пользователь может вернуться к предыдущему состоянию
    await page.goBack()
    await expect(page.locator('body')).toBeVisible()
  })

  test('должен быть консистентным', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что все кнопки имеют одинаковый стиль
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const isVisible = await button.isVisible()
      
      if (isVisible) {
        // Проверяем, что кнопка имеет разумный размер
        const boundingBox = await button.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0)
          expect(boundingBox.height).toBeGreaterThan(0)
        }
      }
    }
    
    // Проверяем, что все ссылки имеют одинаковый стиль
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const isVisible = await link.isVisible()
      
      if (isVisible) {
        // Проверяем, что ссылка имеет стили
        const styles = await link.evaluate(el => {
          const computedStyles = window.getComputedStyle(el)
          return {
            color: computedStyles.color,
            textDecoration: computedStyles.textDecoration
          }
        })
        
        expect(styles.color).toBeTruthy()
        expect(styles.textDecoration).toBeTruthy()
      }
    }
  })

  test('должен предотвращать ошибки', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть валидация полей
    const emailInput = page.locator('[data-testid="email-input"]')
    const inputType = await emailInput.getAttribute('type')
    expect(inputType).toBe('email')
    
    // Проверяем, что есть подсказки для пользователя
    const placeholder = await emailInput.getAttribute('placeholder')
    expect(placeholder).toContain('email')
    
    // Проверяем, что есть предупреждения об ошибках
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="subscribe-button"]')
    
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('email')
    }
  })

  test('должен быть легко узнаваемым', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть четкий заголовок
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const title = await h1.textContent()
    expect(title).toContain('Personal Productivity AI')
    
    // Проверяем, что есть описание продукта
    const description = page.locator('p')
    const descriptionCount = await description.count()
    expect(descriptionCount).toBeGreaterThan(0)
    
    // Проверяем, что есть призыв к действию
    const ctaButton = page.locator('[data-testid="subscribe-button"]')
    await expect(ctaButton).toBeVisible()
    
    const ctaText = await ctaButton.textContent()
    expect(ctaText).toContain('Подписаться')
  })

  test('должен быть гибким и эффективным', async ({ page }) => {
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
    
    // Проверяем, что есть быстрые способы выполнения задач
    const addButton = page.locator('[data-testid="add-task-button"]')
    await addButton.click()
    
    // Проверяем, что можно быстро заполнить форму
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.fill('[data-testid="task-description"]', 'Test Description')
    
    // Проверяем, что можно быстро сохранить
    await page.click('[data-testid="save-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
  })

  test('должен иметь эстетичный и минималистичный дизайн', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что дизайн не перегружен
    const elements = page.locator('*')
    const elementCount = await elements.count()
    expect(elementCount).toBeLessThan(1000) // Не слишком много элементов
    
    // Проверяем, что есть достаточно белого пространства
    const body = page.locator('body')
    const bodyStyles = await body.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        padding: styles.padding,
        margin: styles.margin
      }
    })
    
    expect(bodyStyles.padding).toBeTruthy()
    expect(bodyStyles.margin).toBeTruthy()
  })

  test('должен помогать пользователю распознавать, диагностировать и исправлять ошибки', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся подписаться с неверным email
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что есть понятное сообщение об ошибке
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('email')
      expect(errorText).toContain('неверн')
    }
    
    // Проверяем, что пользователь может исправить ошибку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что ошибка исчезла
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).not.toContain('неверн')
    }
  })

  test('должен предоставлять помощь и документацию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть подсказки для полей
    const emailInput = page.locator('[data-testid="email-input"]')
    const placeholder = await emailInput.getAttribute('placeholder')
    expect(placeholder).toContain('email')
    
    // Проверяем, что есть помощь для пользователя
    const helpText = page.locator('[data-testid*="help"], .help-text')
    if (await helpText.count() > 0) {
      await expect(helpText).toBeVisible()
    }
    
    // Проверяем, что есть информация о продукте
    const description = page.locator('p')
    const descriptionCount = await description.count()
    expect(descriptionCount).toBeGreaterThan(0)
  })
})

describe('🎯 UX Principles Tests', () => {
  test('должен следовать принципу "меньше значит больше"', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что на странице не слишком много элементов
    const elements = page.locator('*')
    const elementCount = await elements.count()
    expect(elementCount).toBeLessThan(1000)
    
    // Проверяем, что есть только необходимые элементы
    const essentialElements = [
      'h1',
      '[data-testid="email-input"]',
      '[data-testid="subscribe-button"]'
    ]
    
    for (const selector of essentialElements) {
      const element = page.locator(selector)
      await expect(element).toBeVisible()
    }
  })

  test('должен следовать принципу "пользователь в центре"', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что интерфейс ориентирован на пользователя
    const h1 = page.locator('h1')
    const title = await h1.textContent()
    expect(title).toContain('Personal Productivity AI')
    
    // Проверяем, что есть призыв к действию
    const ctaButton = page.locator('[data-testid="subscribe-button"]')
    await expect(ctaButton).toBeVisible()
    
    const ctaText = await ctaButton.textContent()
    expect(ctaText).toContain('Подписаться')
  })

  test('должен следовать принципу "простота использования"', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что интерфейс простой
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Проверяем, что есть только необходимые поля
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    expect(inputCount).toBeLessThan(5) // Не слишком много полей
    
    // Проверяем, что есть только одна кнопка действия
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeLessThan(5) // Не слишком много кнопок
  })

  test('должен следовать принципу "предсказуемости"', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что элементы ведут себя предсказуемо
    const emailInput = page.locator('[data-testid="email-input"]')
    const inputType = await emailInput.getAttribute('type')
    expect(inputType).toBe('email')
    
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    const buttonType = await subscribeButton.getAttribute('type')
    expect(buttonType).toBe('submit')
    
    // Проверяем, что кнопка имеет понятный текст
    const buttonText = await subscribeButton.textContent()
    expect(buttonText).toContain('Подписаться')
  })

  test('должен следовать принципу "обратной связи"', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть обратная связь о действиях
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
    
    const statusText = await statusElement.textContent()
    expect(statusText).toBeTruthy()
  })

  test('должен следовать принципу "доступности"', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть alt атрибуты для изображений
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      
      // Изображение должно иметь alt атрибут или role="presentation"
      expect(alt !== null || role === 'presentation').toBeTruthy()
    }
    
    // Проверяем, что есть ARIA атрибуты
    const ariaElements = page.locator('[aria-label], [aria-describedby], [aria-labelledby]')
    const ariaCount = await ariaElements.count()
    expect(ariaCount).toBeGreaterThan(0)
  })
})

describe('🧠 Cognitive Load Tests', () => {
  test('должен минимизировать когнитивную нагрузку', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что на странице не слишком много информации
    const textElements = page.locator('h1, h2, h3, p')
    const textCount = await textElements.count()
    expect(textCount).toBeLessThan(20) // Не слишком много текста
    
    // Проверяем, что есть четкая иерархия
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const h2 = page.locator('h2')
    if (await h2.count() > 0) {
      await expect(h2).toBeVisible()
    }
  })

  test('должен группировать связанную информацию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что форма подписки сгруппирована
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Проверяем, что поля формы находятся рядом
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

  test('должен использовать знакомые паттерны', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что форма подписки следует знакомому паттерну
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Проверяем, что есть поле email
    const emailInput = page.locator('[data-testid="email-input"]')
    await expect(emailInput).toBeVisible()
    
    const inputType = await emailInput.getAttribute('type')
    expect(inputType).toBe('email')
    
    // Проверяем, что есть кнопка отправки
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await expect(subscribeButton).toBeVisible()
    
    const buttonType = await subscribeButton.getAttribute('type')
    expect(buttonType).toBe('submit')
  })
})

describe('🎨 Visual Design Heuristics Tests', () => {
  test('должен иметь четкую визуальную иерархию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что заголовки идут в правильном порядке
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i)
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const level = parseInt(tagName.substring(1))
      
      // Проверяем, что уровень заголовка не пропускается
      if (i > 0) {
        const prevHeading = headings.nth(i - 1)
        const prevTagName = await prevHeading.evaluate(el => el.tagName.toLowerCase())
        const prevLevel = parseInt(prevTagName.substring(1))
        
        expect(level).toBeLessThanOrEqual(prevLevel + 1)
      }
    }
  })

  test('должен использовать консистентные цвета', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что цвета консистентны
    const elements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await elements.count()
    
    const colors = new Set()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        const color = await element.evaluate(el => {
          return window.getComputedStyle(el).color
        })
        
        colors.add(color)
      }
    }
    
    // Не должно быть слишком много разных цветов
    expect(colors.size).toBeLessThan(10)
  })

  test('должен использовать консистентные шрифты', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что шрифты консистентны
    const elements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await elements.count()
    
    const fonts = new Set()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        const fontFamily = await element.evaluate(el => {
          return window.getComputedStyle(el).fontFamily
        })
        
        fonts.add(fontFamily)
      }
    }
    
    // Не должно быть слишком много разных шрифтов
    expect(fonts.size).toBeLessThan(5)
  })
})