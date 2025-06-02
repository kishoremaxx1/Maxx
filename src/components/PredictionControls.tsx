import React from 'react';
import { PredictionSettings } from '../types';
import { Settings, RefreshCw, Eye, EyeOff, Clock } from 'lucide-react';

interface PredictionControlsProps {
  settings: PredictionSettings;
  onUpdateSettings: (settings: Partial<PredictionSettings>) => void;
  onRefresh: () => void;
  loading: boolean;
}

const PredictionControls: React.FC<PredictionControlsProps> = ({ 
  settings, 
  onUpdateSettings, 
  onRefresh,
  loading
}) => {
  return (
    <div className="rounded-lg border shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Settings className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">Controls</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Refresh Interval (seconds)
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={settings.refreshInterval}
              onChange={(e) => onUpdateSettings({ refreshInterval: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="ml-2 text-sm font-medium min-w-[40px]">
              {settings.refreshInterval}s
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            History Length
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={settings.historyLength}
              onChange={(e) => onUpdateSettings({ historyLength: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="ml-2 text-sm font-medium min-w-[40px]">
              {settings.historyLength}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Predictions
          </label>
          <button
            onClick={() => onUpdateSettings({ showPredictions: !settings.showPredictions })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.showPredictions ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span className="sr-only">Enable predictions</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showPredictions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="pt-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loading
                ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
        
        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>Next refresh in {settings.refreshInterval}s</span>
        </div>
      </div>
    </div>
  );
};

export default PredictionControls;