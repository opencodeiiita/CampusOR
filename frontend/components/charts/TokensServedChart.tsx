"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchTokensServedAnalytics, TokensServed } from "@/lib/api/admin";
import ChartWrapper from "./ChartWrapper";

export default function TokensServedChart() {
  const [data, setData] = useState<TokensServed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await fetchTokensServedAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load tokens served analytics:", err);
        setError("Failed to load tokens served data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ChartWrapper
        title="Tokens Served Per Hour"
        description="Shows how many tokens were successfully served during each hourly interval."
      >
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </ChartWrapper>
    );
  }

  if (error) {
    return (
      <ChartWrapper
        title="Tokens Served Per Hour"
        description="Shows how many tokens were successfully served during each hourly interval."
      >
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-red-500">{error}</p>
        </div>
      </ChartWrapper>
    );
  }

  if (data.length === 0) {
    return (
      <ChartWrapper
        title="Tokens Served Per Hour"
        description="Shows how many tokens were successfully served during each hourly interval."
      >
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-gray-500">No tokens served data for today</p>
        </div>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper
      title="Tokens Served Per Hour"
      description="Shows how many tokens were successfully served during each hourly interval."
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="served"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
