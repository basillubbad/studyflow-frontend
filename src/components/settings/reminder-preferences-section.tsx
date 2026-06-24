import { ReminderPreferences } from "@/types/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, AppWindow } from "lucide-react";

interface ReminderPreferencesSectionProps {
  preferences: ReminderPreferences;
  onUpdate: (updates: Partial<ReminderPreferences>) => void;
}

export function ReminderPreferencesSection({ preferences, onUpdate }: ReminderPreferencesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder Preferences</CardTitle>
        <CardDescription>
          Set default behaviors for notifications and reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base">Enable Reminders</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Master switch for all task and academic reminders.
            </p>
          </div>
          <Switch
            checked={preferences.remindersEnabled}
            onCheckedChange={(checked) => onUpdate({ remindersEnabled: checked })}
          />
        </div>

        {preferences.remindersEnabled && (
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base">Default Reminder Timing</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground mb-2">Timing value</p>
                <Select
                  value={String(preferences.defaultReminderTiming)}
                  onValueChange={(value) => onUpdate({ defaultReminderTiming: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground mb-2">Unit</p>
                <Select
                  value={preferences.defaultReminderUnit}
                  onValueChange={(value: "minutes" | "hours" | "days") => onUpdate({ defaultReminderUnit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes before</SelectItem>
                    <SelectItem value="hours">Hours before</SelectItem>
                    <SelectItem value="days">Days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <Label className="text-base">Notification Channels (Future-ready)</Label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AppWindow className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">In-app Notifications</span>
              </div>
              <Switch
                checked={preferences.inAppNotificationsEnabled}
                onCheckedChange={(checked) => onUpdate({ inAppNotificationsEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email Notifications (Coming soon)</span>
              </div>
              <Switch
                checked={preferences.emailNotificationsEnabled}
                disabled
                onCheckedChange={(checked) => onUpdate({ emailNotificationsEnabled: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
