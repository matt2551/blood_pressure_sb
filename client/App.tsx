import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";

import { App as AppProvider } from "@superblocksteam/library";

import { AuthProvider, useAuth } from "./lib/auth-context.js";
import { Toaster } from "./components/common/sonner";
import AppSidebar from "./components/AppSidebar/index.js";

function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const showSidebar = isAuthenticated && !isAuthPage;

  return (
    <div className="flex h-full w-full">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default function AppComponent() {
  return (
    <>
      {/* Do not remove the AppProvider */}
      <AppProvider className="h-full w-full">
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </AppProvider>
      <Toaster />
    </>
  );
}
