import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import DateRangeFilter from "@/components/DateRangeFilter/index.js";
import type { DateRange, RangePreset } from "@/lib/date-range.js";

type ReportControlsProps = {
  preset: RangePreset;
  range: DateRange;
  onRangeChange: (preset: RangePreset, range: DateRange) => void;
  onPrint: () => void;
  printDisabled: boolean;
  fetching: boolean;
};

/** Date-range selection and print action. Hidden entirely on the printed page. */
export default function ReportControls({
  preset,
  range,
  onRangeChange,
  onPrint,
  printDisabled,
  fetching,
}: ReportControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <DateRangeFilter preset={preset} range={range} onChange={onRangeChange} />

      {fetching && <span className="text-xs text-muted-foreground">Updating…</span>}

      <Button onClick={onPrint} disabled={printDisabled} className="ml-auto">
        <Icon icon="printer" className="w-4 h-4 mr-1.5" />
        Print / Save PDF
      </Button>
    </div>
  );
}
