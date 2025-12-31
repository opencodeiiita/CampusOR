import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { queueLoadMock } from './MockData';

const QueueLoadChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Queue Load Throughout Day</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={queueLoadMock}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="activeTokens" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Active Tokens"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-2">
        Displays the number of active tokens in the system throughout the day
      </p>
    </div>
  );
};

export default QueueLoadChart;