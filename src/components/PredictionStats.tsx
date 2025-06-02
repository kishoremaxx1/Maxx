import React from 'react';
import { PredictionStats as PredictionStatsType } from '../types';
import { PieChart, BarChart2, Percent, Hash } from 'lucide-react';

interface PredictionStatsProps {
  stats: PredictionStatsType;
  loading: boolean;
}

const PredictionStats: React.FC<PredictionStatsProps> = ({ stats, loading }) => {
  if (loading && stats.total === 0) {
    return (
      <div className="rounded-lg border shadow-sm p-6 animate-pulse bg-gray-200 dark:bg-gray-700">
        <div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border shadow-sm p-6">
      <div className="flex items-center mb-4">
        <PieChart className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">Statistics</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Percent className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Accuracy</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">
              {stats.accuracy.toFixed(1)}%
            </span>
            <div className="text-xs text-gray-500">
              ({stats.correct}/{stats.total})
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Total Predictions</span>
          </div>
          <span className="font-semibold">
            {stats.total}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Distribution</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              Number: {stats.distribution}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 text-red-500 flex items-center justify-center font-bold">🔥</div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Confidence</span>
          </div>
          <span className="font-semibold">
            {stats.confidence.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-500 dark:bg-blue-600"
            style={{ 
              width: `${stats.total ? (stats.bigCount / stats.total * 100) : 0}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>Big ({stats.bigCount})</span>
          <span>Small ({stats.smallCount})</span>
        </div>
      </div>
    </div>
  );
};

export default PredictionStats;