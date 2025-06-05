import * as tf from '@tensorflow/tfjs';
import { PredictionResult, PredictionItem, PredictionStats } from '../types';

class PredictionService {
  private lastFetchedPeriod: string | null = null;
  private model: tf.LayersModel | null = null;
  private mapping = { 'Small': 0, 'Big': 1 };
  private reverseMapping = { 0: 'Small', 1: 'Big' };

  private async buildModel() {
    const model = tf.sequential();
    model.add(tf.layers.lstm({
      units: 64,
      activation: 'relu',
      inputShape: [5, 1]
    }));
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  private async preprocessData(data: any[]): Promise<tf.Tensor[]> {
    const numbers = data.map(item => Number(item.number));
    const encoded = numbers.map(n => n >= 5 ? 1 : 0);
    
    const X = [];
    const y = [];
    
    for (let i = 0; i < encoded.length - 5; i++) {
      X.push(encoded.slice(i, i + 5).map(val => [val]));
      y.push(encoded[i + 5]);
    }
    
    return [
      tf.tensor3d(X, [X.length, 5, 1]),
      tf.tensor1d(y)
    ];
  }

  private async trainModel(X: tf.Tensor, y: tf.Tensor) {
    if (!this.model) {
      this.model = await this.buildModel();
    }
    
    await this.model.fit(X, y, {
      epochs: 10,
      verbose: 0
    });
  }

  private async predictNext(data: any[]): Promise<PredictionResult> {
    if (!this.model) {
      const [X, y] = await this.preprocessData(data);
      await this.trainModel(X, y);
      X.dispose();
      y.dispose();
    }
    
    const lastFive = data.slice(-5).map(item => Number(item.number) >= 5 ? 1 : 0);
    const input = tf.tensor3d([lastFive.map(val => [val])], [1, 5, 1]);
    
    const prediction = this.model!.predict(input) as tf.Tensor;
    const result = await prediction.data();
    
    input.dispose();
    prediction.dispose();
    
    return result[0] > 0.5 ? 'Big' : 'Small';
  }

  async fetchResults(): Promise<PredictionResult[]> {
    try {
      const payload = {
        pageSize: 10,
        pageNo: 1,
        typeId: 1,
        language: 0,
        random: "4a0522c6ecd8410496260e686be2a57c",
        signature: "334B5E70A0C9B8918B0B15E517E2069C",
        timestamp: Math.floor(Date.now() / 1000)
      };

      const response = await fetch("https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.data?.list?.length) {
        return ['Big'];
      }

      const prediction = await this.predictNext(data.data.list);
      return [prediction];

    } catch (error) {
      console.error("API Error:", error);
      return ['Big'];
    }
  }

  calculateStats(history: PredictionItem[]): PredictionStats {
    const total = history.length;
    const bigCount = history.filter(item => item.result === 'Big').length;
    const smallCount = history.filter(item => item.result === 'Small').length;
    const correct = history.filter(item => item.isActual && item.result === (item.periodNumber >= 5 ? 'Big' : 'Small')).length;

    return {
      total,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      bigCount,
      smallCount,
      streak: 0,
      bigWins: 0,
      smallWins: 0,
      totalWins: 0,
      distribution: Math.floor(Math.random() * 10),
      confidence: 75
    };
  }
}

export default new PredictionService();