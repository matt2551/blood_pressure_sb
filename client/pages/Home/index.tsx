import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth-context.js";
import { useApiData } from "@/hooks/useApiData.js";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import BPEntryForm from "@/components/BPEntryForm/index.js";
import BPTrendChart from "@/components/BPTrendChart/index.js";
import ReadingsTable from "@/components/ReadingsTable/index.js";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect to login if not authenticated
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

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
            <Icon icon="heart-pulse" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">BP Tracker</h1>
            <p className="text-xs text-muted-foreground">
              Welcome, {user.display_name}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <Icon icon="log-out" className="w-4 h-4 mr-1.5" />
          Sign Out
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
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
      </main>
    </div>
  );
}
