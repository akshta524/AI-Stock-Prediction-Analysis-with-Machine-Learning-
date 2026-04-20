
/**
 * Simple Linear Regression for Stock Price Prediction
 */
export interface DataPoint {
  date: string;
  price: number;
}

export function predictNextDays(data: DataPoint[], daysToPredict: number = 7): DataPoint[] {
  if (data.length < 2) return [];

  // Convert dates to numerical indices for calculation
  const x = data.map((_, i) => i);
  const y = data.map(d => d.price);

  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  // Calculate slope (m) and intercept (b): y = mx + b
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  const lastDate = new Date(data[data.length - 1].date);
  const predictions: DataPoint[] = [];

  for (let i = 1; i <= daysToPredict; i++) {
    const nextIndex = n + i - 1;
    const predictedPrice = m * nextIndex + b;
    
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    
    predictions.push({
      date: nextDate.toISOString().split('T')[0],
      price: Math.max(0, predictedPrice) // Ensure price isn't negative
    });
  }

  return predictions;
}
