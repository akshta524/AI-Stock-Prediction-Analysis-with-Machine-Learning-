import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { day: 'Mon', pnl: 400 },
  { day: 'Tue', pnl: -200 },
  { day: 'Wed', pnl: 800 },
  { day: 'Thu', pnl: 1200 },
  { day: 'Fri', pnl: -400 },
  { day: 'Sat', pnl: 300 },
  { day: 'Sun', pnl: 600 },
];

interface DailyPnLChartProps {
  data?: { day: string, pnl: number }[];
}

export const DailyPnLChart: React.FC<DailyPnLChartProps> = ({ data: propData }) => {
  const chartData = propData && propData.length > 0 ? propData : [
    { day: 'Mon', pnl: 400 },
    { day: 'Tue', pnl: -200 },
    { day: 'Wed', pnl: 800 },
    { day: 'Thu', pnl: 1200 },
    { day: 'Fri', pnl: -400 },
    { day: 'Sat', pnl: 300 },
    { day: 'Sun', pnl: 600 },
  ];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            cursor={{ fill: '#ffffff05' }}
            contentStyle={{ 
              backgroundColor: '#1e2130', 
              border: '1px solid #334155', 
              borderRadius: '12px', 
              color: '#fff' 
            }}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#00d4aa' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
