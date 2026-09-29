import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth-context.js";
import { useApiData } from "@/hooks/useApiData.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import EditReadingForm from "@/components/EditReadingForm/index.js";

const PAGE_SIZE = 10;

function getBPCategory(sys: number, dia: number) {
  if (sys < 120 && dia < 80) return { label: "Normal", className: "bg-emerald-100 text-emerald-800" };
  if (sys < 130 && dia < 80) return { label: "Elevated", className: "bg-yellow-100 text-yellow-800" };
  if (sys < 140 || dia < 90) return { label: "High Stage 1", className: "bg-orange-100 text-orange-800" };
  return { label: "High Stage 2", className: "bg-red-100 text-red-800" };
}

export default function EditReadingsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(localSearch);
      setPage(0);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [localSearch]);

  if (!isAuthenticated || !user) {
    navigate("/login", { replace: true });
    return null;
  }

  const { data, loading, fetching, isError, error, refetch } = useApiData(
    "GetReadings",
    {
      userId: user.id,
      search: debouncedSearch || null,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }
  );

  const selectedReading = data?.readings.find((r: any) => r.id === selectedId);
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const handleSave = useCallback(() => {
    setSelectedId(null);
    refetch();
  }, [refetch]);

  const handleCancel = useCallback(() => {
    setSelectedId(null);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold">Edit Readings</h1>
        <p className="text-sm text-muted-foreground">
          Click on a reading to edit its values
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Readings list */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="list" className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Readings</h2>
                {data && (
                  <span className="text-xs text-muted-foreground">
                    ({data.total} total)
                  </span>
                )}
              </div>
              {fetching && <span className="text-xs text-muted-foreground">Updating…</span>}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.readings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {debouncedSearch ? "No readings match your search" : "No readings yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.readings.map((reading: any) => {
                      const cat = getBPCategory(reading.systolic, reading.diastolic);
                      const date = new Date(reading.reading_date);
                      const isSelected = reading.id === selectedId;
                      return (
                        <TableRow
                          key={reading.id}
                          onClick={() => setSelectedId(reading.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/5 border-l-2 border-l-primary"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <TableCell className="text-sm">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            <span className="text-muted-foreground ml-1 text-xs">
                              {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
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
                          <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                            {reading.notes || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Edit form */}
        <div>
          {selectedReading ? (
            <EditReadingForm
              key={selectedReading.id}
              reading={selectedReading}
              userId={user.id}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <Card className="p-5 flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Icon icon="mouse-pointer-click" className="w-8 h-8" />
              <p className="text-sm">Select a reading to edit</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
