import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface StockChartProps {
  data: any[];
  ticker: string;
  predictionData?: any[];
}

export const StockChart: React.FC<StockChartProps> = ({ data, ticker, predictionData = [] }) => {
  // Combine data for the chart to handle the full X-axis range
  const combinedData = [...data, ...predictionData.map(p => ({ ...p, isPrediction: true }))];

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={combinedData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            domain={['auto', 'auto']}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e2130', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            itemStyle={{ color: '#00d4aa' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            cursor={{ stroke: '#00d4aa', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: number, name: string, props: any) => {
              const isPrediction = props.payload.isPrediction;
              return [
                `$${value.toFixed(2)}`, 
                isPrediction ? 'Predicted Price' : 'Actual Price'
              ];
            }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#00d4aa" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={2000}
            connectNulls
          />
          {predictionData.length > 0 && (
            <Line
              type="monotone"
              dataKey="price"
              stroke="#6366f1"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={2000}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
