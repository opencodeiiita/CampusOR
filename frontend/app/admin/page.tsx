
'use client'; // Required for App Router with client components

import React from 'react';
import QueueLoadChart from '../../components/charts/QueueLoadChart';
import TokensServedChart from '../../components/charts/TokensServedChart';
import WaitTimeChart from '../../components/charts/WaitTimeChart';
import TokenStatusChart from '../../components/charts/TokenStatusChart';

export default function AdminDashboard() {
  // Calculate summary stats from mock data
  const totalActiveTokens = 35;
  const totalServed = 197;
  const avgWaitTime = 16;
  const totalQueues = 5;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time Queue Analytics & Performance Metrics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Active Tokens</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{totalActiveTokens}</div>
            <div className="text-sm text-blue-600 mt-1">Currently in system</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Tokens Served Today</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{totalServed}</div>
            <div className="text-sm text-green-600 mt-1">Completed successfully</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Avg Wait Time</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{avgWaitTime}m</div>
            <div className="text-sm text-orange-600 mt-1">Across all queues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Active Queues</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{totalQueues}</div>
            <div className="text-sm text-gray-600 mt-1">Services available</div>
          </div>
        </div>

        {/* Charts Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QueueLoadChart />
          <TokenStatusChart />
        </div>
        
        {/* Charts Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TokensServedChart />
          <WaitTimeChart />
        </div>
      </div>
    </div>
  );
}