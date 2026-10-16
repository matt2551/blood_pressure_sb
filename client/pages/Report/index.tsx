import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth-context.js";
import { useApiData } from "@/hooks/useApiData.js";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BPTrendChart from "@/components/BPTrendChart/index.js";
import ReportControls, { type ReportPreset } from "@/components/ReportControls/index.js";
import ReportSummary from "@/components/ReportSummary/index.js";
import ReportReadingsTable from "@/components/ReportReadingsTable/index.js";

type Range = { from: string | null; to: string | null };

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

/** "Last N days" means today plus the previous N-1 days, in local time. */
function rangeForPreset(preset: Exclude<ReportPreset, "custom">): Range {
  if (preset === "all") return { from: null, to: null };
  const days = Number(preset);
  const from = startOfDay(new Date());
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString(), to: endOfDay(new Date()).toISOString() };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function describeRange(range: Range): string {
  if (!range.from && !range.to) return "All time";
  if (range.from && range.to) return `${fmt(range.from)} – ${fmt(range.to)}`;
  if (range.from) return `Since ${fmt(range.from)}`;
  return `Through ${fmt(range.to!)}`;
}

export default function ReportPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [preset, setPreset] = useState<ReportPreset>("30");
  const [range, setRange] = useState<Range>(() => rangeForPreset("30"));

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  const { data, loading, fetching, isError, error, refetch } = useApiData(
    "GetReportReadings",
    { userId: user?.id ?? "", fromDate: range.from, toDate: range.to },
    { enabled: !!user }
  );

  const handlePresetChange = useCallback((p: Exclude<ReportPreset, "custom">) => {
    setPreset(p);
    setRange(rangeForPreset(p));
  }, []);

  // The picker returns midnight-based ISO strings; widen "to" to the end of that day
  const handlePickerChange = useCallback((value: { from: string; to: string }) => {
    setPreset("custom");
    setRange({
      from: value.from ? startOfDay(new Date(value.from)).toISOString() : null,
      to: value.to ? endOfDay(new Date(value.to)).toISOString() : null,
    });
  }, []);

  const handlePrint = useCallback(() => window.print(), []);

  const pickerValue = useMemo(
    () => ({ from: range.from ?? undefined, to: range.to ?? undefined }),
    [range]
  );
  const rangeLabel = describeRange(range);
  const readings = data?.readings ?? [];

  if (!user) return null;

  return (
    <div className="flex flex-col h-full overflow-auto bg-muted/30 p-6 print:h-auto print:overflow-visible print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 w-full print:max-w-none print:gap-4">
        <ReportControls
          preset={preset}
          pickerValue={pickerValue}
          onPresetChange={handlePresetChange}
          onPickerChange={handlePickerChange}
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
