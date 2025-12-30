
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Saving } from '../types';

interface SavingsChartProps {
  savings: Saving[];
}

export const SavingsChart: React.FC<SavingsChartProps> = ({ savings }) => {
  const sortedSavings = [...savings]
    .filter(s => s.status === 'accepted')
    .sort((a, b) => a.createdAt - b.createdAt);

  let runningTotal = 0;
  const chartData = sortedSavings.map(s => {
    runningTotal += s.amount;
    return {
      date: new Date(s.createdAt).toLocaleDateString(),
      amount: runningTotal
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
        <p className="text-slate-400 text-sm">No savings data yet</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `Rp${(val/1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            formatter={(val: number) => [`Rp ${val.toLocaleString()}`, 'Total Balance']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#4f46e5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
