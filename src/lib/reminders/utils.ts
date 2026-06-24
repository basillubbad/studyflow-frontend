import { ReminderConfig, ReminderTimingUnit } from "@/types/reminders";
import { UserProfile } from "@/types/settings";
import { loadProfile } from "../settings/utils";

export const getDefaultReminderConfig = (profile?: UserProfile): ReminderConfig => {
  const userProfile = profile || loadProfile();
  const { reminderPreferences } = userProfile;
  
  return {
    enabled: reminderPreferences.remindersEnabled,
    timingValue: reminderPreferences.defaultReminderTiming,
    timingUnit: reminderPreferences.defaultReminderUnit,
    channel: reminderPreferences.inAppNotificationsEnabled ? "in-app" : undefined,
  };
};

export const formatReminderLabel = (config: ReminderConfig): string => {
  if (!config.enabled) return "Reminders disabled";
  
  const unitLabel = config.timingUnit === "minutes" 
    ? "min" 
    : config.timingUnit === "hours" 
      ? "hr" 
      : "day";
      
  const plural = config.timingValue > 1 ? "s" : "";
  
  return `${config.timingValue} ${unitLabel}${plural} before`;
};

export const isReminderActive = (config?: ReminderConfig): boolean => {
  return !!(config && config.enabled);
};
