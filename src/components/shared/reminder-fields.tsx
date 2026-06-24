import React from "react";
import { ReminderConfig, ReminderTimingUnit } from "@/types/reminders";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReminderFieldsProps {
  config: ReminderConfig;
  onChange: (updates: Partial<ReminderConfig>) => void;
  className?: string;
  showIcon?: boolean;
}

export function ReminderFields({ config, onChange, className, showIcon = true }: ReminderFieldsProps) {
  return (
    <div className={cn("space-y-4 p-4 rounded-xl border bg-card/50", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showIcon && <Bell className={cn("h-4 w-4", config.enabled ? "text-primary" : "text-muted-foreground")} />}
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Enable Reminder</Label>
            <p className="text-xs text-muted-foreground">Receive a notification before the deadline</p>
          </div>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked })}
        />
      </div>

      {config.enabled && (
        <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Timing</Label>
            <Select
              value={String(config.timingValue)}
              onValueChange={(value) => onChange({ timingValue: parseInt(value) })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Unit</Label>
            <Select
              value={config.timingUnit}
              onValueChange={(value: ReminderTimingUnit) => onChange({ timingUnit: value })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
