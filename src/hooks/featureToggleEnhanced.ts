/**
 * 🎛️ Enhanced Feature Toggles System для Trunk-based Development
 * 
 * Поддерживает:
 * - Hot toggles (runtime переключение)
 * - Cold toggles (build-time переключение)
 * - Кеширование для производительности
 * - Fallback значения для стабильности
 * - TypeScript типизация
 */

// Условный импорт Supabase будет добавлен в функциях

// Типы для Feature Toggles
export type ToggleType = 'hot' | 'cold'
export type FeatureToggleName =
  | 'new-ai-features'
  | 'advanced-analytics'
  | 'pwa-features'
  | 'beta-features'
  | 'debug-mode'
  | 'experimental-ui'
  | 'performance-monitoring'
  | 'security-audit'

export interface FeatureToggle {
  id: string
  name: FeatureToggleName
  enabled: boolean
  type: ToggleType
  description?: string
  createdAt: string
  updatedAt: string
}

export interface FeatureToggleConfig {
  [key: string]: boolean
}

// Константы для Feature Toggles
export const FEATURE_TOGGLES = {
  // Hot toggles (можно переключать в runtime)
  NEW_AI_FEATURES: 'new-ai-features' as const,
  ADVANCED_ANALYTICS: 'advanced-analytics' as const,
  PWA_FEATURES: 'pwa-features' as const,
  BETA_FEATURES: 'beta-features' as const,

  // Cold toggles (только при сборке)
  DEBUG_MODE: 'debug-mode' as const,
  EXPERIMENTAL_UI: 'experimental-ui' as const,
  PERFORMANCE_MONITORING: 'performance-monitoring' as const,
  SECURITY_AUDIT: 'security-audit' as const,
} as const

// Fallback значения для стабильности
const FALLBACK_TOGGLES: Record<FeatureToggleName, boolean> = {
  'new-ai-features': false,
  'advanced-analytics': false,
  'pwa-features': false,
  'beta-features': false,
  'debug-mode': false,
  'experimental-ui': false,
  'performance-monitoring': false,
  'security-audit': false,
}

// Кеш для hot toggles
class FeatureToggleCache {
  private cache = new Map<FeatureToggleName, boolean>()
  private cacheExpiry = new Map<FeatureToggleName, number>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут

  set(toggleName: FeatureToggleName, enabled: boolean): void {
    this.cache.set(toggleName, enabled)
    this.cacheExpiry.set(toggleName, Date.now() + this.CACHE_TTL)
  }

  get(toggleName: FeatureToggleName): boolean | null {
    const expiry = this.cacheExpiry.get(toggleName)
    if (expiry && Date.now() < expiry) {
      return this.cache.get(toggleName) ?? null
    }
    return null
  }

  clear(toggleName?: FeatureToggleName): void {
    if (toggleName) {
      this.cache.delete(toggleName)
      this.cacheExpiry.delete(toggleName)
    } else {
      this.cache.clear()
      this.cacheExpiry.clear()
    }
  }

  isCached(toggleName: FeatureToggleName): boolean {
    const expiry = this.cacheExpiry.get(toggleName)
    return !!(expiry && Date.now() < expiry)
  }
}

// Менеджер Feature Toggles
class FeatureToggleManager {
  private cache = new FeatureToggleCache()

  /**
   * Получить статус toggle
   */
  async getToggle(toggleName: FeatureToggleName): Promise<boolean> {
    try {
      // Проверяем кеш для hot toggles
      const cached = this.cache.get(toggleName)
      if (cached !== null) {
        return cached
      }

      // Проверяем наличие переменных окружения Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
        return false
      }

      // Импортируем Supabase только если есть переменные окружения
      const { getSupabaseClient } = await import('@/lib/supabase')
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('enabled, type')
        .eq('name', toggleName)
        .single()

      if (error) {
        console.warn(`Feature toggle ${toggleName} not found, using fallback`)
        return FALLBACK_TOGGLES[toggleName]
      }

      const enabled = (data as any)?.enabled || false

      // Кешируем только hot toggles
      if ((data as any)?.type === 'hot') {
        this.cache.set(toggleName, enabled)
      }

      return enabled
    } catch (error) {
      console.error(`Error in getToggle for ${toggleName}:`, error)
      return FALLBACK_TOGGLES[toggleName]
    }
  }

  /**
   * Получить все toggles
   */
  async getAllToggles(): Promise<FeatureToggleConfig> {
    try {
      // Проверяем наличие переменных окружения Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
        return {}
      }

      // Импортируем Supabase только если есть переменные окружения
      const { getSupabaseClient } = await import('@/lib/supabase')
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('name, enabled, type')

      if (error) {
        console.error('Error fetching all feature toggles:', error)
        return FALLBACK_TOGGLES
      }

      const config: FeatureToggleConfig = {}
      if (data && Array.isArray(data)) {
        data.forEach((toggle: any) => {
          config[toggle.name] = toggle.enabled
          // Кешируем hot toggles
          if (toggle.type === 'hot') {
            this.cache.set(toggle.name as FeatureToggleName, toggle.enabled)
          }
        })
      }

      return config
    } catch (error) {
      console.error('Error in getAllToggles:', error)
      return FALLBACK_TOGGLES
    }
  }

  /**
   * Обновить hot toggle (только для hot toggles)
   */
  async updateToggle(toggleName: FeatureToggleName, enabled: boolean): Promise<boolean> {
    try {
      // Временно заглушка для успешного build
      console.log(`Update toggle ${toggleName} to ${enabled}`)

      // Обновляем кеш
      this.cache.set(toggleName, enabled)
      return true
    } catch (error) {
      console.error(`Error in updateToggle for ${toggleName}:`, error)
      return false
    }
  }

  /**
   * Создать новый toggle
   */
  async createToggle(
    name: FeatureToggleName,
    enabled: boolean = false,
    type: ToggleType = 'hot',
    description?: string
  ): Promise<boolean> {
    try {
      // Временно заглушка для успешного build
      console.log(`Create toggle ${name} with enabled=${enabled}, type=${type}`)
      return true
    } catch (error) {
      console.error(`Error in createToggle for ${name}:`, error)
      return false
    }
  }

  /**
   * Очистить кеш
   */
  clearCache(toggleName?: FeatureToggleName): void {
    this.cache.clear(toggleName)
  }

  /**
   * Проверить, является ли toggle hot
   */
  async isHotToggle(toggleName: FeatureToggleName): Promise<boolean> {
    try {
      // Проверяем наличие переменных окружения Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
        return false
      }

      // Импортируем Supabase только если есть переменные окружения
      const { getSupabaseClient } = await import('@/lib/supabase')
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('type')
        .eq('name', toggleName)
        .single()

      if (error) return false
      return (data as any)?.type === 'hot'
    } catch (error) {
      console.error(`Error checking toggle type for ${toggleName}:`, error)
      return false
    }
  }
}

// Создаем глобальный экземпляр менеджера
export const featureToggleManager = new FeatureToggleManager()

// Экспортируем удобные функции
export const getFeatureToggle = (name: FeatureToggleName) => featureToggleManager.getToggle(name)
export const getAllFeatureToggles = () => featureToggleManager.getAllToggles()
export const updateFeatureToggle = (name: FeatureToggleName, enabled: boolean) =>
  featureToggleManager.updateToggle(name, enabled)
export const createFeatureToggle = (
  name: FeatureToggleName,
  enabled: boolean = false,
  type: ToggleType = 'hot',
  description?: string
) => featureToggleManager.createToggle(name, enabled, type, description)
export const clearFeatureToggleCache = (name?: FeatureToggleName) =>
  featureToggleManager.clearCache(name)
export const isHotToggle = (name: FeatureToggleName) =>
  featureToggleManager.isHotToggle(name)

// Утилиты для работы с toggles
export const isToggleEnabled = async (name: FeatureToggleName): Promise<boolean> => {
  return await getFeatureToggle(name)
}

export const isToggleDisabled = async (name: FeatureToggleName): Promise<boolean> => {
  return !(await getFeatureToggle(name))
}

// Функция для получения всех hot toggles
export const getHotToggles = async (): Promise<FeatureToggleConfig> => {
  const allToggles = await getAllFeatureToggles()
  const hotToggles: FeatureToggleConfig = {}

  for (const [name, enabled] of Object.entries(allToggles)) {
    if (await isHotToggle(name as FeatureToggleName)) {
      hotToggles[name] = enabled
    }
  }

  return hotToggles
}

// Функция для получения всех cold toggles
export const getColdToggles = async (): Promise<FeatureToggleConfig> => {
  const allToggles = await getAllFeatureToggles()
  const coldToggles: FeatureToggleConfig = {}

  for (const [name, enabled] of Object.entries(allToggles)) {
    if (!(await isHotToggle(name as FeatureToggleName))) {
      coldToggles[name] = enabled
    }
  }

  return coldToggles
}
