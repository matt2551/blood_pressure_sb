import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

type SummaryReading = {
  systolic: number;
  diastolic: number;
  pulse: number | null;
  reading_date: string;
};

type ReportSummaryProps = {
  displayName: string;
  rangeLabel: string;
  readings: SummaryReading[];
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function StatBox({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-md border px-4 py-3 break-inside-avoid">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold font-mono">{value}</p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

/** Report title block: who, which period, and headline statistics. */
export default function ReportSummary({ displayName, rangeLabel, readings }: ReportSummaryProps) {
  const stats = useMemo(() => {
    if (readings.length === 0) return null;
    const n = readings.length;
    const avgSys = Math.round(readings.reduce((s, r) => s + r.systolic, 0) / n);
    const avgDia = Math.round(readings.reduce((s, r) => s + r.diastolic, 0) / n);
    const pulses = readings.filter((r) => r.pulse != null).map((r) => r.pulse as number);
    const avgPulse = pulses.length ? Math.round(pulses.reduce((s, p) => s + p, 0) / pulses.length) : null;

    // Highest/lowest ranked by systolic, ties broken by diastolic
    const rank = (r: SummaryReading) => r.systolic * 1000 + r.diastolic;
    const highest = readings.reduce((a, b) => (rank(b) > rank(a) ? b : a));
    const lowest = readings.reduce((a, b) => (rank(b) < rank(a) ? b : a));

    return { n, avgSys, avgDia, avgPulse, highest, lowest };
  }, [readings]);

  return (
    <Card className="p-5 print:shadow-none break-inside-avoid">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Icon icon="heart-pulse" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Blood Pressure Report</h1>
            <p className="text-sm text-muted-foreground">
              {displayName} · {rangeLabel}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap pt-1">
          Generated {fmtDate(new Date().toISOString())}
        </p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3">
          <StatBox
            label="Average BP"
            value={`${stats.avgSys}/${stats.avgDia}`}
            detail="mmHg"
          />
          <StatBox
            label="Highest"
            value={`${stats.highest.systolic}/${stats.highest.diastolic}`}
            detail={fmtDate(stats.highest.reading_date)}
          />
          <StatBox
            label="Lowest"
            value={`${stats.lowest.systolic}/${stats.lowest.diastolic}`}
            detail={fmtDate(stats.lowest.reading_date)}
          />
          <StatBox
            label="Readings"
            value={String(stats.n)}
            detail={stats.avgPulse != null ? `Avg pulse ${stats.avgPulse} bpm` : undefined}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No readings in this period.</p>
      )}
    </Card>
  );
}
