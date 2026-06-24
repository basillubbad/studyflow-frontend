import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format minutes into a human-readable string
 * Examples: 185 → "3hr 5m", 180 → "3hr", 45 → "45m"
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}hr ${mins}m`;
  } else if (hours > 0) {
    return `${hours}hr`;
  } else {
    return `${mins}m`;
  }
}
