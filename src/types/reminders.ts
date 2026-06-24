export type ReminderTimingUnit = "minutes" | "hours" | "days";

export interface ReminderConfig {
  enabled: boolean;
  timingValue: number;
  timingUnit: ReminderTimingUnit;
  channel?: "in-app" | "email" | "both";
  customMessage?: string;
}
