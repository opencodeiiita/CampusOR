"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { tokenStatusDistributionMock } from "./MockData";
import ChartWrapper from "./ChartWrapper";

const COLORS = ["#facc15", "#22c55e", "#ef4444", "#6b7280"];

export default function ServiceEfficiencyChart() {
  return (
    <ChartWrapper
      title="Service Efficiency"
      description="Distribution of token statuses across the system."
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={tokenStatusDistributionMock}
            dataKey="count"
            nameKey="status"
            outerRadius={95}
            innerRadius={50}
            paddingAngle={3}
            label={({ name, percent }) =>
              `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
            }
          >
            {tokenStatusDistributionMock.map((_, i) => (
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
