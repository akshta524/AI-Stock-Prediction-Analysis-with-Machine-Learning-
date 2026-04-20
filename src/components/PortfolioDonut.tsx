import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#94a3b8'];

interface PortfolioDonutProps {
  data?: { name: string, value: number }[];
}

export const PortfolioDonut: React.FC<PortfolioDonutProps> = ({ data: propData }) => {
  const chartData = propData && propData.length > 0 ? propData : [
    { name: 'Technology', value: 45 },
    { name: 'Finance', value: 25 },
    { name: 'Healthcare', value: 15 },
    { name: 'Energy', value: 10 },
    { name: 'Others', value: 5 },
  ];

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e2130', 
              border: '1px solid #334155', 
              borderRadius: '12px', 
              color: '#fff', 
              fontSize: '12px' 
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-[#94a3b8] text-xs font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
