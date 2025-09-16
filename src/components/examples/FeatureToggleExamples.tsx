/**
 * Примеры использования Feature Toggles
 */

import { ConditionalRender, FeatureToggle, withFeatureToggle } from '@/components/FeatureToggle';
import { FEATURE_TOGGLES, useFeatureToggle } from '@/hooks/useFeatureToggle';
import React from 'react';

// Пример 1: Простое условное рендеринг
export const SimpleFeatureToggleExample: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Feature Toggle Examples</h2>

      {/* Новые ИИ функции */}
      <FeatureToggle
        toggleName={FEATURE_TOGGLES.NEW_AI_FEATURES}
        fallback={<div className="text-gray-500">ИИ функции временно недоступны</div>}
      >
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Новые ИИ функции</h3>
          <p className="text-blue-700">Доступны новые возможности ИИ планировщика!</p>
        </div>
      </FeatureToggle>

      {/* Премиум подписка */}
      <FeatureToggle
        toggleName={FEATURE_TOGGLES.PREMIUM_SUBSCRIPTION}
        fallback={<div className="text-gray-500">Премиум функции недоступны</div>}
      >
        <div className="bg-gold-50 p-4 rounded-lg mt-4">
          <h3 className="font-semibold text-gold-900">Премиум функции</h3>
          <p className="text-gold-700">Доступны расширенные возможности!</p>
        </div>
      </FeatureToggle>
    </div>
  );
};

// Пример 2: Использование useFeatureToggle хука
export const HookBasedExample: React.FC = () => {
  const { isEnabled, isLoading, error, updateToggle } = useFeatureToggle(FEATURE_TOGGLES.BETA_FEATURES);

  if (isLoading) {
    return <div>Loading beta features...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Beta Features</h3>

      {isEnabled ? (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-800">Бета функции включены!</p>
          <button
            onClick={() => updateToggle(false)}
            className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
          >
            Отключить бета функции
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">Бета функции отключены</p>
          <button
            onClick={() => updateToggle(true)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Включить бета функции
          </button>
        </div>
      )}
    </div>
  );
};

// Пример 3: HOC для оборачивания компонентов
const BetaFeatureComponent: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-purple-50 p-4 rounded-lg">
    <h3 className="font-semibold text-purple-900">{title}</h3>
    <p className="text-purple-700">Это бета функция, доступная только при включенном toggle</p>
  </div>
);

const FallbackComponent: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="font-semibold text-gray-600">{title}</h3>
    <p className="text-gray-500">Функция временно недоступна</p>
  </div>
);

// Оборачиваем компонент в feature toggle
export const HOCExample = withFeatureToggle(
  BetaFeatureComponent,
  FEATURE_TOGGLES.BETA_FEATURES,
  FallbackComponent
);

// Пример 4: Условный рендеринг с ConditionalRender
export const ConditionalRenderExample: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">PWA Features</h3>

      <ConditionalRender
        toggleName={FEATURE_TOGGLES.PWA_FEATURES}
        fallback={<div className="text-gray-500">PWA функции недоступны</div>}
        loadingComponent={<div className="text-blue-500">Загрузка PWA функций...</div>}
      >
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900">PWA функции активны</h4>
          <ul className="text-green-700 mt-2">
            <li>• Офлайн режим</li>
            <li>• Push уведомления</li>
            <li>• Установка как приложение</li>
          </ul>
        </div>
      </ConditionalRender>
    </div>
  );
};

// Пример 5: Комплексный пример с одним toggle
export const ComplexExample: React.FC = () => {
  const {
    isEnabled,
    isLoading,
    error,
    updateToggle
  } = useFeatureToggle(FEATURE_TOGGLES.NEW_AI_FEATURES);

  if (isLoading) {
    return <div>Loading feature toggle...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Feature Toggle Dashboard</h3>

      <div className="p-4 rounded-lg border-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">New AI Features</h4>
            <p className="text-sm text-gray-600">
              {isEnabled ? 'Включено' : 'Отключено'}
            </p>
          </div>
          <button
            onClick={() => updateToggle(!isEnabled)}
            className={`px-3 py-1 rounded text-sm ${isEnabled
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            {isEnabled ? 'Отключить' : 'Включить'}
          </button>
        </div>
      </div>
    </div>
  );
};
