export type BPCategory = {
  label: string;
  className: string;
};

/** Classifies a reading using standard AHA blood pressure categories. */
export function getBPCategory(sys: number, dia: number): BPCategory {
  if (sys < 120 && dia < 80) return { label: "Normal", className: "bg-emerald-100 text-emerald-800" };
  if (sys < 130 && dia < 80) return { label: "Elevated", className: "bg-yellow-100 text-yellow-800" };
  if (sys < 140 || dia < 90) return { label: "High Stage 1", className: "bg-orange-100 text-orange-800" };
  return { label: "High Stage 2", className: "bg-red-100 text-red-800" };
}
