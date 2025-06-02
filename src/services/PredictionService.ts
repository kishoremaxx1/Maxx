import { PredictionResult, PredictionItem, PredictionStats } from '../types';

class PredictionService {
  private lastFetchedPeriod: string | null = null;
  private history: PredictionItem[] = [];
  private totalPredictions: number = 0;
  private lossStreak: number = 0;
  private trendAnalysis: number[] = [];
  private patternHistory: string[] = [];
  private consecutivePatterns: { pattern: string, count: number }[] = [];
  private movingAverages: number[] = [];
  private volatilityIndex: number = 0;

  async fetchResults(): Promise<PredictionResult[]> {
    try {
      const response = await fetch("https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSize: 50, // Increased for better pattern analysis
          pageNo: 1,
          typeId: 1,
          language: 0,
          random: Math.random().toString(36).substring(2),
          signature: "334B5E70A0C9B8918B0B15E517E2069C",
          timestamp: Math.floor(Date.now() / 1000)
        })
      });
      
      const data = await response.json();
      if (!data?.data?.list?.length) {
        return [];
      }

      const latestResult = data.data.list[0];
      if (latestResult.issueNumber === this.lastFetchedPeriod) {
        return [];
      }

      // Update pattern history and analyze patterns
      this.patternHistory = data.data.list
        .slice(0, 30)
        .map((item: any) => Number(item.number) >= 5 ? 'Big' : 'Small');
      
      // Calculate moving averages for trend analysis
      const numbers = data.data.list.slice(0, 20).map((item: any) => Number(item.number));
      this.calculateMovingAverages(numbers);
      this.updateVolatilityIndex(numbers);
      
      this.analyzePatterns();
      this.lastFetchedPeriod = latestResult.issueNumber;
      
      const nextPeriodFull = (BigInt(latestResult.issueNumber) + 1n).toString();
      const currentNumber = Number(latestResult.number);
      const currentResult: PredictionResult = currentNumber >= 5 ? 'Big' : 'Small';

      // Update last prediction result if exists
      if (this.history.length > 0 && !this.history[0].isActual) {
        const lastPrediction = this.history[0];
        const wasCorrect = lastPrediction.result === currentResult;
        
        if (!wasCorrect) {
          this.lossStreak++;
          if (this.lossStreak >= 2) {
            this.resetAnalysis();
          }
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

      this.totalPredictions++;
      const newPrediction = this.generateEnhancedPrediction();
      
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
      return [];
    }
  }

  private calculateMovingAverages(numbers: number[]) {
    const periods = [5, 10, 20];
    this.movingAverages = periods.map(period => {
      const slice = numbers.slice(0, period);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
  }

  private updateVolatilityIndex(numbers: number[]) {
    const changes = numbers.slice(0, -1).map((num, i) => Math.abs(num - numbers[i + 1]));
    this.volatilityIndex = changes.reduce((a, b) => a + b, 0) / changes.length;
  }

  private resetAnalysis() {
    this.trendAnalysis = [];
    this.consecutivePatterns = [];
    this.volatilityIndex = 0;
  }

  private updateTrendAnalysis(number: number) {
    this.trendAnalysis.push(number);
    if (this.trendAnalysis.length > 20) {
      this.trendAnalysis.shift();
    }
  }

  private analyzePatterns() {
    // Find repeating patterns of length 2-5
    for (let len = 2; len <= 5; len++) {
      for (let i = 0; i < this.patternHistory.length - len; i++) {
        const pattern = this.patternHistory.slice(i, i + len).join('');
        const count = this.countPattern(pattern);
        if (count > 1) {
          this.consecutivePatterns.push({ pattern, count });
        }
      }
    }
    
    // Sort by frequency and recency
    this.consecutivePatterns.sort((a, b) => {
      if (b.count === a.count) {
        return this.patternHistory.indexOf(b.pattern) - this.patternHistory.indexOf(a.pattern);
      }
      return b.count - a.count;
    });
  }

  private countPattern(pattern: string): number {
    let count = 0;
    let pos = 0;
    const patternStr = this.patternHistory.join('');
    while (pos < patternStr.length) {
      pos = patternStr.indexOf(pattern, pos);
      if (pos === -1) break;
      count++;
      pos += 1;
    }
    return count;
  }

  private generateEnhancedPrediction(): PredictionResult {
    if (this.lossStreak >= 2) {
      return this.generateDefensivePrediction();
    }
    
    return this.generateSmartPrediction();
  }

  private generateDefensivePrediction(): PredictionResult {
    // Use multiple analysis methods during unstable periods
    const methods = [
      this.analyzePatternBreak.bind(this),
      this.analyzeTrendReversal.bind(this),
      this.analyzeVolatility.bind(this),
      this.analyzeMovingAverages.bind(this)
    ];

    // Weight each method's prediction
    const predictions = methods.map(method => method());
    const bigCount = predictions.filter(p => p === 'Big').length;
    const smallCount = predictions.filter(p => p === 'Small').length;

    // Use majority vote with confidence threshold
    const confidenceThreshold = 0.75;
    const confidence = Math.max(bigCount, smallCount) / predictions.length;

    if (confidence >= confidenceThreshold) {
      return bigCount > smallCount ? 'Big' : 'Small';
    }

    // If no clear consensus, use volatility-based decision
    return this.volatilityIndex > 2 ? 
      this.patternHistory[0] : // Follow last result during high volatility
      (this.patternHistory[0] === 'Big' ? 'Small' : 'Big'); // Alternate during low volatility
  }

  private analyzePatternBreak(): PredictionResult {
    if (this.consecutivePatterns.length === 0) return this.getDefaultPrediction();
    
    const topPattern = this.consecutivePatterns[0];
    const currentPattern = this.patternHistory.slice(0, topPattern.pattern.length - 1).join('');
    
    if (topPattern.pattern.startsWith(currentPattern)) {
      return topPattern.pattern.endsWith('Big') ? 'Small' : 'Big';
    }
    
    return this.getDefaultPrediction();
  }

  private analyzeTrendReversal(): PredictionResult {
    if (this.trendAnalysis.length < 5) return this.getDefaultPrediction();
    
    const recent = this.trendAnalysis.slice(-5);
    const trend = recent[recent.length - 1] - recent[0];
    
    return Math.abs(trend) > 2 ? 
      (trend > 0 ? 'Small' : 'Big') : 
      this.getDefaultPrediction();
  }

  private analyzeVolatility(): PredictionResult {
    if (this.volatilityIndex > 2.5) {
      // High volatility: counter-trend strategy
      return this.patternHistory[0] === 'Big' ? 'Small' : 'Big';
    }
    // Low volatility: trend-following strategy
    return this.patternHistory[0];
  }

  private analyzeMovingAverages(): PredictionResult {
    if (this.movingAverages.length < 3) return this.getDefaultPrediction();
    
    const [ma5, ma10, ma20] = this.movingAverages;
    const shortTermTrend = ma5 > ma10;
    const longTermTrend = ma10 > ma20;
    
    if (shortTermTrend === longTermTrend) {
      return shortTermTrend ? 'Big' : 'Small';
    }
    
    return this.getDefaultPrediction();
  }

  private getDefaultPrediction(): PredictionResult {
    return Math.random() > 0.5 ? 'Big' : 'Small';
  }

  private generateSmartPrediction(): PredictionResult {
    if (this.trendAnalysis.length < 5) {
      return this.patternHistory[0] === 'Big' ? 'Small' : 'Big';
    }

    // Advanced trend analysis
    const trend = this.trendAnalysis.slice(-5);
    const average = trend.reduce((a, b) => a + b, 0) / trend.length;
    const variance = trend.reduce((a, b) => a + Math.pow(b - average, 2), 0) / trend.length;
    const momentum = trend[trend.length - 1] - trend[0];
    
    // Pattern-based prediction with higher weight
    if (this.consecutivePatterns.length > 0) {
      const topPattern = this.consecutivePatterns[0];
      const currentPattern = this.patternHistory.slice(0, topPattern.pattern.length - 1).join('');
      
      if (topPattern.pattern.startsWith(currentPattern)) {
        const predictedNext = topPattern.pattern[topPattern.pattern.length - 1];
        // Use pattern with 80% probability during stable periods
        if (Math.random() < 0.8) {
          return predictedNext as PredictionResult;
        }
      }
    }

    // Volatility-based strategy with momentum consideration
    if (variance > 3) {
      return momentum > 0 ? 'Small' : 'Big';
    }

    // Enhanced momentum strategy
    if (Math.abs(momentum) > 2) {
      const recentTrend = trend.slice(-3);
      const recentMomentum = recentTrend[recentTrend.length - 1] - recentTrend[0];
      
      // Check if momentum is accelerating
      if (Math.abs(recentMomentum) > Math.abs(momentum) / 2) {
        return momentum > 0 ? 'Big' : 'Small';
      }
      return momentum > 0 ? 'Small' : 'Big';
    }

    // Moving average crossover strategy
    if (this.movingAverages.length === 3) {
      const [ma5, ma10, ma20] = this.movingAverages;
      if (ma5 > ma10 && ma10 > ma20) return 'Big';
      if (ma5 < ma10 && ma10 < ma20) return 'Small';
    }

    // Weighted average strategy as fallback
    const weightedAvg = trend.reduce((acc, val, idx) => acc + val * (idx + 1), 0) / 
                       trend.reduce((acc, _, idx) => acc + (idx + 1), 0);
    
    return weightedAvg >= 5 ? 'Big' : 'Small';
  }

  private generatePeriodNumber(result: PredictionResult): number {
    if (this.lossStreak >= 2) {
      // More conservative numbers during losing streak
      return result === 'Big' ? 
        Math.floor(Math.random() * 2) + 5 : // 5-6 for Big
        Math.floor(Math.random() * 2) + 2;  // 2-3 for Small
    }
    
    // Use trend analysis for number generation
    if (this.trendAnalysis.length >= 5) {
      const recent = this.trendAnalysis.slice(-5);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      
      if (result === 'Big') {
        return Math.min(9, Math.max(5, Math.floor(avg + Math.random() * 2)));
      } else {
        return Math.min(4, Math.max(0, Math.floor(avg - Math.random() * 2)));
      }
    }
    
    return result === 'Big' ? 
      Math.floor(Math.random() * 5) + 5 : // 5-9 for Big
      Math.floor(Math.random() * 5);      // 0-4 for Small
  }

  calculateStats(history: PredictionItem[]): PredictionStats {
    const predictions = history.filter(item => !item.isActual);
    const actuals = history.filter(item => item.isActual);

    let correct = 0;
    let total = this.totalPredictions;

    for (let i = 0; i < actuals.length; i++) {
      if (actuals[i].result === predictions[i]?.result) {
        correct++;
      }
    }

    let streak = 0;
    let currentStreak = 0;
    let prevResult: PredictionResult | null = null;

    for (const item of actuals) {
      if (prevResult === item.result) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      
      if (currentStreak > streak) {
        streak = currentStreak;
      }
      
      prevResult = item.result;
    }

    const bigWins = actuals.filter(item => item.result === 'Big').length;
    const smallWins = actuals.filter(item => item.result === 'Small').length;
    const totalWins = bigWins + smallWins;

    const trendStability = this.calculateTrendStability();

    return {
      total,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      bigCount: predictions.filter(item => item.result === 'Big').length,
      smallCount: predictions.filter(item => item.result === 'Small').length,
      streak,
      bigWins,
      smallWins,
      totalWins,
      distribution: this.generatePeriodNumber(predictions[0]?.result || 'Big'),
      confidence: trendStability,
      isUnstable: this.lossStreak >= 2
    };
  }

  private calculateTrendStability(): number {
    if (this.trendAnalysis.length < 5) {
      return 100;
    }

    const trend = this.trendAnalysis.slice(-5);
    const average = trend.reduce((a, b) => a + b, 0) / trend.length;
    const variance = trend.reduce((a, b) => a + Math.pow(b - average, 2), 0) / trend.length;
    
    // Pattern stability score
    const patternStability = this.consecutivePatterns.length > 0 ? 
      (1 / this.consecutivePatterns[0].count) * 50 : 100;

    // Volatility impact
    const volatilityScore = Math.max(0, 100 - (this.volatilityIndex * 20));
    
    // Moving average alignment score
    let maScore = 100;
    if (this.movingAverages.length === 3) {
      const [ma5, ma10, ma20] = this.movingAverages;
      const alignment = (ma5 > ma10 && ma10 > ma20) || (ma5 < ma10 && ma10 < ma20);
      maScore = alignment ? 100 : 50;
    }

    // Combine all stability factors
    const stability = (
      volatilityScore * 0.4 + 
      patternStability * 0.3 + 
      maScore * 0.3
    );
    
    return Math.round(Math.max(0, Math.min(100, stability)));
  }
}

export default new PredictionService();