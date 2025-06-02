import React, { useState, useEffect } from 'react';
import { PredictionItem, PredictionSettings } from '../types';
import PredictionService from '../services/PredictionService';
import PredictionHistory from './PredictionHistory';
import PredictionStats from './PredictionStats';
import PredictionControls from './PredictionControls';
import CurrentPrediction from './CurrentPrediction';

const PredictionDashboard: React.FC = () => {
  const [history, setHistory] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<PredictionSettings>({
    refreshInterval: 60,
    showPredictions: true,
    historyLength: 20
  });
  
  const loadData = async () => {
    setLoading(true);
    try {
      const results = await PredictionService.fetchResults();
      if (results.length > 0) {
        const currentTime = new Date();
        const prediction: PredictionItem = {
          id: Date.now(),
          result: results[0],
          timestamp: currentTime.toISOString(),
          isActual: false
        };
        
        setHistory(prev => {
          const newHistory = [prediction, ...prev].slice(0, settings.historyLength);
          return newHistory;
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData();
    }, settings.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [settings.refreshInterval, settings.showPredictions, settings.historyLength]);
  
  const updateSettings = (newSettings: Partial<PredictionSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  const currentPrediction = history.find(item => !item.isActual);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CurrentPrediction 
            prediction={currentPrediction}
            loading={loading} 
          />
        </div>
        <div>
          <PredictionControls 
            settings={settings} 
            onUpdateSettings={updateSettings} 
            onRefresh={loadData}
            loading={loading}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PredictionHistory 
            history={history}
            loading={loading}
          />
        </div>
        <div>
          <PredictionStats 
            stats={PredictionService.calculateStats(history)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard;