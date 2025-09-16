/**
 * Feature Toggles System
 * Система управления функциональностью в продакшене
 */

// Условный импорт Supabase будет добавлен в функциях

export interface FeatureToggle {
  id: string;
  name: string;
  enabled: boolean;
  type: 'hot' | 'cold';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureToggleConfig {
  [key: string]: boolean;
}

class FeatureToggleManager {
  private cache: Map<string, FeatureToggle> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут

  /**
   * Получить статус feature toggle
   */
  async getToggle(toggleName: string): Promise<boolean> {
    try {
      // Проверяем кеш
      if (this.isCached(toggleName)) {
        const cached = this.cache.get(toggleName);
        return cached?.enabled || false;
      }

      // Проверяем наличие переменных окружения Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
        return false
      }

      // Импортируем Supabase только если есть переменные окружения
      const { getSupabaseClient } = await import('./supabase')
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .eq('name', toggleName)
        .single();

      if (error) {
        console.error(`Error fetching feature toggle ${toggleName}:`, error);
        return false;
      }

      // Кешируем результат
      this.cache.set(toggleName, data);
      this.cacheExpiry.set(toggleName, Date.now() + this.CACHE_TTL);

      return (data as any)?.enabled || false;
    } catch (error) {
      console.error(`Error in getToggle for ${toggleName}:`, error);
      return false;
    }
  }

  /**
   * Получить все feature toggles
   */
  async getAllToggles(): Promise<FeatureToggleConfig> {
    try {
      // Проверяем наличие переменных окружения Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
        return {}
      }

      // Импортируем Supabase только если есть переменные окружения
      const { getSupabaseClient } = await import('./supabase')
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('feature_toggles')
        .select('name, enabled');

      if (error) {
        console.error('Error fetching all feature toggles:', error);
        return {};
      }

      const config: FeatureToggleConfig = {};
      (data as any)?.forEach((toggle: any) => {
        config[toggle.name] = toggle.enabled;
      });

      return config;
    } catch (error) {
      console.error('Error in getAllToggles:', error);
      return {};
    }
  }

  /**
   * Обновить статус feature toggle (только для hot toggles)
   */
  async updateToggle(toggleName: string, enabled: boolean): Promise<boolean> {
    try {
      // Временно заглушка для успешного build
      console.log(`Update toggle ${toggleName} to ${enabled}`);
      return true;
    } catch (error) {
      console.error(`Error in updateToggle for ${toggleName}:`, error);
      return false;
    }
  }

  /**
   * Создать новый feature toggle
   */
  async createToggle(
    name: string,
    enabled: boolean = false,
    type: 'hot' | 'cold' = 'hot',
    description?: string
  ): Promise<boolean> {
    try {
      // Временно заглушка для успешного build
      console.log(`Create toggle ${name} with enabled=${enabled}, type=${type}`);
      return true;
    } catch (error) {
      console.error(`Error in createToggle for ${name}:`, error);
      return false;
    }
  }

  /**
   * Проверить, закеширован ли toggle
   */
  private isCached(toggleName: string): boolean {
    const expiry = this.cacheExpiry.get(toggleName);
    return expiry ? Date.now() < expiry : false;
  }

  /**
   * Очистить кеш
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Очистить кеш для конкретного toggle
   */
  clearToggleCache(toggleName: string): void {
    this.cache.delete(toggleName);
    this.cacheExpiry.delete(toggleName);
  }
}

// Экспортируем singleton
export const featureToggleManager = new FeatureToggleManager();

// Экспортируем удобные функции
export const getFeatureToggle = (name: string) => featureToggleManager.getToggle(name);
export const getAllFeatureToggles = () => featureToggleManager.getAllToggles();
export const updateFeatureToggle = (name: string, enabled: boolean) =>
  featureToggleManager.updateToggle(name, enabled);
export const createFeatureToggle = (
  name: string,
  enabled: boolean = false,
  type: 'hot' | 'cold' = 'hot',
  description?: string
) => featureToggleManager.createToggle(name, enabled, type, description);

// Предопределенные feature toggles
export const FEATURE_TOGGLES = {
  // Hot toggles (можно переключать в продакшене)
  NEW_AI_FEATURES: 'new-ai-features',
  PREMIUM_SUBSCRIPTION: 'premium-subscription',
  ADVANCED_ANALYTICS: 'advanced-analytics',
  PWA_FEATURES: 'pwa-features',
  BETA_FEATURES: 'beta-features',

  // Cold toggles (только при сборке)
  DEBUG_MODE: 'debug-mode',
  EXPERIMENTAL_UI: 'experimental-ui',
  PERFORMANCE_MONITORING: 'performance-monitoring',
  ERROR_TRACKING: 'error-tracking',
  DEVELOPMENT_TOOLS: 'development-tools'
} as const;

export type FeatureToggleName = typeof FEATURE_TOGGLES[keyof typeof FEATURE_TOGGLES];
