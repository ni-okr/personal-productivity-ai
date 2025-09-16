/**
 * 🎛️ Enhanced Feature Toggle Hooks для Trunk-based Development
 * 
 * Поддерживает:
 * - Hot и Cold toggles
 * - Кеширование и оптимизацию
 * - Автоматическое обновление
 * - TypeScript типизация
 * - Error handling
 */

import { FEATURE_TOGGLES, featureToggleManager, FeatureToggleName } from '@/lib/featureToggles-enhanced'
import { useCallback, useEffect, useState } from 'react'

export { FEATURE_TOGGLES }
export type { FeatureToggleName }

// Интерфейс для возвращаемого значения хука
export interface UseFeatureToggleReturn {
  isEnabled: boolean
  isLoading: boolean
  error: string | null
  updateToggle: (enabled: boolean) => Promise<boolean>
  refresh: () => Promise<void>
}

// Интерфейс для множественных toggles
export interface UseFeatureTogglesReturn {
  toggles: Record<string, boolean>
  isLoading: boolean
  error: string | null
  updateToggle: (toggleName: string, enabled: boolean) => Promise<boolean>
  refresh: () => Promise<void>
}

// Интерфейс для условного рендеринга
export interface UseConditionalRenderReturn {
  shouldRender: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Хук для работы с одним feature toggle
 */
export const useFeatureToggle = (toggleName: FeatureToggleName): UseFeatureToggleReturn => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchToggle = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const enabled = await featureToggleManager.getToggle(toggleName)
      setIsEnabled(enabled)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`Error fetching feature toggle ${toggleName}:`, err)
    } finally {
      setIsLoading(false)
    }
  }, [toggleName])

  const updateToggle = useCallback(async (enabled: boolean): Promise<boolean> => {
    try {
      setError(null)

      const success = await featureToggleManager.updateToggle(toggleName, enabled)
      if (success) {
        setIsEnabled(enabled)
        // Обновляем кеш
        featureToggleManager.clearCache(toggleName)
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`Error updating feature toggle ${toggleName}:`, err)
      return false
    }
  }, [toggleName])

  const refresh = useCallback(async () => {
    await fetchToggle()
  }, [fetchToggle])

  useEffect(() => {
    fetchToggle()
  }, [fetchToggle])

  return {
    isEnabled,
    isLoading,
    error,
    updateToggle,
    refresh
  }
}

/**
 * Хук для работы с множественными feature toggles
 */
export const useFeatureToggles = (toggleNames: FeatureToggleName[]): UseFeatureTogglesReturn => {
  const [toggles, setToggles] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchToggles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const allToggles = await featureToggleManager.getAllToggles()
      const filteredToggles: Record<string, boolean> = {}

      toggleNames.forEach(name => {
        filteredToggles[name] = allToggles[name] || false
      })

      setToggles(filteredToggles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching feature toggles:', err)
    } finally {
      setIsLoading(false)
    }
  }, [toggleNames])

  const updateToggle = useCallback(async (toggleName: string, enabled: boolean): Promise<boolean> => {
    try {
      setError(null)

      const success = await featureToggleManager.updateToggle(toggleName as FeatureToggleName, enabled)
      if (success) {
        setToggles(prev => ({
          ...prev,
          [toggleName]: enabled
        }))
        // Обновляем кеш
        featureToggleManager.clearCache(toggleName as FeatureToggleName)
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`Error updating feature toggle ${toggleName}:`, err)
      return false
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchToggles()
  }, [fetchToggles])

  useEffect(() => {
    fetchToggles()
  }, [fetchToggles])

  return {
    toggles,
    isLoading,
    error,
    updateToggle,
    refresh
  }
}

/**
 * Хук для условного рендеринга на основе feature toggle
 */
export const useConditionalRender = (toggleName: FeatureToggleName): UseConditionalRenderReturn => {
  const { isEnabled, isLoading, error } = useFeatureToggle(toggleName)

  return {
    shouldRender: isEnabled,
    isLoading,
    error
  }
}

/**
 * Хук для проверки типа toggle (hot/cold)
 */
export const useToggleType = (toggleName: FeatureToggleName) => {
  const [isHot, setIsHot] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkType = async () => {
      try {
        setIsLoading(true)
        const hot = await featureToggleManager.isHotToggle(toggleName)
        setIsHot(hot)
      } catch (error) {
        console.error(`Error checking toggle type for ${toggleName}:`, error)
        setIsHot(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkType()
  }, [toggleName])

  return {
    isHot,
    isCold: isHot === false,
    isLoading,
    canUpdate: isHot === true
  }
}

/**
 * Хук для работы с hot toggles (только те, которые можно обновлять)
 */
export const useHotToggles = () => {
  const [hotToggles, setHotToggles] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHotToggles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const allToggles = await featureToggleManager.getAllToggles()
      const hotToggles: Record<string, boolean> = {}

      for (const [name, enabled] of Object.entries(allToggles)) {
        if (await featureToggleManager.isHotToggle(name as FeatureToggleName)) {
          hotToggles[name] = enabled
        }
      }

      setHotToggles(hotToggles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching hot toggles:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateToggle = useCallback(async (toggleName: string, enabled: boolean): Promise<boolean> => {
    try {
      setError(null)

      const success = await featureToggleManager.updateToggle(toggleName as FeatureToggleName, enabled)
      if (success) {
        setHotToggles(prev => ({
          ...prev,
          [toggleName]: enabled
        }))
        featureToggleManager.clearCache(toggleName as FeatureToggleName)
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`Error updating hot toggle ${toggleName}:`, err)
      return false
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchHotToggles()
  }, [fetchHotToggles])

  useEffect(() => {
    fetchHotToggles()
  }, [fetchHotToggles])

  return {
    hotToggles,
    isLoading,
    error,
    updateToggle,
    refresh
  }
}

/**
 * Хук для работы с cold toggles (только для чтения)
 */
export const useColdToggles = () => {
  const [coldToggles, setColdToggles] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchColdToggles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const allToggles = await featureToggleManager.getAllToggles()
      const coldToggles: Record<string, boolean> = {}

      for (const [name, enabled] of Object.entries(allToggles)) {
        if (!(await featureToggleManager.isHotToggle(name as FeatureToggleName))) {
          coldToggles[name] = enabled
        }
      }

      setColdToggles(coldToggles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching cold toggles:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchColdToggles()
  }, [fetchColdToggles])

  useEffect(() => {
    fetchColdToggles()
  }, [fetchColdToggles])

  return {
    coldToggles,
    isLoading,
    error,
    refresh
  }
}

// Утилиты для работы с toggles
export const useToggleUtils = () => {
  const isEnabled = useCallback(async (toggleName: FeatureToggleName): Promise<boolean> => {
    return await featureToggleManager.getToggle(toggleName)
  }, [])

  const isDisabled = useCallback(async (toggleName: FeatureToggleName): Promise<boolean> => {
    return !(await featureToggleManager.getToggle(toggleName))
  }, [])

  const clearCache = useCallback((toggleName?: FeatureToggleName) => {
    featureToggleManager.clearCache(toggleName)
  }, [])

  return {
    isEnabled,
    isDisabled,
    clearCache
  }
}
