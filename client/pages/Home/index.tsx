import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth-context.js";
import { useApiData } from "@/hooks/useApiData.js";
import BPEntryForm from "@/components/BPEntryForm/index.js";
import BPTrendChart from "@/components/BPTrendChart/index.js";
import ReadingsTable from "@/components/ReadingsTable/index.js";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isAuthenticated || !user) {
    navigate("/login", { replace: true });
    return null;
  }

  const { data: chartData, loading: chartLoading, refetch: refetchChart } = useApiData(
    "GetChartData",
    { userId: user.id }
  );

  const handleNewReading = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refetchChart();
  }, [refetchChart]);

  return (
    <div className="flex flex-col h-full overflow-auto bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 w-full">
        {/* Top row: Chart + Entry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BPTrendChart
              readings={chartData?.readings ?? []}
              loading={chartLoading}
            />
          </div>
          <div>
            <BPEntryForm userId={user.id} onSuccess={handleNewReading} />
          </div>
        </div>

        {/* Bottom: Readings Table */}
        <ReadingsTable userId={user.id} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
