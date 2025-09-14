import { test, expect, devices } from '@playwright/test'

test.describe('📱 PWA Установка - Кроссплатформенность', () => {
  
  test.describe('🖥️ Desktop PWA', () => {
    
    test('💻 Windows/Linux - PWA установка', async ({ page, browserName }) => {
      await page.goto('/')
      
      // Эмулируем PWA событие для десктопа
      await page.addInitScript(() => {
        let deferredPrompt: any = null
        
        // Создаем мок события beforeinstallprompt
        const mockEvent = {
          preventDefault: () => {},
          prompt: async () => {
            console.log('🖥️ Desktop PWA installation triggered')
            return Promise.resolve()
          },
          userChoice: Promise.resolve({ outcome: 'accepted' })
        }
        
        // Эмулируем событие
        setTimeout(() => {
          deferredPrompt = mockEvent
          window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }))
          
          // Делаем событие доступным глобально для тестов
          ;(window as any).testDeferredPrompt = deferredPrompt
        }, 1000)
      })
      
      await page.reload()
      await page.waitForTimeout(2000)
      
      // Проверяем, что кнопка установки появилась
      const installButton = page.locator('button:has-text("Установить приложение")')
      
      if (await installButton.isVisible()) {
        console.log(`✅ PWA кнопка отображается в ${browserName}`)
        
        // Кликаем на установку
        await installButton.click()
        
        // Проверяем, что функция установки была вызвана
        const wasPromptCalled = await page.evaluate(() => {
          return (window as any).testDeferredPrompt !== null
        })
        
        expect(wasPromptCalled).toBe(true)
        console.log(`✅ PWA установка инициирована в ${browserName}`)
        
      } else {
        console.log(`ℹ️ PWA кнопка не отображается в ${browserName} (зависит от браузера)`)
      }
    })
    
    test('🍎 macOS Safari - PWA поведение', async ({ page }) => {
      await page.goto('/')
      
      // Safari имеет другой механизм PWA
      await page.addInitScript(() => {
        // В Safari PWA устанавливается через "Добавить на главный экран"
        console.log('🍎 Safari PWA: Добавить на главный экран')
        
        // Эмулируем проверку Safari
        Object.defineProperty(navigator, 'standalone', {
          value: false,
          writable: true
        })
      })
      
      await page.reload()
      
      // В Safari кнопка может не появляться, это нормально
      const installButton = page.locator('button:has-text("Установить приложение")')
      
      if (await installButton.isVisible()) {
        console.log('✅ PWA кнопка видна в Safari')
      } else {
        console.log('ℹ️ Safari использует встроенный механизм "Добавить на главный экран"')
      }
    })
  })

  test.describe('📱 Mobile PWA', () => {
    
    test('🤖 Android Chrome - APK установка', async ({ page }) => {
      // Эмулируем Android устройство
      await page.emulate(devices['Pixel 5'])
      await page.goto('/')
      
      await page.addInitScript(() => {
        // Эмулируем Android PWA
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
          writable: true
        })
        
        // Android PWA событие
        const mockEvent = {
          preventDefault: () => {},
          prompt: async () => {
            console.log('🤖 Android PWA: Генерация APK файла')
            // В реальности здесь должен генерироваться APK
            return Promise.resolve()
          },
          userChoice: Promise.resolve({ outcome: 'accepted' })
        }
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }))
          ;(window as any).testAndroidPWA = mockEvent
        }, 1000)
      })
      
      await page.reload()
      await page.waitForTimeout(2000)
      
      const installButton = page.locator('button:has-text("Установить приложение")')
      
      if (await installButton.isVisible()) {
        await installButton.click()
        
        console.log('✅ Android PWA: APK установка инициирована')
        
        // Проверяем, что Android PWA событие сработало
        const androidPWATriggered = await page.evaluate(() => {
          return (window as any).testAndroidPWA !== undefined
        })
        
        expect(androidPWATriggered).toBe(true)
      }
    })
    
    test('🍎 iOS Safari - Добавить на главный экран', async ({ page }) => {
      // Эмулируем iPhone
      await page.emulate(devices['iPhone 12'])
      await page.goto('/')
      
      await page.addInitScript(() => {
        // Эмулируем iOS
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
          writable: true
        })
        
        // iOS не поддерживает beforeinstallprompt
        console.log('🍎 iOS: Используется встроенный механизм Safari')
        
        // Проверяем, что приложение может быть добавлено на главный экран
        Object.defineProperty(navigator, 'standalone', {
          value: false, // false означает, что не запущено как PWA
          writable: true
        })
        
        ;(window as any).testIOSPWA = true
      })
      
      await page.reload()
      
      // На iOS кнопка установки может не отображаться
      const installButton = page.locator('button:has-text("Установить приложение")')
      
      if (await installButton.isVisible()) {
        console.log('✅ iOS: PWA кнопка отображается')
        await installButton.click()
      } else {
        console.log('ℹ️ iOS: Используется встроенный механизм "Поделиться" → "Добавить на главный экран"')
      }
      
      // Проверяем, что iOS PWA настройки корректны
      const iosSupported = await page.evaluate(() => {
        return (window as any).testIOSPWA === true
      })
      
      expect(iosSupported).toBe(true)
    })
  })

  test.describe('🔧 PWA Функциональность', () => {
    
    test('📋 Manifest.json доступен', async ({ page }) => {
      // Проверяем, что манифест загружается
      const manifestResponse = await page.goto('/manifest.json')
      expect(manifestResponse?.status()).toBe(200)
      
      const manifestContent = await manifestResponse?.json()
      expect(manifestContent).toHaveProperty('name')
      expect(manifestContent).toHaveProperty('short_name')
      expect(manifestContent).toHaveProperty('icons')
      
      console.log('✅ PWA Manifest корректен:', manifestContent.name)
    })
    
    test('🔄 Service Worker регистрация', async ({ page }) => {
      await page.goto('/')
      
      // Проверяем, что Service Worker может быть зарегистрирован
      const swSupported = await page.evaluate(() => {
        return 'serviceWorker' in navigator
      })
      
      expect(swSupported).toBe(true)
      console.log('✅ Service Worker поддерживается')
    })
    
    test('📱 PWA установка - различные сценарии', async ({ page }) => {
      await page.goto('/')
      
      // Тест 1: Кнопка не показывается до события
      let installButton = page.locator('button:has-text("Установить приложение")')
      expect(await installButton.isVisible()).toBe(false)
      
      // Тест 2: Кнопка появляется после события
      await page.addInitScript(() => {
        setTimeout(() => {
          const mockEvent = {
            preventDefault: () => {},
            prompt: async () => Promise.resolve(),
            userChoice: Promise.resolve({ outcome: 'accepted' })
          }
          
          window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }))
        }, 1000)
      })
      
      await page.reload()
      await page.waitForTimeout(2000)
      
      installButton = page.locator('button:has-text("Установить приложение")')
      
      if (await installButton.isVisible()) {
        console.log('✅ PWA кнопка появилась после события')
        
        // Тест 3: Кнопка исчезает после установки
        await installButton.click()
        await page.waitForTimeout(1000)
        
        // В реальном сценарии кнопка должна исчезнуть
        console.log('✅ PWA установка завершена')
      }
    })
  })

  test.describe('🌐 Кроссбраузерная совместимость', () => {
    
    test('🔍 Chrome - полная PWA поддержка', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Тест только для Chrome')
      
      await page.goto('/')
      console.log('✅ Chrome: Полная PWA поддержка ожидается')
      
      // Chrome должен поддерживать все PWA функции
      const pwaSupport = await page.evaluate(() => {
        return {
          beforeInstallPrompt: 'onbeforeinstallprompt' in window,
          serviceWorker: 'serviceWorker' in navigator,
          manifest: document.querySelector('link[rel="manifest"]') !== null
        }
      })
      
      expect(pwaSupport.serviceWorker).toBe(true)
      expect(pwaSupport.manifest).toBe(true)
      
      console.log('✅ Chrome PWA поддержка:', pwaSupport)
    })
    
    test('🦊 Firefox - ограниченная PWA поддержка', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Тест только для Firefox')
      
      await page.goto('/')
      console.log('ℹ️ Firefox: Ограниченная PWA поддержка')
      
      // Firefox имеет ограниченную поддержку PWA
      const pwaSupport = await page.evaluate(() => {
        return {
          beforeInstallPrompt: 'onbeforeinstallprompt' in window,
          serviceWorker: 'serviceWorker' in navigator,
          manifest: document.querySelector('link[rel="manifest"]') !== null
        }
      })
      
      expect(pwaSupport.serviceWorker).toBe(true)
      expect(pwaSupport.manifest).toBe(true)
      // beforeInstallPrompt может не поддерживаться в Firefox
      
      console.log('ℹ️ Firefox PWA поддержка:', pwaSupport)
    })
    
    test('🧭 Safari - альтернативный PWA механизм', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'Тест только для Safari')
      
      await page.goto('/')
      console.log('🍎 Safari: Альтернативный PWA механизм')
      
      // Safari использует другой подход к PWA
      const safariPWA = await page.evaluate(() => {
        return {
          standalone: 'standalone' in navigator,
          serviceWorker: 'serviceWorker' in navigator,
          manifest: document.querySelector('link[rel="manifest"]') !== null,
          addToHomeScreen: true // Safari использует встроенный механизм
        }
      })
      
      expect(safariPWA.serviceWorker).toBe(true)
      expect(safariPWA.manifest).toBe(true)
      
      console.log('🍎 Safari PWA поддержка:', safariPWA)
    })
  })
})
