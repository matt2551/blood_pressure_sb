import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export type ReportPreset = "7" | "30" | "90" | "all" | "custom";

const PRESETS: { value: Exclude<ReportPreset, "custom">; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
];

type ReportControlsProps = {
  preset: ReportPreset;
  pickerValue: { from?: string; to?: string };
  onPresetChange: (preset: Exclude<ReportPreset, "custom">) => void;
  onPickerChange: (value: { from: string; to: string }) => void;
  onPrint: () => void;
  printDisabled: boolean;
  fetching: boolean;
};

/** Date-range selection and print action. Hidden entirely on the printed page. */
export default function ReportControls({
  preset,
  pickerValue,
  onPresetChange,
  onPickerChange,
  onPrint,
  printDisabled,
  fetching,
}: ReportControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <div className="flex items-center gap-1 rounded-md border bg-background p-1">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={preset === p.value ? "default" : "ghost"}
            onClick={() => onPresetChange(p.value)}
            className="h-7"
          >
            {p.label}
          </Button>
        ))}
      </div>

      <DateRangePicker
        value={pickerValue}
        onValueChange={onPickerChange}
        placeholder="All time"
        displayFormat="MMM d, yyyy"
        numberOfMonths={2}
        className="w-[260px]"
      />

      {fetching && <span className="text-xs text-muted-foreground">Updating…</span>}

      <Button onClick={onPrint} disabled={printDisabled} className="ml-auto">
        <Icon icon="printer" className="w-4 h-4 mr-1.5" />
        Print / Save PDF
      </Button>
    </div>
  );
}
