/**
 * Админ панель для управления Feature Toggles
 */

import { FEATURE_TOGGLES, FeatureToggleName, useFeatureToggles } from '@/hooks/useFeatureToggle';
import { createFeatureToggle } from '@/lib/featureToggles';
import React, { useState } from 'react';

interface FeatureToggleAdminProps {
  className?: string;
}

export const FeatureToggleAdmin: React.FC<FeatureToggleAdminProps> = ({ className = '' }) => {
  const [newToggleName, setNewToggleName] = useState('');
  const [newToggleType, setNewToggleType] = useState<'hot' | 'cold'>('hot');
  const [newToggleDescription, setNewToggleDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const {
    toggles,
    isLoading,
    error,
    updateToggle,
    refreshToggles
  } = useFeatureToggles(Object.values(FEATURE_TOGGLES) as FeatureToggleName[]);

  const handleCreateToggle = async () => {
    if (!newToggleName.trim()) return;

    setIsCreating(true);
    try {
      const success = await createFeatureToggle(
        newToggleName,
        false,
        newToggleType,
        newToggleDescription || undefined
      );

      if (success) {
        setNewToggleName('');
        setNewToggleDescription('');
        await refreshToggles();
      }
    } catch (error) {
      console.error('Error creating toggle:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleChange = async (toggleName: FeatureToggleName, enabled: boolean) => {
    await updateToggle(toggleName, enabled);
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">Loading feature toggles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={refreshToggles}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Feature Toggles Management</h2>

        {/* Создание нового toggle */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Create New Toggle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newToggleName}
                onChange={(e) => setNewToggleName(e.target.value)}
                placeholder="toggle-name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newToggleType}
                onChange={(e) => setNewToggleType(e.target.value as 'hot' | 'cold')}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hot">Hot (Runtime)</option>
                <option value="cold">Cold (Build-time)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={newToggleDescription}
                onChange={(e) => setNewToggleDescription(e.target.value)}
                placeholder="Description of what this toggle controls"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleCreateToggle}
                disabled={!newToggleName.trim() || isCreating}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Toggle'}
              </button>
            </div>
          </div>
        </div>

        {/* Список существующих toggles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Existing Toggles</h3>

          {Object.entries(toggles).map(([toggleName, isEnabled]) => (
            <div
              key={toggleName}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{toggleName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isEnabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {toggleName.includes('hot') ? 'Hot Toggle (Runtime)' : 'Cold Toggle (Build-time)'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => handleToggleChange(toggleName as FeatureToggleName, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {isEnabled ? 'Disable' : 'Enable'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка обновления */}
        <div className="mt-6">
          <button
            onClick={refreshToggles}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Toggles
          </button>
        </div>
      </div>
    </div>
  );
};
