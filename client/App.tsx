import { Suspense } from "react";
import { Outlet } from "react-router";

import { App as AppProvider } from "@superblocksteam/library";

import { AuthProvider } from "./lib/auth-context.js";
import { Toaster } from "./components/common/sonner";

export default function AppComponent() {
  return (
    <>
      {/* Do not remove the AppProvider */}
      <AppProvider className="h-full w-full">
        <AuthProvider>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </AuthProvider>
      </AppProvider>
      <Toaster />
    </>
  );
}
