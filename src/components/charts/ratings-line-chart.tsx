"use client";

import { useMemo, useState } from "react";
import type { Critique } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RatingsLineChartProps {
  critiques: Critique[];
}

export function RatingsLineChart({ critiques }: RatingsLineChartProps) {
  const ordered = useMemo(
    () =>
      [...critiques].sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      ),
    [critiques]
  );
  const maxStart = Math.max(0, ordered.length - 30);
  const [start, setStart] = useState(maxStart);
  const end = Math.min(start + 30, ordered.length);
  const slice = ordered.slice(start, end).map((c, idx) => ({
    index: start + idx + 1,
    score: c.score,
    title: c.title,
    year: c.releaseYear,
  }));

  return (
    <div className="rounded-lg border border-border/50 p-4">
      <h3 className="mb-3 text-sm font-semibold">Critique Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={slice}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="index" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #333" }}
              formatter={(value) => [`${value ?? 0}/100`, "Rating"]}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as { title: string; year: string } | undefined;
                return p ? `${p.title} (${p.year || "Unknown"})` : "";
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3, fill: "#f59e0b" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {ordered.length > 30 && (
        <input
          type="range"
          min={0}
          max={ordered.length - 30}
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
          className="mt-3 w-full"
        />
      )}
    </div>
  );
}
