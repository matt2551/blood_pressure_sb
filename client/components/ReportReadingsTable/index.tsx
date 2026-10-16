import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getBPCategory } from "@/lib/bp-category.js";

type ReportReading = {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  arm: string | null;
  position: string | null;
  notes: string | null;
  reading_date: string;
};

const ReportRow = memo(function ReportRow({ reading }: { reading: ReportReading }) {
  const date = new Date(reading.reading_date);
  const cat = getBPCategory(reading.systolic, reading.diastolic);
  return (
    <TableRow className="break-inside-avoid">
      <TableCell className="whitespace-nowrap">
        {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </TableCell>
      <TableCell className="font-mono font-medium">
        {reading.systolic}/{reading.diastolic}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={cat.className}>{cat.label}</Badge>
      </TableCell>
      <TableCell>{reading.pulse ?? "—"}</TableCell>
      <TableCell className="capitalize">{reading.arm ?? "—"}</TableCell>
      <TableCell className="capitalize">{reading.position ?? "—"}</TableCell>
      <TableCell className="whitespace-normal text-xs text-muted-foreground">
        {reading.notes || "—"}
      </TableCell>
    </TableRow>
  );
});

type ReportReadingsTableProps = {
  readings: ReportReading[];
  truncated: boolean;
};

/**
 * Full, unpaginated list for the printed report (capped server-side).
 * Rows avoid splitting across pages and the header repeats on each printed page.
 */
export default function ReportReadingsTable({ readings, truncated }: ReportReadingsTableProps) {
  return (
    <Card className="p-5 print:shadow-none">
      <h2 className="text-lg font-semibold mb-1">All Readings</h2>
      <p className="text-xs text-muted-foreground mb-3">
        {readings.length} reading{readings.length === 1 ? "" : "s"}, oldest first
        {truncated && " (showing the first 1,000. Narrow the date range to see the rest)"}
      </p>
      {readings.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No readings in this period.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>BP</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Pulse</TableHead>
              <TableHead>Arm</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((r) => (
              <ReportRow key={r.id} reading={r} />
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
