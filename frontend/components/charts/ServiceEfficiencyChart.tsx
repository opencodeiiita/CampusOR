"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchTokenStatusAnalytics, TokenStatusCount } from "@/lib/api/admin";
import ChartWrapper from "./ChartWrapper";

const COLORS = ["#facc15", "#22c55e", "#ef4444", "#6b7280"];

export default function ServiceEfficiencyChart() {
  const [data, setData] = useState<TokenStatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await fetchTokenStatusAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load token status analytics:", err);
        setError("Failed to load token status data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ChartWrapper
        title="Service Efficiency"
        description="Distribution of token statuses across the system."
      >
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </ChartWrapper>
    );
  }

  if (error) {
    return (
      <ChartWrapper
        title="Service Efficiency"
        description="Distribution of token statuses across the system."
      >
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-red-500">{error}</p>
        </div>
      </ChartWrapper>
    );
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  if (totalCount === 0) {
    return (
      <ChartWrapper
        title="Service Efficiency"
        description="Distribution of token statuses across the system."
      >
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">No token status data available</p>
        </div>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper
      title="Service Efficiency"
      description="Distribution of token statuses across the system."
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            outerRadius={95}
            innerRadius={50}
            paddingAngle={3}
            label={({ name, percent }) =>
              `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
