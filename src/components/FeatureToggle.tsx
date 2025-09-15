/**
 * Компонент для условного рендеринга на основе Feature Toggle
 */

import { FeatureToggleName, useConditionalRender, useFeatureToggle } from '@/hooks/useFeatureToggle';
import React from 'react';

interface FeatureToggleProps {
  toggleName: FeatureToggleName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * Компонент для условного рендеринга на основе feature toggle
 */
export const FeatureToggle: React.FC<FeatureToggleProps> = ({
  toggleName,
  children,
  fallback = null,
  showLoading = true,
  loadingComponent = <div>Loading...</div>
}) => {
  const { isEnabled, isLoading, error } = useFeatureToggle(toggleName);

  if (error) {
    console.error(`Feature toggle error for ${toggleName}:`, error);
    return <>{fallback}</>;
  }

  if (isLoading && showLoading) {
    return <>{loadingComponent}</>;
  }

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Компонент для условного рендеринга с использованием useConditionalRender
 */
export const ConditionalRender: React.FC<FeatureToggleProps> = ({
  toggleName,
  children,
  fallback = null,
  showLoading = true,
  loadingComponent = <div>Loading...</div>
}) => {
  const { shouldRender, isLoading, error } = useConditionalRender(toggleName);

  if (error) {
    console.error(`Feature toggle error for ${toggleName}:`, error);
    return <>{fallback}</>;
  }

  if (isLoading && showLoading) {
    return <>{loadingComponent}</>;
  }

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * HOC для оборачивания компонентов в feature toggle
 */
export const withFeatureToggle = <P extends object>(
  Component: React.ComponentType<P>,
  toggleName: FeatureToggleName,
  fallback?: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isEnabled, isLoading, error } = useFeatureToggle(toggleName);

    if (error) {
      console.error(`Feature toggle error for ${toggleName}:`, error);
      return fallback ? React.createElement(fallback, props) : null;
    }

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isEnabled) {
      return fallback ? React.createElement(fallback, props) : null;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withFeatureToggle(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Компонент для отображения статуса feature toggle (для админки)
 */
interface FeatureToggleStatusProps {
  toggleName: FeatureToggleName;
  showUpdateButton?: boolean;
}

export const FeatureToggleStatus: React.FC<FeatureToggleStatusProps> = ({
  toggleName,
  showUpdateButton = false
}) => {
  const { isEnabled, isLoading, error, updateToggle } = useFeatureToggle(toggleName);

  const handleToggle = async () => {
    await updateToggle(!isEnabled);
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 rounded text-sm ${isEnabled
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
        }`}>
        {isEnabled ? 'Enabled' : 'Disabled'}
      </span>

      {showUpdateButton && (
        <button
          onClick={handleToggle}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
      )}
    </div>
  );
};
