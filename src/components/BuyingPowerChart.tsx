import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '09:00', value: 40000 },
  { time: '10:00', value: 42000 },
  { time: '11:00', value: 41500 },
  { time: '12:00', value: 44000 },
  { time: '13:00', value: 43000 },
  { time: '14:00', value: 45000 },
  { time: '15:00', value: 45000 },
];

interface BuyingPowerChartProps {
  data?: { time: string, value: number }[];
}

export const BuyingPowerChart: React.FC<BuyingPowerChartProps> = ({ data: propData }) => {
  const chartData = propData && propData.length > 0 ? propData : [
    { time: '09:00', value: 40000 },
    { time: '10:00', value: 42000 },
    { time: '11:00', value: 41500 },
    { time: '12:00', value: 44000 },
    { time: '13:00', value: 43000 },
    { time: '14:00', value: 45000 },
    { time: '15:00', value: 45000 },
  ];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e2130', 
              border: '1px solid #334155', 
              borderRadius: '12px', 
              color: '#fff' 
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorBP)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
