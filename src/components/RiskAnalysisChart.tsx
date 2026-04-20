import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { subject: 'Volatility', A: 120, fullMark: 150 },
  { subject: 'Beta', A: 98, fullMark: 150 },
  { subject: 'Sharpe', A: 86, fullMark: 150 },
  { subject: 'Alpha', A: 99, fullMark: 150 },
  { subject: 'Drawdown', A: 85, fullMark: 150 },
  { subject: 'Liquidity', A: 65, fullMark: 150 },
];

interface RiskAnalysisChartProps {
  data?: { subject: string, A: number, fullMark: number }[];
}

export const RiskAnalysisChart: React.FC<RiskAnalysisChartProps> = ({ data: propData }) => {
  const chartData = propData && propData.length > 0 ? propData : [
    { subject: 'Volatility', A: 120, fullMark: 150 },
    { subject: 'Beta', A: 98, fullMark: 150 },
    { subject: 'Sharpe', A: 86, fullMark: 150 },
    { subject: 'Alpha', A: 99, fullMark: 150 },
    { subject: 'Drawdown', A: 85, fullMark: 150 },
    { subject: 'Liquidity', A: 65, fullMark: 150 },
  ];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
          <Radar
            name="Risk Profile"
            dataKey="A"
            stroke="#00d4aa"
            fill="#00d4aa"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e2130', 
              border: '1px solid #334155', 
              borderRadius: '12px', 
              color: '#fff' 
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
