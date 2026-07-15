import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskChartProps {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  criticalRisk: number;
}

export function RiskChart({ highRisk, mediumRisk, lowRisk, criticalRisk }: RiskChartProps) {
  const data = [
    { name: 'Low Risk', value: lowRisk, color: '#10b981' },
    { name: 'Medium Risk', value: mediumRisk, color: '#f59e0b' },
    { name: 'High Risk', value: highRisk, color: '#f97316' },
    { name: 'Critical', value: criticalRisk, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-surface-500 text-sm">
        No risk data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            color: '#f8fafc',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
