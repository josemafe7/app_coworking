"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { HourlyOccupancy } from "@/types"

interface OccupancyChartProps {
  data: HourlyOccupancy[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="mb-4">
        <p className="text-sm font-medium">Ocupación hoy</p>
        <p className="text-xs text-muted-foreground">% de espacios ocupados por hora</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(v) => `${v}%`}
            labelFormatter={(v) => `${v}`}
          />
          <Area
            type="monotone"
            dataKey="occupancy"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#occupancyGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
