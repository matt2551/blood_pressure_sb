import { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

type ChartReading = {
  reading_date: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
};

type BPTrendChartProps = {
  readings: ChartReading[];
  loading?: boolean;
};

export default function BPTrendChart({ readings, loading }: BPTrendChartProps) {
  const chartData = useMemo(() => {
    return readings.map((r) => ({
      date: new Date(r.reading_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      Systolic: r.systolic,
      Diastolic: r.diastolic,
      ...(r.pulse != null ? { Pulse: r.pulse } : {}),
    }));
  }, [readings]);

  const hasPulse = readings.some((r) => r.pulse != null);

  const avgSystolic = useMemo(() => {
    if (readings.length === 0) return 0;
    return Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
  }, [readings]);

  const avgDiastolic = useMemo(() => {
    if (readings.length === 0) return 0;
    return Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
  }, [readings]);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon icon="activity" className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Blood Pressure Trend</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Last {readings.length} readings
      </p>
      <div className={`h-64 ${loading ? "opacity-70" : ""}`}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />

              {/* Mean reference lines */}
              <ReferenceLine
                y={avgSystolic}
                stroke="var(--chart-1)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `Avg Systolic: ${avgSystolic}`,
                  position: "insideTopRight",
                  fill: "var(--chart-1)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceLine
                y={avgDiastolic}
                stroke="var(--chart-2)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `Avg Diastolic: ${avgDiastolic}`,
                  position: "insideBottomRight",
                  fill: "var(--chart-2)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              {/* Data lines */}
              <Line
                dataKey="Systolic"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 2 }}
                activeDot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 4 }}
              />
              <Line
                dataKey="Diastolic"
                type="monotone"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-2)", strokeWidth: 2, r: 2 }}
                activeDot={{ fill: "var(--chart-2)", strokeWidth: 2, r: 4 }}
              />
              {hasPulse && (
                <Line
                  dataKey="Pulse"
                  type="monotone"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-3)", strokeWidth: 2, r: 2 }}
                  activeDot={{ fill: "var(--chart-3)", strokeWidth: 2, r: 4 }}
                />
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Icon icon="chart-no-axes-column" className="w-8 h-8" />
            <p className="text-sm">No readings yet. Add your first one!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
