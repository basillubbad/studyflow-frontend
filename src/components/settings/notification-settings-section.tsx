"use client";

import { ReminderPreferences } from "@/types/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BellRing, Mail, Smartphone, Bell, Clock } from "lucide-react";

interface NotificationSettingsSectionProps {
  preferences: ReminderPreferences;
  onUpdate: (updates: Partial<ReminderPreferences>) => void;
}

export function NotificationSettingsSection({ preferences, onUpdate }: NotificationSettingsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">Notification Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage how and when you receive alerts for tasks, exams, and reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Channels */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              Delivery Channels
            </CardTitle>
            <CardDescription>
              Choose where you want to see your notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="in-app-notif" className="flex flex-col gap-0.5 pointer-events-none">
                  <span>In-App Notifications</span>
                  <span className="text-[10px] font-normal text-muted-foreground">Show alerts in the dashboard badge</span>
                </Label>
              </div>
              <Switch 
                id="in-app-notif" 
                checked={preferences.inAppNotificationsEnabled}
                onCheckedChange={(checked) => onUpdate({ inAppNotificationsEnabled: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email-notif" className="flex flex-col gap-0.5 pointer-events-none">
                  <span>Email Alerts</span>
                  <span className="text-[10px] font-normal text-muted-foreground">Get summaries in your inbox (Coming soon)</span>
                </Label>
              </div>
              <Switch id="email-notif" checked={false} disabled />
            </div>

            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="push-notif" className="flex flex-col gap-0.5 pointer-events-none">
                  <span>Push Notifications</span>
                  <span className="text-[10px] font-normal text-muted-foreground">Desktop browser notifications (Coming soon)</span>
                </Label>
              </div>
              <Switch id="push-notif" checked={false} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Defaults */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Reminder Defaults
            </CardTitle>
            <CardDescription>
              Set your preferred lead time for automated alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Default Alert Timing
              </Label>
              <Select 
                value={preferences.defaultReminderTiming.toString()} 
                onValueChange={(val) => onUpdate({ defaultReminderTiming: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="pointer-events-none">Global Reminders</Label>
              <Switch 
                checked={preferences.remindersEnabled}
                onCheckedChange={(checked) => onUpdate({ remindersEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
