import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth-context.js";
import { useApiData } from "@/hooks/useApiData.js";
import BPEntryForm from "@/components/BPEntryForm/index.js";
import BPTrendChart from "@/components/BPTrendChart/index.js";
import ReadingsTable from "@/components/ReadingsTable/index.js";
import DateRangeFilter from "@/components/DateRangeFilter/index.js";
import {
  DEFAULT_PRESET,
  describeRange,
  rangeForPreset,
  type DateRange,
  type RangePreset,
} from "@/lib/date-range.js";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [preset, setPreset] = useState<RangePreset>(DEFAULT_PRESET);
  const [range, setRange] = useState<DateRange>(() => rangeForPreset(DEFAULT_PRESET));

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    data: chartData,
    loading: chartLoading,
    fetching: chartFetching,
    refetch: refetchChart,
  } = useApiData(
    "GetReportReadings",
    { userId: user?.id ?? "", fromDate: range.from, toDate: range.to },
    { enabled: !!user }
  );

  const handleRangeChange = useCallback((p: RangePreset, r: DateRange) => {
    setPreset(p);
    setRange(r);
  }, []);

  const handleNewReading = useCallback(() => {
    // Presets end at "now"; recompute so a reading just saved falls inside the range
    if (preset !== "custom") setRange(rangeForPreset(preset));
    setRefreshKey((k) => k + 1);
    refetchChart();
  }, [preset, refetchChart]);

  if (!user) return null;

  const readings = chartData?.readings ?? [];
  const rangeLabel = describeRange(range);

  return (
    <div className="flex flex-col h-full overflow-auto bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 w-full">
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter preset={preset} range={range} onChange={handleRangeChange} />
          {chartFetching && !chartLoading && (
            <span className="text-xs text-muted-foreground">Updating…</span>
          )}
        </div>

        {/* Top row: Chart + Entry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BPTrendChart
              readings={readings}
              loading={chartFetching}
              subtitle={`${readings.length} reading${readings.length === 1 ? "" : "s"} · ${rangeLabel}`}
            />
          </div>
          <div>
            <BPEntryForm userId={user.id} onSuccess={handleNewReading} />
          </div>
        </div>

        {/* Bottom: Readings Table */}
        <ReadingsTable
          userId={user.id}
          refreshKey={refreshKey}
          fromDate={range.from}
          toDate={range.to}
          onDeleted={refetchChart}
        />
      </div>
    </div>
  );
}
