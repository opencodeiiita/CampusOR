import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { avgWaitTimePerQueueMock } from './MockData';

const WaitTimeChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Wait Time by Queue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={avgWaitTimePerQueueMock} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="queue" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="avgWaitMinutes" fill="#f59e0b" name="Avg Wait (minutes)" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-2">
        Compares average waiting times across different service queues
      </p>
    </div>
  );
};

export default WaitTimeChart;
