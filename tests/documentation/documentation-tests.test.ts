/**
 * 📚 ТЕСТЫ ДОКУМЕНТАЦИИ
 * Покрытие: соответствие документации коду, актуальность, полнота
 */

import { test, expect, Page } from '@playwright/test'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('📖 Code Documentation Tests', () => {
  test('должен проверять наличие JSDoc комментариев в основных файлах', async ({ page }) => {
    // Список основных файлов для проверки
    const mainFiles = [
      'src/lib/auth.ts',
      'src/lib/supabase.ts',
      'src/lib/smartPlanning.ts',
      'src/lib/premiumAI.ts',
      'src/stores/useAppStore.ts',
      'src/utils/validation.ts',
      'src/types/index.ts'
    ]
    
    for (const file of mainFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        
        // Проверяем наличие JSDoc комментариев
        const jsdocRegex = /\/\*\*[\s\S]*?\*\//g
        const jsdocMatches = content.match(jsdocRegex)
        
        expect(jsdocMatches).toBeDefined()
        expect(jsdocMatches.length).toBeGreaterThan(0)
        
        // Проверяем наличие описаний функций
        const functionRegex = /function\s+\w+|const\s+\w+\s*=\s*\(/g
        const functionMatches = content.match(functionRegex)
        
        if (functionMatches) {
          expect(jsdocMatches.length).toBeGreaterThanOrEqual(functionMatches.length * 0.8) // 80% функций должны иметь JSDoc
        }
      }
    }
  })

  test('должен проверять качество JSDoc комментариев', async ({ page }) => {
    const mainFiles = [
      'src/lib/auth.ts',
      'src/lib/supabase.ts',
      'src/lib/smartPlanning.ts',
      'src/lib/premiumAI.ts',
      'src/stores/useAppStore.ts',
      'src/utils/validation.ts'
    ]
    
    for (const file of mainFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        
        // Проверяем наличие JSDoc комментариев
        const jsdocRegex = /\/\*\*[\s\S]*?\*\//g
        const jsdocMatches = content.match(jsdocRegex)
        
        if (jsdocMatches) {
          for (const jsdoc of jsdocMatches) {
            // Проверяем наличие описания
            expect(jsdoc).toContain('@description')
            
            // Проверяем наличие параметров для функций
            if (jsdoc.includes('@param')) {
              const paramRegex = /@param\s+\{\w+\}\s+\w+/g
              const paramMatches = jsdoc.match(paramRegex)
              expect(paramMatches).toBeDefined()
            }
            
            // Проверяем наличие возвращаемого значения
            if (jsdoc.includes('@returns')) {
              const returnsRegex = /@returns\s+\{\w+\}/g
              const returnsMatches = jsdoc.match(returnsRegex)
              expect(returnsMatches).toBeDefined()
            }
            
            // Проверяем наличие примеров использования
            if (jsdoc.includes('@example')) {
              const exampleRegex = /@example[\s\S]*?```/g
              const exampleMatches = jsdoc.match(exampleRegex)
              expect(exampleMatches).toBeDefined()
            }
          }
        }
      }
    }
  })

  test('должен проверять соответствие типов в JSDoc и TypeScript', async ({ page }) => {
    const mainFiles = [
      'src/lib/auth.ts',
      'src/lib/supabase.ts',
      'src/lib/smartPlanning.ts',
      'src/lib/premiumAI.ts',
      'src/stores/useAppStore.ts',
      'src/utils/validation.ts'
    ]
    
    for (const file of mainFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        
        // Проверяем соответствие типов
        const jsdocRegex = /\/\*\*[\s\S]*?\*\//g
        const jsdocMatches = content.match(jsdocRegex)
        
        if (jsdocMatches) {
          for (const jsdoc of jsdocMatches) {
            // Проверяем типы параметров
            const paramRegex = /@param\s+\{(\w+)\}\s+(\w+)/g
            let paramMatch
            
            while ((paramMatch = paramRegex.exec(jsdoc)) !== null) {
              const jsdocType = paramMatch[1]
              const paramName = paramMatch[2]
              
              // Проверяем, что тип в JSDoc соответствует TypeScript типу
              const tsTypeRegex = new RegExp(`${paramName}\\s*:\\s*(\\w+)`, 'g')
              const tsTypeMatch = content.match(tsTypeRegex)
              
              if (tsTypeMatch) {
                const tsType = tsTypeMatch[0].split(':')[1].trim()
                expect(jsdocType).toBe(tsType)
              }
            }
          }
        }
      }
    }
  })
})

describe('📋 API Documentation Tests', () => {
  test('должен проверять наличие API документации', async ({ page }) => {
    // Проверяем наличие API документации
    const apiDocFiles = [
      'docs/api/auth.md',
      'docs/api/tasks.md',
      'docs/api/ai.md',
      'docs/api/subscription.md'
    ]
    
    for (const file of apiDocFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        
        // Проверяем наличие основных разделов
        expect(content).toContain('# API Documentation')
        expect(content).toContain('## Endpoints')
        expect(content).toContain('## Request/Response')
        expect(content).toContain('## Examples')
        expect(content).toContain('## Error Codes')
      }
    }
  })

  test('должен проверять актуальность API документации', async ({ page }) => {
    // Проверяем, что API документация соответствует реальным endpoint'ам
    const apiEndpoints = [
      { path: '/api/subscribe', method: 'POST', description: 'Subscribe to newsletter' },
      { path: '/api/test', method: 'GET', description: 'Test API endpoint' }
    ]
    
    for (const endpoint of apiEndpoints) {
      // Проверяем, что endpoint существует
      const response = await page.request.get(endpoint.path)
      expect(response.status()).toBeDefined()
      
      // Проверяем, что endpoint описан в документации
      const apiDocPath = join(process.cwd(), 'docs/api/endpoints.md')
      if (existsSync(apiDocPath)) {
        const content = readFileSync(apiDocPath, 'utf-8')
        expect(content).toContain(endpoint.path)
        expect(content).toContain(endpoint.method)
        expect(content).toContain(endpoint.description)
      }
    }
  })

  test('должен проверять полноту API документации', async ({ page }) => {
    const apiDocPath = join(process.cwd(), 'docs/api/endpoints.md')
    
    if (existsSync(apiDocPath)) {
      const content = readFileSync(apiDocPath, 'utf-8')
      
      // Проверяем наличие всех необходимых разделов
      const requiredSections = [
        '## Authentication',
        '## Task Management',
        '## AI Features',
        '## Subscription',
        '## Error Handling',
        '## Rate Limiting',
        '## Security'
      ]
      
      for (const section of requiredSections) {
        expect(content).toContain(section)
      }
      
      // Проверяем наличие примеров для каждого endpoint'а
      const endpointRegex = /## \w+\s*\(/g
      const endpointMatches = content.match(endpointRegex)
      
      if (endpointMatches) {
        for (const endpoint of endpointMatches) {
          const endpointName = endpoint.replace('## ', '').replace(' (', '')
          expect(content).toContain(`### ${endpointName}`)
          expect(content).toContain('**Request:**')
          expect(content).toContain('**Response:**')
          expect(content).toContain('**Example:**')
        }
      }
    }
  })
})

describe('📖 User Documentation Tests', () => {
  test('должен проверять наличие пользовательской документации', async ({ page }) => {
    // Проверяем наличие пользовательской документации
    const userDocFiles = [
      'docs/user/getting-started.md',
      'docs/user/features.md',
      'docs/user/troubleshooting.md',
      'docs/user/faq.md'
    ]
    
    for (const file of userDocFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        
        // Проверяем наличие основных разделов
        expect(content).toContain('# User Guide')
        expect(content).toContain('## Overview')
        expect(content).toContain('## Getting Started')
        expect(content).toContain('## Features')
        expect(content).toContain('## Troubleshooting')
      }
    }
  })

  test('должен проверять качество пользовательской документации', async ({ page }) => {
    const userDocPath = join(process.cwd(), 'docs/user/getting-started.md')
    
    if (existsSync(userDocPath)) {
      const content = readFileSync(userDocPath, 'utf-8')
      
      // Проверяем наличие скриншотов
      expect(content).toContain('![Screenshot]')
      
      // Проверяем наличие пошаговых инструкций
      expect(content).toContain('1. ')
      expect(content).toContain('2. ')
      expect(content).toContain('3. ')
      
      // Проверяем наличие примеров
      expect(content).toContain('**Example:**')
      
      // Проверяем наличие предупреждений
      expect(content).toContain('**Warning:**')
      
      // Проверяем наличие советов
      expect(content).toContain('**Tip:**')
    }
  })

  test('должен проверять актуальность пользовательской документации', async ({ page }) => {
    const userDocPath = join(process.cwd(), 'docs/user/getting-started.md')
    
    if (existsSync(userDocPath)) {
      const content = readFileSync(userDocPath, 'utf-8')
      
      // Проверяем, что документация содержит актуальные функции
      const currentFeatures = [
        'task management',
        'AI planner',
        'productivity analysis',
        'smart sorting',
        'subscription plans'
      ]
      
      for (const feature of currentFeatures) {
        expect(content.toLowerCase()).toContain(feature)
      }
      
      // Проверяем, что документация не содержит устаревших функций
      const deprecatedFeatures = [
        'old feature',
        'deprecated function',
        'legacy API'
      ]
      
      for (const feature of deprecatedFeatures) {
        expect(content.toLowerCase()).not.toContain(feature)
      }
    }
  })
})

describe('🔧 Technical Documentation Tests', () => {
  test('должен проверять наличие технической документации', async ({ page }) => {
    // Проверяем наличие технической документации
    const techDocFiles = [
      'docs/technical/architecture.md',
      'docs/technical/deployment.md',
      'docs/technical/development.md',
      'docs/technical/testing.md'
    ]
    
    for (const file of techDocFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        
        // Проверяем наличие основных разделов
        expect(content).toContain('# Technical Documentation')
        expect(content).toContain('## Overview')
        expect(content).toContain('## Architecture')
        expect(content).toContain('## Deployment')
        expect(content).toContain('## Development')
        expect(content).toContain('## Testing')
      }
    }
  })

  test('должен проверять качество технической документации', async ({ page }) => {
    const techDocPath = join(process.cwd(), 'docs/technical/architecture.md')
    
    if (existsSync(techDocPath)) {
      const content = readFileSync(techDocPath, 'utf-8')
      
      // Проверяем наличие диаграмм
      expect(content).toContain('```mermaid')
      
      // Проверяем наличие схем
      expect(content).toContain('![Architecture Diagram]')
      
      // Проверяем наличие описаний компонентов
      expect(content).toContain('## Components')
      
      // Проверяем наличие описаний взаимодействий
      expect(content).toContain('## Interactions')
      
      // Проверяем наличие описаний данных
      expect(content).toContain('## Data Flow')
    }
  })

  test('должен проверять актуальность технической документации', async ({ page }) => {
    const techDocPath = join(process.cwd(), 'docs/technical/architecture.md')
    
    if (existsSync(techDocPath)) {
      const content = readFileSync(techDocPath, 'utf-8')
      
      // Проверяем, что документация содержит актуальные технологии
      const currentTechnologies = [
        'Next.js 14',
        'React 18',
        'TypeScript 5.4',
        'Tailwind CSS 3.4',
        'Supabase',
        'Zustand',
        'Jest',
        'Playwright'
      ]
      
      for (const tech of currentTechnologies) {
        expect(content).toContain(tech)
      }
      
      // Проверяем, что документация не содержит устаревших технологий
      const deprecatedTechnologies = [
        'Next.js 13',
        'React 17',
        'TypeScript 4.9',
        'Tailwind CSS 2.0'
      ]
      
      for (const tech of deprecatedTechnologies) {
        expect(content).not.toContain(tech)
      }
    }
  })
})

describe('📝 README Documentation Tests', () => {
  test('должен проверять наличие README файла', async ({ page }) => {
    const readmePath = join(process.cwd(), 'README.md')
    
    expect(existsSync(readmePath)).toBe(true)
    
    const content = readFileSync(readmePath, 'utf-8')
    
    // Проверяем наличие основных разделов
    expect(content).toContain('# Personal Productivity AI')
    expect(content).toContain('## Description')
    expect(content).toContain('## Features')
    expect(content).toContain('## Installation')
    expect(content).toContain('## Usage')
    expect(content).toContain('## Contributing')
    expect(content).toContain('## License')
  })

  test('должен проверять качество README файла', async ({ page }) => {
    const readmePath = join(process.cwd(), 'README.md')
    
    if (existsSync(readmePath)) {
      const content = readFileSync(readmePath, 'utf-8')
      
      // Проверяем наличие бейджей
      expect(content).toContain('![Build Status]')
      expect(content).toContain('![Coverage]')
      expect(content).toContain('![License]')
      
      // Проверяем наличие скриншотов
      expect(content).toContain('![Screenshot]')
      
      // Проверяем наличие ссылок
      expect(content).toContain('[')
      expect(content).toContain('](')
      
      // Проверяем наличие примеров кода
      expect(content).toContain('```')
      
      // Проверяем наличие инструкций по установке
      expect(content).toContain('npm install')
      expect(content).toContain('npm run dev')
    }
  })

  test('должен проверять актуальность README файла', async ({ page }) => {
    const readmePath = join(process.cwd(), 'README.md')
    
    if (existsSync(readmePath)) {
      const content = readFileSync(readmePath, 'utf-8')
      
      // Проверяем, что README содержит актуальную информацию
      expect(content).toContain('Personal Productivity AI')
      expect(content).toContain('AI-powered task planner')
      expect(content).toContain('Supabase')
      expect(content).toContain('Next.js')
      expect(content).toContain('TypeScript')
      
      // Проверяем, что README не содержит устаревшей информации
      expect(content).not.toContain('deprecated')
      expect(content).not.toContain('legacy')
      expect(content).not.toContain('old version')
    }
  })
})

describe('🔄 Documentation Maintenance Tests', () => {
  test('должен проверять регулярность обновления документации', async ({ page }) => {
    const docFiles = [
      'README.md',
      'docs/api/endpoints.md',
      'docs/user/getting-started.md',
      'docs/technical/architecture.md'
    ]
    
    for (const file of docFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const stats = require('fs').statSync(filePath)
        const lastModified = stats.mtime
        const now = new Date()
        const daysSinceModified = (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
        
        // Документация должна обновляться не реже раза в месяц
        expect(daysSinceModified).toBeLessThan(30)
      }
    }
  })

  test('должен проверять согласованность документации', async ({ page }) => {
    const docFiles = [
      'README.md',
      'docs/api/endpoints.md',
      'docs/user/getting-started.md',
      'docs/technical/architecture.md'
    ]
    
    const allContent = []
    
    for (const file of docFiles) {
      const filePath = join(process.cwd(), file)
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        allContent.push(content)
      }
    }
    
    // Проверяем, что все файлы содержат одинаковую информацию о версии
    const versionRegex = /version\s*[:=]\s*[\d.]+/gi
    const versions = allContent.map(content => content.match(versionRegex)).filter(Boolean)
    
    if (versions.length > 1) {
      const firstVersion = versions[0][0]
      for (let i = 1; i < versions.length; i++) {
        expect(versions[i][0]).toBe(firstVersion)
      }
    }
  })

  test('должен проверять полноту документации', async ({ page }) => {
    const requiredDocFiles = [
      'README.md',
      'docs/api/endpoints.md',
      'docs/user/getting-started.md',
      'docs/technical/architecture.md',
      'docs/technical/deployment.md',
      'docs/technical/development.md',
      'docs/technical/testing.md',
      'docs/user/features.md',
      'docs/user/troubleshooting.md',
      'docs/user/faq.md'
    ]
    
    for (const file of requiredDocFiles) {
      const filePath = join(process.cwd(), file)
      expect(existsSync(filePath)).toBe(true)
    }
  })
})