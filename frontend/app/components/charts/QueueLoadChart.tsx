"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { queueLoadMock } from "./MockData";
import ChartWrapper from "./ChartWrapper";

export default function QueueLoadChart() {
  return (
    <ChartWrapper
      title="Queue Load Throughout the Day"
      description="Displays how the number of active tokens changes across different time intervals."
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={queueLoadMock}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ fontWeight: 600 }}
            formatter={(value: number) => [`${value}`, "Active Tokens"]}
          />

          <Line
            type="monotone"
            dataKey="activeTokens"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
            activeDot={{ r: 7 }}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
