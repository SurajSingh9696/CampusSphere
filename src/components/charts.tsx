"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartDatum = {
  label: string;
  value: number;
};

const palette = ["#00A6A6", "#2B59C3", "#F26419", "#6E44FF", "#0B6E4F", "#CE2D4F"];

export function AreaTrendChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="chart-card glass-panel">
      <h3>Trend Analytics</h3>
      <ResponsiveContainer height={240} width="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2B59C3" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#2B59C3" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d7e2ea" strokeDasharray="4 4" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Area dataKey="value" fill="url(#trendGradient)" stroke="#2B59C3" type="monotone" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarUsageChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="chart-card glass-panel">
      <h3>Usage Analytics</h3>
      <ResponsiveContainer height={240} width="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#d7e2ea" strokeDasharray="4 4" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#00A6A6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieDistributionChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="chart-card glass-panel">
      <h3>Distribution</h3>
      <ResponsiveContainer height={240} width="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={55} outerRadius={80} nameKey="label" paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell fill={palette[index % palette.length]} key={entry.label} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
