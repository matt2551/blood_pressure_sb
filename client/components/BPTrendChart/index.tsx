import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { LineChart } from "@/components/ui/line-chart";

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
      }),
      Systolic: r.systolic,
      Diastolic: r.diastolic,
      ...(r.pulse != null ? { Pulse: r.pulse } : {}),
    }));
  }, [readings]);

  const hasPulse = readings.some((r) => r.pulse != null);

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
          <LineChart
            data={chartData}
            xAxisKey="date"
            categories={hasPulse ? ["Systolic", "Diastolic", "Pulse"] : ["Systolic", "Diastolic"]}
            colors={[
              "var(--chart-1)",
              "var(--chart-2)",
              "var(--chart-3)",
            ]}
            showXAxis
            showYAxis
            showTooltip
            showLegend
            showDots
            lineType="monotone"
            strokeWidth={2}
            gridStyle="dashed"
          />
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
