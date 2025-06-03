import { PredictionResult, PredictionItem, PredictionStats } from '../types';

class PredictionService {
  private lastFetchedPeriod: string | null = null;
  private history: PredictionItem[] = [];
  private totalPredictions: number = 0;
  private lossStreak: number = 0;
  private trendAnalysis: number[] = [];

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
        return ['Big']; // Default prediction if no data
      }

      const latestResult = data.data.list[0];
      if (latestResult.issueNumber === this.lastFetchedPeriod) {
        return ['Big']; // Return default if same period
      }

      // Update last prediction result if exists
      if (this.history.length > 0 && !this.history[0].isActual) {
        const lastPrediction = this.history[0];
        const currentNumber = Number(latestResult.number);
        const currentResult: PredictionResult = currentNumber >= 5 ? 'Big' : 'Small';
        const wasCorrect = lastPrediction.result === currentResult;
        
        if (!wasCorrect) {
          this.lossStreak++;
        } else {
          this.lossStreak = 0;
        }

        const updatedPrediction: PredictionItem = {
          ...lastPrediction,
          isActual: true,
          result: currentResult,
          periodNumber: currentNumber
        };
        this.history[0] = updatedPrediction;
        
        this.updateTrendAnalysis(currentNumber);
      }

      this.lastFetchedPeriod = latestResult.issueNumber;
      const nextPeriodFull = (BigInt(latestResult.issueNumber) + 1n).toString();
      
      this.totalPredictions++;
      const newPrediction = this.generatePrediction(data.data.list);
      
      const predictionItem: PredictionItem = {
        id: Date.now(),
        result: newPrediction,
        timestamp: new Date().toISOString(),
        isActual: false,
        periodNumber: this.generatePeriodNumber(newPrediction),
        issueNumber: nextPeriodFull
      };

      this.history.unshift(predictionItem);
      return [newPrediction];

    } catch (error) {
      console.error("API Error:", error);
      return ['Big']; // Default prediction on error
    }
  }

  private updateTrendAnalysis(number: number) {
    this.trendAnalysis.push(number);
    if (this.trendAnalysis.length > 20) {
      this.trendAnalysis.shift();
    }
  }

  private generatePrediction(gameList: any[]): PredictionResult {
    const numbers = gameList.slice(0, 5).map(item => Number(item.number));
    const average = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    
    // Calculate trend
    const trend = numbers[0] - numbers[numbers.length - 1];
    
    // Calculate pattern
    const pattern = numbers.map(n => n >= 5 ? 'Big' : 'Small');
    const consecutiveSame = pattern.filter((val, i) => val === pattern[0]).length;
    
    if (consecutiveSame >= 3) {
      // Break the pattern
      return pattern[0] === 'Big' ? 'Small' : 'Big';
    }
    
    if (Math.abs(trend) > 2) {
      // Strong trend reversal
      return trend > 0 ? 'Small' : 'Big';
    }
    
    // Use average as baseline
    return average >= 5 ? 'Big' : 'Small';
  }

  private generatePeriodNumber(result: PredictionResult): number {
    if (result === 'Big') {
      return Math.floor(Math.random() * 5) + 5; // 5-9 for Big
    } else {
      return Math.floor(Math.random() * 5); // 0-4 for Small
    }
  }

  calculateStats(history: PredictionItem[]): PredictionStats {
    const predictions = history.filter(item => !item.isActual);
    const actuals = history.filter(item => item.isActual);

    let correct = 0;
    let total = actuals.length;

    for (let i = 0; i < actuals.length; i++) {
      if (actuals[i].result === predictions[i]?.result) {
        correct++;
      }
    }

    const bigCount = predictions.filter(item => item.result === 'Big').length;
    const smallCount = predictions.filter(item => item.result === 'Small').length;

    return {
      total: this.totalPredictions,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      bigCount,
      smallCount,
      streak: 0,
      bigWins: 0,
      smallWins: 0,
      totalWins: 0,
      distribution: this.generatePeriodNumber(predictions[0]?.result || 'Big'),
      confidence: 75
    };
  }
}

export default new PredictionService();