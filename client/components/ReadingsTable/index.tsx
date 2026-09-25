import { memo, useCallback, useState, useRef, useEffect } from "react";
import { useApiData } from "@/hooks/useApiData.js";
import { useApi } from "@/hooks/useApi.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type ReadingsTableProps = {
  userId: string;
  refreshKey: number;
};

const PAGE_SIZE = 10;

function getBPCategory(sys: number, dia: number) {
  if (sys < 120 && dia < 80) return { label: "Normal", className: "bg-emerald-100 text-emerald-800" };
  if (sys < 130 && dia < 80) return { label: "Elevated", className: "bg-yellow-100 text-yellow-800" };
  if (sys < 140 || dia < 90) return { label: "High Stage 1", className: "bg-orange-100 text-orange-800" };
  return { label: "High Stage 2", className: "bg-red-100 text-red-800" };
}

const ReadingRow = memo(function ReadingRow({
  reading,
  onDelete,
  deleting,
}: {
  reading: any;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const cat = getBPCategory(reading.systolic, reading.diastolic);
  const date = new Date(reading.reading_date);

  return (
    <TableRow>
      <TableCell className="text-sm">
        {date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        <span className="text-muted-foreground ml-1 text-xs">
          {date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </TableCell>
      <TableCell className="font-mono font-medium">
        {reading.systolic}/{reading.diastolic}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={cat.className}>
          {cat.label}
        </Badge>
      </TableCell>
      <TableCell>{reading.pulse ?? "—"}</TableCell>
      <TableCell className="capitalize">{reading.arm ?? "—"}</TableCell>
      <TableCell className="capitalize">{reading.position ?? "—"}</TableCell>
      <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
        {reading.notes || "—"}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(reading.id)}
          disabled={deleting}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        >
          <Icon icon="trash-2" className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

export default function ReadingsTable({ userId, refreshKey }: ReadingsTableProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  }, []);

  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(localSearch);
      setPage(0);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [localSearch]);

  const { data, loading, fetching, isError, error, refetch } = useApiData(
    "GetReadings",
    {
      userId,
      search: debouncedSearch || null,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }
  );

  // Refetch when refreshKey changes (new reading added)
  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  const { run: deleteReading, loading: deleting } = useApi("DeleteReading");

  const handleDelete = useCallback(
    async (readingId: string) => {
      try {
        await deleteReading({ readingId, userId });
        toast.success("Reading deleted");
        refetch();
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Delete failed: " + message);
      }
    },
    [deleteReading, userId, refetch]
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-5">
        <p className="text-destructive">
          Error loading readings:{" "}
          {error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error)}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon icon="list" className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Reading History</h2>
          {data && (
            <span className="text-xs text-muted-foreground">
              ({data.total} total)
            </span>
          )}
        </div>
        {fetching && (
          <span className="text-xs text-muted-foreground">Updating…</span>
        )}
      </div>

      <div className="mb-3">
        <Input
          placeholder="Search notes, arm, position…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className={`overflow-x-auto ${fetching && !loading ? "opacity-70" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>BP</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Pulse</TableHead>
              <TableHead>Arm</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {debouncedSearch ? "No readings match your search" : "No readings yet"}
                </TableCell>
              </TableRow>
            ) : (
              data?.readings.map((reading: any) => (
                <ReadingRow
                  key={reading.id}
                  reading={reading}
                  onDelete={handleDelete}
                  deleting={deleting}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
