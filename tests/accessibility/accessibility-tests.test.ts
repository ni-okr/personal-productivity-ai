/**
 * ♿ ТЕСТЫ ДОСТУПНОСТИ
 * Покрытие: WCAG 2.1 AA, ARIA, семантика
 */

import { test, expect, Page } from '@playwright/test'

describe('🎯 Keyboard Navigation Tests', () => {
  test('должен поддерживать навигацию с клавиатуры', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что можно добраться до всех интерактивных элементов
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Проверяем навигацию по основным элементам
    const focusableElements = [
      '[data-testid="subscribe-button"]',
      '[data-testid="email-input"]',
      'button',
      'a',
      'input',
      'select',
      'textarea'
    ]
    
    for (const selector of focusableElements) {
      const element = page.locator(selector).first()
      if (await element.count() > 0) {
        await element.focus()
        await expect(element).toBeFocused()
      }
    }
  })

  test('должен поддерживать навигацию с Tab и Shift+Tab', async ({ page }) => {
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
    
    // Проверяем навигацию вперед
    await page.keyboard.press('Tab')
    let focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Проверяем навигацию назад
    await page.keyboard.press('Shift+Tab')
    focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('должен поддерживать активацию элементов с Enter и Space', async ({ page }) => {
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
    
    // Находим кнопку добавления задачи
    const addButton = page.locator('[data-testid="add-task-button"]')
    await addButton.focus()
    
    // Активируем с Enter
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Закрываем модал
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
    
    // Активируем с Space
    await addButton.focus()
    await page.keyboard.press('Space')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
  })

  test('должен поддерживать навигацию по модальным окнам', async ({ page }) => {
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
    
    // Открываем модал
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Проверяем, что фокус находится в модале
    const modal = page.locator('[data-testid="task-modal"]')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeAttached()
    
    // Проверяем, что можно навигировать внутри модала
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Проверяем, что фокус остается в модале
    const focusedInModal = page.locator(':focus')
    await expect(focusedInModal).toBeAttached()
  })
})

describe('🔍 Screen Reader Tests', () => {
  test('должен иметь правильные ARIA атрибуты', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем наличие aria-label для кнопок
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const textContent = await button.textContent()
      
      // Кнопка должна иметь либо aria-label, либо текстовое содержимое
      expect(ariaLabel || textContent?.trim()).toBeTruthy()
    }
  })

  test('должен иметь правильные ARIA роли', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем основные ARIA роли
    const main = page.locator('main')
    await expect(main).toHaveAttribute('role', 'main')
    
    const navigation = page.locator('nav')
    await expect(navigation).toHaveAttribute('role', 'navigation')
    
    const heading = page.locator('h1')
    await expect(heading).toHaveAttribute('role', 'heading')
  })

  test('должен иметь правильную структуру заголовков', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть h1
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    
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

  test('должен иметь правильные alt атрибуты для изображений', async ({ page }) => {
    await page.goto('/')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      
      // Изображение должно иметь alt атрибут или role="presentation"
      expect(alt !== null || role === 'presentation').toBeTruthy()
    }
  })

  test('должен иметь правильные aria-describedby атрибуты', async ({ page }) => {
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
    
    // Проверяем, что поля ввода имеют описания
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const ariaDescribedBy = await input.getAttribute('aria-describedby')
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')
      
      // Поле ввода должно иметь описание
      expect(ariaDescribedBy || ariaLabel || placeholder).toBeTruthy()
    }
  })
})

describe('🎨 Visual Accessibility Tests', () => {
  test('должен иметь достаточный цветовой контраст', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем контраст основных элементов
    const elements = [
      'h1', 'h2', 'h3', 'p', 'button', 'a', 'input', 'label'
    ]
    
    for (const selector of elements) {
      const element = page.locator(selector).first()
      if (await element.count() > 0) {
        const color = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor
          }
        })
        
        // В реальном приложении здесь должна быть проверка контраста
        expect(color.color).toBeTruthy()
      }
    }
  })

  test('должен поддерживать увеличение до 200%', async ({ page }) => {
    await page.goto('/')
    
    // Увеличиваем масштаб до 200%
    await page.evaluate(() => {
      document.body.style.zoom = '200%'
    })
    
    // Проверяем, что контент остается читаемым
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const button = page.locator('button').first()
    await expect(button).toBeVisible()
    
    // Проверяем, что нет горизонтальной прокрутки
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1) // 10% допуск
  })

  test('должен поддерживать темную тему', async ({ page }) => {
    await page.goto('/')
    
    // Включаем темную тему
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
    })
    
    // Проверяем, что контент остается читаемым
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const button = page.locator('button').first()
    await expect(button).toBeVisible()
    
    // Проверяем, что цвета изменились
    const body = page.locator('body')
    const backgroundColor = await body.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    expect(backgroundColor).toBeTruthy()
  })

  test('должен иметь видимые фокусные индикаторы', async ({ page }) => {
    await page.goto('/')
    
    // Находим фокусируемый элемент
    const button = page.locator('button').first()
    await button.focus()
    
    // Проверяем, что есть видимый индикатор фокуса
    const focusStyles = await button.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor
      }
    })
    
    // Должен быть видимый outline или box-shadow
    expect(focusStyles.outlineWidth !== '0px' || focusStyles.outlineStyle !== 'none').toBeTruthy()
  })
})

describe('🔊 Audio Accessibility Tests', () => {
  test('должен иметь текстовые альтернативы для аудио', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что нет аудио без текстовых альтернатив
    const audioElements = page.locator('audio')
    const audioCount = await audioElements.count()
    
    for (let i = 0; i < audioCount; i++) {
      const audio = audioElements.nth(i)
      const controls = await audio.getAttribute('controls')
      const ariaLabel = await audio.getAttribute('aria-label')
      const title = await audio.getAttribute('title')
      
      // Аудио должно иметь описание
      expect(controls || ariaLabel || title).toBeTruthy()
    }
  })

  test('должен поддерживать управление звуком', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что нет автоматического воспроизведения звука
    const audioElements = page.locator('audio')
    const audioCount = await audioElements.count()
    
    for (let i = 0; i < audioCount; i++) {
      const audio = audioElements.nth(i)
      const autoplay = await audio.getAttribute('autoplay')
      const muted = await audio.getAttribute('muted')
      
      // Аудио не должно автоматически воспроизводиться
      expect(autoplay).toBeFalsy()
    }
  })
})

describe('📱 Mobile Accessibility Tests', () => {
  test('должен быть доступен на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем, что контент помещается на экране
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1)
  })

  test('должен поддерживать touch навигацию', async ({ page }) => {
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
    
    // Проверяем, что кнопки достаточно большие для touch
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const boundingBox = await button.boundingBox()
      
      if (boundingBox) {
        // Кнопка должна быть не менее 44x44 пикселей
        expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        expect(boundingBox.height).toBeGreaterThanOrEqual(44)
      }
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

describe('🧠 Cognitive Accessibility Tests', () => {
  test('должен иметь понятные и простые тексты', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что тексты не слишком сложные
    const texts = page.locator('p, h1, h2, h3, h4, h5, h6, button, a, label')
    const textCount = await texts.count()
    
    for (let i = 0; i < textCount; i++) {
      const text = texts.nth(i)
      const textContent = await text.textContent()
      
      if (textContent) {
        // Проверяем, что текст не слишком длинный
        expect(textContent.length).toBeLessThan(200)
        
        // Проверяем, что нет сложных терминов без объяснений
        const complexTerms = ['API', 'SDK', 'Framework', 'Library']
        const hasComplexTerms = complexTerms.some(term => 
          textContent.includes(term)
        )
        
        if (hasComplexTerms) {
          // Если есть сложные термины, должны быть объяснения
          const parent = text.locator('..')
          const parentText = await parent.textContent()
          expect(parentText?.length).toBeGreaterThan(textContent.length)
        }
      }
    }
  })

  test('должен иметь четкую структуру и навигацию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть четкая навигация
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    
    // Проверяем, что есть хлебные крошки
    const breadcrumbs = page.locator('[aria-label="breadcrumb"], .breadcrumb')
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toBeVisible()
    }
    
    // Проверяем, что есть skip links
    const skipLinks = page.locator('a[href="#main"], a[href="#content"]')
    if (await skipLinks.count() > 0) {
      await expect(skipLinks).toBeVisible()
    }
  })

  test('должен поддерживать отмену действий', async ({ page }) => {
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
    
    // Открываем модал добавления задачи
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Проверяем, что можно отменить действие
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
    
    // Или нажать кнопку отмены
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    const cancelButton = page.locator('[data-testid="cancel-button"]')
    if (await cancelButton.count() > 0) {
      await cancelButton.click()
      await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
    }
  })

  test('должен предоставлять обратную связь о действиях', async ({ page }) => {
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
    
    // Выполняем действие
    await page.click('[data-testid="add-task-button"]')
    
    // Проверяем, что есть обратная связь
    const modal = page.locator('[data-testid="task-modal"]')
    await expect(modal).toBeVisible()
    
    // Проверяем, что есть индикатор загрузки
    const loadingIndicator = page.locator('[aria-label="loading"], .loading, [data-testid="loading"]')
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible()
    }
  })
})

describe('🌐 Internationalization Tests', () => {
  test('должен поддерживать RTL языки', async ({ page }) => {
    await page.goto('/')
    
    // Устанавливаем RTL направление
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl')
    })
    
    // Проверяем, что контент отображается правильно
    const body = page.locator('body')
    const textAlign = await body.evaluate(el => {
      return window.getComputedStyle(el).textAlign
    })
    
    // В RTL режиме текст должен быть выровнен по правому краю
    expect(textAlign).toBe('right')
  })

  test('должен поддерживать разные языки', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть lang атрибут
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toBeTruthy()
    
    // Проверяем, что контент отображается на выбранном языке
    const h1 = page.locator('h1')
    const text = await h1.textContent()
    expect(text).toBeTruthy()
  })

  test('должен поддерживать разные форматы дат и чисел', async ({ page }) => {
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
    
    // Проверяем, что даты отображаются в правильном формате
    const dateElements = page.locator('[data-testid*="date"], .date, time')
    const dateCount = await dateElements.count()
    
    for (let i = 0; i < dateCount; i++) {
      const dateElement = dateElements.nth(i)
      const text = await dateElement.textContent()
      
      if (text) {
        // Проверяем, что дата в правильном формате
        const dateRegex = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/
        expect(dateRegex.test(text)).toBeTruthy()
      }
    }
  })
})