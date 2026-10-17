/** Shared date-range helpers for the Dashboard and Report filters. */

export type RangePreset = "7" | "30" | "90" | "all" | "custom";
export type FixedPreset = Exclude<RangePreset, "custom">;

/** ISO timestamps; null means unbounded on that side. */
export type DateRange = { from: string | null; to: string | null };

export const DEFAULT_PRESET: FixedPreset = "30";

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

/** "Last N days" means today plus the previous N-1 days, in local time. */
export function rangeForPreset(preset: FixedPreset): DateRange {
  if (preset === "all") return { from: null, to: null };
  const days = Number(preset);
  const from = startOfDay(new Date());
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString(), to: endOfDay(new Date()).toISOString() };
}

/** Converts the date picker's midnight-based values into full-day bounds. */
export function rangeFromPicker(value: { from: string; to: string }): DateRange {
  return {
    from: value.from ? startOfDay(new Date(value.from)).toISOString() : null,
    to: value.to ? endOfDay(new Date(value.to)).toISOString() : null,
  };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function describeRange(range: DateRange): string {
  if (!range.from && !range.to) return "All time";
  if (range.from && range.to) return `${fmt(range.from)} – ${fmt(range.to)}`;
  if (range.from) return `Since ${fmt(range.from)}`;
  return `Through ${fmt(range.to!)}`;
}
