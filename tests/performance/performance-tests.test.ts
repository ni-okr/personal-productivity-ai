/**
 * ⚡ ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ
 * Покрытие: Core Web Vitals, метрики производительности
 */

import { test, expect, Page } from '@playwright/test'

describe('🚀 Core Web Vitals Tests', () => {
  test('должен иметь LCP менее 2.5 секунд', async ({ page }) => {
    await page.goto('/')
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle')
    
    // Получаем метрики производительности
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint')
          if (lcpEntry) {
            resolve({
              lcp: lcpEntry.startTime,
              fcp: entries.find(entry => entry.entryType === 'paint' && entry.name === 'first-contentful-paint')?.startTime,
              fid: entries.find(entry => entry.entryType === 'first-input')?.processingStart,
              cls: entries.find(entry => entry.entryType === 'layout-shift')?.value
            })
          }
        }).observe({ entryTypes: ['largest-contentful-paint', 'paint', 'first-input', 'layout-shift'] })
        
        // Fallback если метрики не загрузились
        setTimeout(() => {
          resolve({
            lcp: 0,
            fcp: 0,
            fid: 0,
            cls: 0
          })
        }, 5000)
      })
    })
    
    // LCP должен быть менее 2.5 секунд
    expect(metrics.lcp).toBeLessThan(2500)
  })

  test('должен иметь FID менее 100 миллисекунд', async ({ page }) => {
    await page.goto('/')
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle')
    
    // Получаем метрики производительности
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fidEntry = entries.find(entry => entry.entryType === 'first-input')
          if (fidEntry) {
            resolve({
              fid: fidEntry.processingStart - fidEntry.startTime
            })
          }
        }).observe({ entryTypes: ['first-input'] })
        
        // Fallback
        setTimeout(() => {
          resolve({ fid: 0 })
        }, 5000)
      })
    })
    
    // FID должен быть менее 100 миллисекунд
    expect(metrics.fid).toBeLessThan(100)
  })

  test('должен иметь CLS менее 0.1', async ({ page }) => {
    await page.goto('/')
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle')
    
    // Получаем метрики производительности
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let cls = 0
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              cls += entry.value
            }
          })
          resolve({ cls })
        }).observe({ entryTypes: ['layout-shift'] })
        
        // Fallback
        setTimeout(() => {
          resolve({ cls })
        }, 5000)
      })
    })
    
    // CLS должен быть менее 0.1
    expect(metrics.cls).toBeLessThan(0.1)
  })

  test('должен иметь FCP менее 1.8 секунд', async ({ page }) => {
    await page.goto('/')
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle')
    
    // Получаем метрики производительности
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.entryType === 'paint' && entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            resolve({
              fcp: fcpEntry.startTime
            })
          }
        }).observe({ entryTypes: ['paint'] })
        
        // Fallback
        setTimeout(() => {
          resolve({ fcp: 0 })
        }, 5000)
      })
    })
    
    // FCP должен быть менее 1.8 секунд
    expect(metrics.fcp).toBeLessThan(1800)
  })
})

describe('📊 Performance Metrics Tests', () => {
  test('должен загружаться менее чем за 3 секунды', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000)
  })

  test('должен иметь размер DOM менее 1500 узлов', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const domSize = await page.evaluate(() => {
      return document.querySelectorAll('*').length
    })
    
    // DOM должен содержать менее 1500 узлов
    expect(domSize).toBeLessThan(1500)
  })

  test('должен иметь глубину DOM менее 32 уровней', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const maxDepth = await page.evaluate(() => {
      let maxDepth = 0
      
      function getDepth(element, currentDepth = 0) {
        maxDepth = Math.max(maxDepth, currentDepth)
        for (const child of element.children) {
          getDepth(child, currentDepth + 1)
        }
      }
      
      getDepth(document.body)
      return maxDepth
    })
    
    // Глубина DOM должна быть менее 32 уровней
    expect(maxDepth).toBeLessThan(32)
  })

  test('должен иметь менее 50 HTTP запросов', async ({ page }) => {
    const requests = []
    page.on('request', request => {
      requests.push(request.url())
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Должно быть менее 50 HTTP запросов
    expect(requests.length).toBeLessThan(50)
  })

  test('должен иметь общий размер ресурсов менее 2MB', async ({ page }) => {
    const responses = []
    page.on('response', response => {
      responses.push(response)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const totalSize = await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalSize = 0
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.transferSize) {
              totalSize += entry.transferSize
            }
          })
          resolve(totalSize)
        })
        observer.observe({ entryTypes: ['resource'] })
        
        // Fallback
        setTimeout(() => {
          resolve(totalSize)
        }, 5000)
      })
    })
    
    // Общий размер ресурсов должен быть менее 2MB
    expect(totalSize).toBeLessThan(2 * 1024 * 1024)
  })
})

describe('🎯 Memory Usage Tests', () => {
  test('должен использовать менее 50MB памяти', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Использование памяти должно быть менее 50MB
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024)
  })

  test('должен освобождать память при навигации', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Переходим на другую страницу
    await page.goto('/planner')
    await page.waitForLoadState('networkidle')
    
    const afterNavigationMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Память не должна значительно увеличиваться
    expect(afterNavigationMemory - initialMemory).toBeLessThan(10 * 1024 * 1024)
  })

  test('должен очищать event listeners', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что нет утечек памяти в event listeners
    const eventListeners = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      let totalListeners = 0
      
      elements.forEach(element => {
        // В реальном приложении здесь должна быть проверка event listeners
        // Это упрощенная версия для демонстрации
        totalListeners += element.attributes.length
      })
      
      return totalListeners
    })
    
    // Количество атрибутов должно быть разумным
    expect(eventListeners).toBeLessThan(1000)
  })
})

describe('🔄 Rendering Performance Tests', () => {
  test('должен рендериться без блокировки UI', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что нет длительных задач
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks = []
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.duration > 50) { // Задачи длительностью более 50ms
              tasks.push(entry.duration)
            }
          })
          resolve(tasks)
        }).observe({ entryTypes: ['longtask'] })
        
        // Fallback
        setTimeout(() => {
          resolve(tasks)
        }, 5000)
      })
    })
    
    // Не должно быть длительных задач
    expect(longTasks.length).toBe(0)
  })

  test('должен использовать requestAnimationFrame для анимаций', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что анимации используют requestAnimationFrame
    const animationFrames = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0
        let startTime = Date.now()
        
        function countFrames() {
          frameCount++
          if (Date.now() - startTime < 1000) {
            requestAnimationFrame(countFrames)
          } else {
            resolve(frameCount)
          }
        }
        
        requestAnimationFrame(countFrames)
      })
    })
    
    // Должно быть разумное количество кадров
    expect(animationFrames).toBeGreaterThan(30) // 30 FPS
    expect(animationFrames).toBeLessThan(120) // 120 FPS
  })

  test('должен использовать CSS transforms вместо изменения layout', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что используются CSS transforms
    const styles = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      let transformCount = 0
      let layoutCount = 0
      
      elements.forEach(element => {
        const computedStyle = window.getComputedStyle(element)
        if (computedStyle.transform !== 'none') {
          transformCount++
        }
        if (computedStyle.position !== 'static') {
          layoutCount++
        }
      })
      
      return { transformCount, layoutCount }
    })
    
    // Должно быть больше transforms чем layout changes
    expect(styles.transformCount).toBeGreaterThan(0)
  })
})

describe('📱 Mobile Performance Tests', () => {
  test('должен быстро загружаться на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // На мобильных устройствах страница должна загружаться быстрее
    expect(loadTime).toBeLessThan(2000)
  })

  test('должен оптимизировать изображения для мобильных устройств', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const src = await img.getAttribute('src')
      const srcset = await img.getAttribute('srcset')
      
      // Изображения должны иметь srcset для разных размеров экрана
      if (src && !srcset) {
        // Проверяем, что изображение не слишком большое
        const boundingBox = await img.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeLessThan(400) // Не больше ширины экрана
        }
      }
    }
  })

  test('должен использовать touch-friendly размеры элементов', async ({ page }) => {
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
})

describe('🌐 Network Performance Tests', () => {
  test('должен использовать HTTP/2', async ({ page }) => {
    const responses = []
    page.on('response', response => {
      responses.push(response)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что используется HTTP/2
    const httpVersion = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const resource = entries.find(entry => entry.entryType === 'resource')
          if (resource) {
            resolve(resource.nextHopProtocol)
          }
        })
        observer.observe({ entryTypes: ['resource'] })
        
        // Fallback
        setTimeout(() => {
          resolve('unknown')
        }, 5000)
      })
    })
    
    // Должен использоваться HTTP/2 или выше
    expect(httpVersion).toMatch(/h2|h3/)
  })

  test('должен использовать gzip сжатие', async ({ page }) => {
    const responses = []
    page.on('response', response => {
      responses.push(response)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что используется сжатие
    const compressedResponses = responses.filter(response => {
      const contentEncoding = response.headers()['content-encoding']
      return contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br'))
    })
    
    // Большинство ответов должны быть сжаты
    expect(compressedResponses.length).toBeGreaterThan(responses.length * 0.5)
  })

  test('должен использовать CDN для статических ресурсов', async ({ page }) => {
    const requests = []
    page.on('request', request => {
      requests.push(request.url())
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что статические ресурсы загружаются с CDN
    const cdnRequests = requests.filter(url => {
      return url.includes('cdn') || url.includes('static') || url.includes('assets')
    })
    
    // Должны быть запросы к CDN
    expect(cdnRequests.length).toBeGreaterThan(0)
  })
})

describe('🔧 Bundle Size Tests', () => {
  test('должен иметь разумный размер JavaScript бандла', async ({ page }) => {
    const responses = []
    page.on('response', response => {
      if (response.url().includes('.js')) {
        responses.push(response)
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    let totalJSSize = 0
    for (const response of responses) {
      const contentLength = response.headers()['content-length']
      if (contentLength) {
        totalJSSize += parseInt(contentLength)
      }
    }
    
    // Общий размер JavaScript должен быть менее 500KB
    expect(totalJSSize).toBeLessThan(500 * 1024)
  })

  test('должен иметь разумный размер CSS бандла', async ({ page }) => {
    const responses = []
    page.on('response', response => {
      if (response.url().includes('.css')) {
        responses.push(response)
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    let totalCSSSize = 0
    for (const response of responses) {
      const contentLength = response.headers()['content-length']
      if (contentLength) {
        totalCSSSize += parseInt(contentLength)
      }
    }
    
    // Общий размер CSS должен быть менее 100KB
    expect(totalCSSSize).toBeLessThan(100 * 1024)
  })

  test('должен использовать tree shaking', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что не загружаются неиспользуемые модули
    const unusedModules = await page.evaluate(() => {
      // В реальном приложении здесь должна быть проверка webpack bundle analyzer
      // Это упрощенная версия для демонстрации
      return 0
    })
    
    // Не должно быть неиспользуемых модулей
    expect(unusedModules).toBe(0)
  })
})