import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  rangeForPreset,
  rangeFromPicker,
  type DateRange,
  type FixedPreset,
  type RangePreset,
} from "@/lib/date-range.js";

const PRESETS: { value: FixedPreset; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
];

type DateRangeFilterProps = {
  preset: RangePreset;
  range: DateRange;
  onChange: (preset: RangePreset, range: DateRange) => void;
};

/** Preset buttons plus a custom date-range picker. */
export default function DateRangeFilter({ preset, range, onChange }: DateRangeFilterProps) {
  const pickerValue = useMemo(
    () => ({ from: range.from ?? undefined, to: range.to ?? undefined }),
    [range]
  );

  const handlePicker = useCallback(
    (value: { from: string; to: string }) => onChange("custom", rangeFromPicker(value)),
    [onChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-md border bg-background p-1">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={preset === p.value ? "default" : "ghost"}
            onClick={() => onChange(p.value, rangeForPreset(p.value))}
            className="h-7"
          >
            {p.label}
          </Button>
        ))}
      </div>
      <DateRangePicker
        value={pickerValue}
        onValueChange={handlePicker}
        placeholder="All time"
        displayFormat="MMM d, yyyy"
        numberOfMonths={2}
        className="w-[260px]"
      />
    </div>
  );
}
