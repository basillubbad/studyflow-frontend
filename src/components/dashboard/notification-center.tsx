"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/use-app-state";
import { DataService } from "@/services/data.service";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { NotificationItem } from "./notification-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function NotificationCenter() {
  const { state, updateState, loadNotifications } = useAppState();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  
  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  React.useEffect(() => {
    const refreshNotifications = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications(true);
      }
    };

    const interval = window.setInterval(() => {
      void loadNotifications(true);
    }, 15000);

    document.addEventListener("visibilitychange", refreshNotifications);
    window.addEventListener("focus", refreshNotifications);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshNotifications);
      window.removeEventListener("focus", refreshNotifications);
    };
  }, [loadNotifications]);
  
  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(
    (notification) => !notification.read && notification.severity === "critical",
  ).length;

  const handleMarkAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);

    updateState({
      notifications: notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    });

    try {
      await DataService.markNotificationAsRead(id);
      void loadNotifications(true);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }

    if (notification?.targetRoute) {
      router.push(notification.targetRoute);
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    updateState({
      notifications: notifications.map(n => ({ ...n, read: true }))
    });

    try {
      await DataService.markAllNotificationsAsRead();
      void loadNotifications(true);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const handleClearAll = async () => {
    updateState({ notifications: [] });

    try {
      await DataService.clearAllNotifications();
      void loadNotifications(true);
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const aDate = a.eventDate || a.createdAt;
    const bDate = b.eventDate || b.createdAt;
    const dateDiff = new Date(bDate).getTime() - new Date(aDate).getTime();
    if (dateDiff !== 0) return dateDiff;

    const unreadDiff = Number(a.read) - Number(b.read);
    if (unreadDiff !== 0) return unreadDiff;

    const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group relative rounded-full border border-transparent transition-all hover:border-border/60 hover:bg-muted/60"
        >
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] overflow-hidden rounded-3xl border border-border/60 p-0 shadow-2xl"
        align="end"
      >
        <div className="border-b bg-gradient-to-br from-slate-50 via-background to-blue-50/60 p-4 dark:from-slate-950 dark:via-background dark:to-blue-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Notifications</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Stay on top of deadlines and important updates
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full px-2.5">
                  {unreadCount} unread
                </Badge>
                {criticalCount > 0 && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-red-200 bg-red-50 px-2.5 text-red-700 dark:border-red-800/60 dark:bg-red-500/10 dark:text-red-300"
                  >
                    <TriangleAlert className="h-3 w-3" />
                    {criticalCount} urgent
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              {notifications.length > 0 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary" 
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full hover:bg-red-500/10 hover:text-red-500" 
                    onClick={handleClearAll}
                    title="Clear all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <Separator />
        
        <ScrollArea className="h-[460px]">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-muted">
                <Bell className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">All caught up!</p>
                <p className="max-w-[230px] text-xs leading-relaxed text-muted-foreground">
                  New deadlines, reminders, and course updates will show up here as soon as they matter.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {sortedNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onClick={handleMarkAsRead} 
                  />
                ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="border-t bg-muted/20 p-3">
            <div className="text-center text-[11px] font-medium text-muted-foreground">
              End of notifications
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
