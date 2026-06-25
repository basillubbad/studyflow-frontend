"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  ListTodo,
  Route,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  School,
  CalendarDays,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
    href: "/academic-planning",
    label: "Academic planning",
    icon: School,
  },
  { href: "/courses", label: "Courses", icon: BookOpen },

  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/self-learning", label: "Self Learning", icon: Route },
  { href: "/reflections", label: "Reflections", icon: Brain },
];

import { UserAvatar } from "@/components/ui/user-avatar";
import { useAppState } from "@/hooks/use-app-state";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { AuthService } from "@/services/auth.service";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const user = state.userProfile;

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false);
    await AuthService.logout();
  };

  return (
    <>
      {/* Mobile Menu Button ... existing code ... */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg border  border-border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-border">
            <Link href="/dashboard">
              <Image
                src="/logo.png"
                alt="StudyFlow Logo"
                width={140}
                height={50}
                className="h-12 w-auto dark:brightness-0 dark:invert"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
            >
              <UserAvatar profile={user} className="h-8 w-8 group-hover:ring-2 group-hover:ring-primary/20 transition-all" />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-foreground truncate">{user.name || "Student"}</span>
                <span className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{user.major || "Goal: Graduate"}</span>
              </div>
              <Settings className="h-4 w-4 opacity-50" />
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-medium text-muted-foreground hover:bg-muted hover:text-red-600 transition-colors"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <ConfirmActionDialog
        isOpen={isLogoutDialogOpen}
        title="Sign Out"
        description="Are you sure you want to sign out of StudyFlow?"
        confirmText="Sign Out"
        icon={<LogOut className="h-6 w-6" />}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
