import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { tokenStatusDistributionMock } from './MockData';

const COLORS: Record<string, string> = {
  'Waiting': '#3b82f6',
  'Served': '#10b981',
  'Skipped': '#f59e0b',
  'Cancelled': '#ef4444'
};

const TokenStatusChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Token Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={tokenStatusDistributionMock}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            dataKey="count"
          >
            {tokenStatusDistributionMock.map((entry) => (
              <Cell key={`cell-${entry.status}`} fill={COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {tokenStatusDistributionMock.map((item) => (
          <div key={item.status} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[item.status] }}
              ></div>
              <span className="text-gray-700">{item.status}</span>
            </div>
            <span className="font-semibold text-gray-900">{item.count}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Shows the current distribution of tokens by their status
      </p>
    </div>
  );
};

export default TokenStatusChart;