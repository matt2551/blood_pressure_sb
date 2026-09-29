import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/lib/auth-context.js";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { IconName } from "lucide-react/dynamic";

type NavItem = {
  icon: IconName;
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { icon: "layout-dashboard", label: "Dashboard", path: "/" },
  { icon: "pencil-line", label: "Edit Readings", path: "/edit-readings" },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <div className="flex flex-col h-full w-[220px] bg-background border-r">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
          <Icon icon="heart-pulse" className="w-4 h-4 text-primary" />
        </div>
        <span className="text-base font-bold">BP Tracker</span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-3 py-3 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon icon={item.icon} className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t px-4 py-3">
        <p className="text-xs text-muted-foreground mb-2 truncate">
          {user?.display_name}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Icon icon="log-out" className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
