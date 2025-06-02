export type PredictionResult = 'Big' | 'Small';

export interface PredictionItem {
  id: number;
  result: PredictionResult;
  timestamp: string;
  isActual: boolean;
  periodNumber: number;
  issueNumber?: string;
}

export interface PredictionStats {
  total: number;
  correct: number;
  accuracy: number;
  bigCount: number;
  smallCount: number;
  streak: number;
  bigWins: number;
  smallWins: number;
  totalWins: number;
  distribution: number;
  confidence: number;
}

export interface PredictionSettings {
  refreshInterval: number;
  showPredictions: boolean;
  historyLength: number;
}