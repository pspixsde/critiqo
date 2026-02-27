"use client";

import { useMemo } from "react";
import type { Critique } from "@/lib/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface RatingsPieChartProps {
  critiques: Critique[];
}

const COLORS = [
  "#9f1239",
  "#b91c1c",
  "#c2410c",
  "#b45309",
  "#a16207",
  "#a3820a",
  "#4d7c0f",
  "#15803d",
  "#047857",
  "#065f46",
];

export function RatingsPieChart({ critiques }: RatingsPieChartProps) {
  const data = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      name: `${i * 10}-${i * 10 + 10}`,
      value: 0,
    }));
    for (const c of critiques) {
      const idx = Math.min(9, Math.floor(c.score / 10));
      buckets[idx].value += 1;
    }
    return buckets.filter((b) => b.value > 0);
  }, [critiques]);

  const total = critiques.length || 1;

  return (
    <div className="rounded-lg border border-border/50 p-4">
      <h3 className="mb-3 text-sm font-semibold">Rating Distribution</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #333", color: "#e5e5e5" }}
              formatter={(value, _name, item) => {
                const safeValue = Number(value ?? 0);
                const bucket = item.payload.name;
                const pct = ((safeValue / total) * 100).toFixed(1);
                return [`${safeValue} (${pct}%)`, bucket];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
