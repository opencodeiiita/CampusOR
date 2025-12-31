import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { tokensServedPerHourMock } from './MockData';

const TokensServedChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tokens Served Per Hour</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={tokensServedPerHourMock}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="served" fill="#10b981" name="Tokens Served" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-2">
        Shows how many tokens were served during each hour of operation
      </p>
    </div>
  );
};

export default TokensServedChart;