/**
 * React Hook для работы с Feature Toggles
 */

import { useState, useEffect, useCallback } from 'react';
import { featureToggleManager, FeatureToggleName } from '@/lib/featureToggles';

export interface UseFeatureToggleReturn {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  updateToggle: (enabled: boolean) => Promise<boolean>;
  refreshToggle: () => Promise<void>;
}

/**
 * Хук для работы с одним feature toggle
 */
export const useFeatureToggle = (toggleName: FeatureToggleName): UseFeatureToggleReturn => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToggle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const enabled = await featureToggleManager.getToggle(toggleName);
      setIsEnabled(enabled);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`Error fetching feature toggle ${toggleName}:`, err);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [toggleName]);

  const updateToggle = useCallback(async (enabled: boolean): Promise<boolean> => {
    try {
      setError(null);
      
      const success = await featureToggleManager.updateToggle(toggleName, enabled);
      if (success) {
        setIsEnabled(enabled);
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`Error updating feature toggle ${toggleName}:`, err);
      return false;
    }
  }, [toggleName]);

  const refreshToggle = useCallback(async () => {
    // Очищаем кеш и загружаем заново
    featureToggleManager.clearToggleCache(toggleName);
    await fetchToggle();
  }, [toggleName, fetchToggle]);

  useEffect(() => {
    fetchToggle();
  }, [fetchToggle]);

  return {
    isEnabled,
    isLoading,
    error,
    updateToggle,
    refreshToggle
  };
};

/**
 * Хук для работы с несколькими feature toggles
 */
export const useFeatureToggles = (toggleNames: FeatureToggleName[]) => {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToggles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allToggles = await featureToggleManager.getAllToggles();
      const filteredToggles: Record<string, boolean> = {};
      
      toggleNames.forEach(name => {
        filteredToggles[name] = allToggles[name] || false;
      });
      
      setToggles(filteredToggles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching feature toggles:', err);
      setToggles({});
    } finally {
      setIsLoading(false);
    }
  }, [toggleNames]);

  const updateToggle = useCallback(async (toggleName: FeatureToggleName, enabled: boolean): Promise<boolean> => {
    try {
      setError(null);
      
      const success = await featureToggleManager.updateToggle(toggleName, enabled);
      if (success) {
        setToggles(prev => ({
          ...prev,
          [toggleName]: enabled
        }));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`Error updating feature toggle ${toggleName}:`, err);
      return false;
    }
  }, []);

  const refreshToggles = useCallback(async () => {
    // Очищаем кеш и загружаем заново
    featureToggleManager.clearCache();
    await fetchToggles();
  }, [fetchToggles]);

  useEffect(() => {
    fetchToggles();
  }, [fetchToggles]);

  return {
    toggles,
    isLoading,
    error,
    updateToggle,
    refreshToggles
  };
};

/**
 * Хук для условного рендеринга компонентов
 */
export const useConditionalRender = (toggleName: FeatureToggleName) => {
  const { isEnabled, isLoading, error } = useFeatureToggle(toggleName);

  return {
    shouldRender: isEnabled && !isLoading && !error,
    isLoading,
    error
  };
};
