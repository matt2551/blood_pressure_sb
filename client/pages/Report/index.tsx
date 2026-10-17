import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth-context.js";
import { useApiData } from "@/hooks/useApiData.js";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BPTrendChart from "@/components/BPTrendChart/index.js";
import ReportControls from "@/components/ReportControls/index.js";
import ReportSummary from "@/components/ReportSummary/index.js";
import ReportReadingsTable from "@/components/ReportReadingsTable/index.js";
import {
  DEFAULT_PRESET,
  describeRange,
  rangeForPreset,
  type DateRange,
  type RangePreset,
} from "@/lib/date-range.js";

export default function ReportPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [preset, setPreset] = useState<RangePreset>(DEFAULT_PRESET);
  const [range, setRange] = useState<DateRange>(() => rangeForPreset(DEFAULT_PRESET));

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  const { data, loading, fetching, isError, error, refetch } = useApiData(
    "GetReportReadings",
    { userId: user?.id ?? "", fromDate: range.from, toDate: range.to },
    { enabled: !!user }
  );

  const handleRangeChange = useCallback((p: RangePreset, r: DateRange) => {
    setPreset(p);
    setRange(r);
  }, []);

  const handlePrint = useCallback(() => window.print(), []);
  const rangeLabel = describeRange(range);
  const readings = data?.readings ?? [];

  if (!user) return null;

  return (
    <div className="flex flex-col h-full overflow-auto bg-muted/30 p-6 print:h-auto print:overflow-visible print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 w-full print:max-w-none print:gap-4">
        <ReportControls
          preset={preset}
          range={range}
          onRangeChange={handleRangeChange}
          onPrint={handlePrint}
          printDisabled={loading || isError}
          fetching={fetching && !loading}
        />

        {loading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError ? (
          <div className="rounded-md border border-destructive/40 bg-background p-5">
            <p className="text-destructive text-sm">
              Couldn't load the report:{" "}
              {error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : String(error)}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className={`flex flex-col gap-6 print:gap-4 ${fetching ? "opacity-70 print:opacity-100" : ""}`}>
            <ReportSummary displayName={user.display_name} rangeLabel={rangeLabel} readings={readings} />
            <div className="break-inside-avoid">
              <BPTrendChart
                readings={readings}
                subtitle={`${readings.length} reading${readings.length === 1 ? "" : "s"} · ${rangeLabel}`}
                animate={false}
              />
            </div>
            <ReportReadingsTable readings={readings} truncated={data?.truncated ?? false} />
          </div>
        )}
      </div>
    </div>
  );
}
