"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationCenter } from "./notification-center";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAppState } from "@/hooks/use-app-state";
import { GlobalSearch } from "./global-search";

import { useSyncExternalStore } from "react";

function subscribeToHydration(callback: () => void) {
  void callback;
  return () => {};
}

function getServerSnapshot() {
  return false;
}

/**
 * Dashboard Header
 */
export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, getServerSnapshot);
  const { state, isLoaded } = useAppState();
  const user = state.userProfile;

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center lg:ml-0 md:ml-12  justify-between px-4 lg:px-6 py-4">
        {/* Global Search - hidden on mobile */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <GlobalSearch />
        </div>

        {/* Spacer for mobile */}
        <div className="md:hidden w-10" />

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Theme */}
          {mounted ? (
            <Button
              variant="theme"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button variant="theme" size="icon">
              <span className="h-5 w-5" />
            </Button>
          )}
          <NotificationCenter />

          {/* User avatar - Direct Link to Settings */}
          {isLoaded && (
            <Link href="/settings" title="Settings" className="ml-2">
              <UserAvatar profile={user} className="h-9 w-9 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
