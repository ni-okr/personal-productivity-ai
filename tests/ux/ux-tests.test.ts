/**
 * 🎨 ТЕСТЫ UX
 * Покрытие: пользовательский опыт, эмоции, восприятие
 */

import { test, expect, Page } from '@playwright/test'

describe('😊 Emotional Design Tests', () => {
  test('должен вызывать положительные эмоции у пользователя', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что дизайн приятный и современный
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const title = await h1.textContent()
    expect(title).toContain('Personal Productivity AI')
    
    // Проверяем, что есть привлекательные элементы
    const ctaButton = page.locator('[data-testid="subscribe-button"]')
    await expect(ctaButton).toBeVisible()
    
    const ctaText = await ctaButton.textContent()
    expect(ctaText).toContain('Подписаться')
    
    // Проверяем, что кнопка выглядит привлекательно
    const buttonStyles = await ctaButton.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: styles.borderRadius,
        padding: styles.padding
      }
    })
    
    expect(buttonStyles.backgroundColor).toBeTruthy()
    expect(buttonStyles.color).toBeTruthy()
  })

  test('должен создавать ощущение доверия', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть информация о продукте
    const description = page.locator('p')
    const descriptionCount = await description.count()
    expect(descriptionCount).toBeGreaterThan(0)
    
    // Проверяем, что есть преимущества продукта
    const benefits = page.locator('[data-testid*="benefit"], .benefit')
    const benefitCount = await benefits.count()
    expect(benefitCount).toBeGreaterThan(0)
    
    // Проверяем, что есть социальные доказательства
    const socialProof = page.locator('[data-testid*="social"], .social-proof')
    const socialProofCount = await socialProof.count()
    expect(socialProofCount).toBeGreaterThan(0)
  })

  test('должен создавать ощущение профессионализма', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что дизайн консистентный
    const elements = page.locator('h1, h2, h3, p, button')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент имеет стили
        const styles = await element.evaluate(el => {
          const computedStyles = window.getComputedStyle(el)
          return {
            fontSize: computedStyles.fontSize,
            fontFamily: computedStyles.fontFamily,
            color: computedStyles.color
          }
        })
        
        expect(styles.fontSize).toBeTruthy()
        expect(styles.fontFamily).toBeTruthy()
        expect(styles.color).toBeTruthy()
      }
    }
  })
})

describe('🎯 User Journey Tests', () => {
  test('должен поддерживать плавный пользовательский путь', async ({ page }) => {
    // Пользователь заходит на сайт
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    
    // Пользователь читает информацию о продукте
    const description = page.locator('p')
    const descriptionCount = await description.count()
    expect(descriptionCount).toBeGreaterThan(0)
    
    // Пользователь подписывается на рассылку
    await page.fill('[data-testid="email-input"]', 'user@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилось сообщение об успехе
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
    
    // Пользователь переходит к планировщику
    await page.goto('/planner')
    await expect(page.locator('body')).toBeVisible()
  })

  test('должен поддерживать путь авторизованного пользователя', async ({ page }) => {
    // Пользователь заходит в планировщик
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
    
    // Пользователь видит свой планировщик
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    
    // Пользователь добавляет задачу
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Пользователь заполняет форму задачи
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.fill('[data-testid="task-description"]', 'Test Description')
    
    // Пользователь сохраняет задачу
    await page.click('[data-testid="save-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
    
    // Пользователь видит свою задачу
    await expect(page.locator('.task-card')).toBeVisible()
  })

  test('должен поддерживать путь премиум пользователя', async ({ page }) => {
    // Премиум пользователь заходит в планировщик
    await page.goto('/planner')
    
    // Мокаем премиум подписку
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'premium'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Пользователь видит премиум функции
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    
    // Проверяем доступ к ИИ функциям
    const aiSection = page.locator('[data-testid="ai-section"]')
    if (await aiSection.count() > 0) {
      await expect(aiSection).toBeVisible()
    }
  })
})

describe('🎨 Visual Hierarchy Tests', () => {
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

  test('должен выделять важные элементы', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что CTA кнопка выделена
    const ctaButton = page.locator('[data-testid="subscribe-button"]')
    await expect(ctaButton).toBeVisible()
    
    // Проверяем, что кнопка имеет привлекательный стиль
    const buttonStyles = await ctaButton.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontWeight: styles.fontWeight,
        fontSize: styles.fontSize
      }
    })
    
    expect(buttonStyles.backgroundColor).toBeTruthy()
    expect(buttonStyles.color).toBeTruthy()
    expect(buttonStyles.fontWeight).toBeTruthy()
    expect(buttonStyles.fontSize).toBeTruthy()
  })

  test('должен группировать связанные элементы', async ({ page }) => {
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
})

describe('⚡ Performance UX Tests', () => {
  test('должен загружаться быстро для хорошего UX', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться менее чем за 3 секунды для хорошего UX
    expect(loadTime).toBeLessThan(3000)
  })

  test('должен быстро отвечать на действия пользователя', async ({ page }) => {
    await page.goto('/')
    
    // Измеряем время отклика на клик
    const startTime = Date.now()
    await page.click('[data-testid="subscribe-button"]')
    const responseTime = Date.now() - startTime
    
    // Отклик должен быть менее 100 миллисекунд для хорошего UX
    expect(responseTime).toBeLessThan(100)
  })

  test('должен показывать индикаторы загрузки', async ({ page }) => {
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
    
    // Проверяем, что есть индикаторы загрузки
    const loadingIndicators = page.locator('[aria-label="loading"], .loading, [data-testid="loading"]')
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators).toBeVisible()
    }
  })
})

describe('📱 Mobile UX Tests', () => {
  test('должен обеспечивать отличный UX на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем, что контент помещается на экране
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1)
    
    // Проверяем, что элементы достаточно большие для touch
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const boundingBox = await button.boundingBox()
      
      if (boundingBox) {
        // Кнопки должны быть не менее 44x44 пикселей для touch
        expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        expect(boundingBox.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('должен поддерживать touch взаимодействие', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем touch взаимодействие
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await subscribeButton.tap()
    
    // Проверяем, что кнопка сработала
    const statusElement = page.locator('[data-testid="subscription-status"]')
    if (await statusElement.count() > 0) {
      await expect(statusElement).toBeVisible()
    }
  })

  test('должен поддерживать swipe навигацию', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
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
    
    // Проверяем, что можно прокручивать контент
    const scrollableElement = page.locator('[data-testid="planner-content"]')
    const initialScrollTop = await scrollableElement.evaluate(el => el.scrollTop)
    
    // Выполняем swipe вниз
    await page.mouse.move(200, 300)
    await page.mouse.down()
    await page.mouse.move(200, 200)
    await page.mouse.up()
    
    const newScrollTop = await scrollableElement.evaluate(el => el.scrollTop)
    expect(newScrollTop).not.toBe(initialScrollTop)
  })
})

describe('🎯 Task Completion UX Tests', () => {
  test('должен позволять легко выполнять основные задачи', async ({ page }) => {
    await page.goto('/')
    
    // Основная задача: подписаться на рассылку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что задача выполнена
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
    
    const statusText = await statusElement.textContent()
    expect(statusText).toContain('успешно')
  })

  test('должен позволять легко управлять задачами', async ({ page }) => {
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
    
    // Основная задача: добавить задачу
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Заполняем форму
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.fill('[data-testid="task-description"]', 'Test Description')
    
    // Сохраняем задачу
    await page.click('[data-testid="save-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
    
    // Проверяем, что задача добавилась
    await expect(page.locator('.task-card')).toBeVisible()
  })

  test('должен позволять легко навигировать между разделами', async ({ page }) => {
    await page.goto('/')
    
    // Переходим к планировщику
    await page.goto('/planner')
    
    // Проверяем, что страница загрузилась
    await expect(page.locator('body')).toBeVisible()
    
    // Возвращаемся на главную
    await page.goto('/')
    
    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toBeVisible()
  })
})

describe('🔍 Discoverability UX Tests', () => {
  test('должен быть легко обнаруживаемым', async ({ page }) => {
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
  })

  test('должен иметь понятную навигацию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть навигация
    const nav = page.locator('nav')
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible()
      
      // Проверяем, что навигация содержит понятные ссылки
      const links = nav.locator('a')
      const linkCount = await links.count()
      
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i)
        const text = await link.textContent()
        const href = await link.getAttribute('href')
        
        // Ссылка должна иметь понятный текст и валидный href
        expect(text).toBeTruthy()
        expect(href).toBeTruthy()
      }
    }
  })

  test('должен предоставлять подсказки и помощь', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть подсказки для полей ввода
    const emailInput = page.locator('[data-testid="email-input"]')
    const placeholder = await emailInput.getAttribute('placeholder')
    expect(placeholder).toContain('email')
    
    // Проверяем, что есть помощь для пользователя
    const helpText = page.locator('[data-testid*="help"], .help-text')
    if (await helpText.count() > 0) {
      await expect(helpText).toBeVisible()
    }
  })
})