import React from 'react';
import { PredictionItem } from '../types';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react';

interface CurrentPredictionProps {
  prediction?: PredictionItem;
  loading: boolean;
}

const CurrentPrediction: React.FC<CurrentPredictionProps> = ({ prediction, loading }) => {
  if (loading && !prediction) {
    return (
      <div className="rounded-lg border shadow-sm p-6 h-48 animate-pulse bg-gray-200 dark:bg-gray-700"></div>
    );
  }
  
  if (!prediction) {
    return (
      <div className="rounded-lg border shadow-sm p-6 h-48 flex items-center justify-center">
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
          No prediction available
        </p>
      </div>
    );
  }
  
  const formattedTime = new Date(prediction.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <div className={`rounded-lg border shadow-sm p-6 transition-all duration-300 ${
      prediction.result === 'Big' 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    }`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Current Prediction ({formattedTime})
        </h2>
        
        <div className={`text-7xl font-bold transition-all duration-300 transform hover:scale-110 ${
          prediction.result === 'Big' 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-amber-600 dark:text-amber-400'
        }`}>
          {prediction.result}
          {prediction.result === 'Big' ? (
            <ArrowUp className="inline ml-2 h-12 w-12" />
          ) : (
            <ArrowDown className="inline ml-2 h-12 w-12" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentPrediction