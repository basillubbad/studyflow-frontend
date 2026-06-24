import { ReflectionEntry, MoodType, MoodInfo } from "@/types/reflections";

export const MOODS: MoodInfo[] = [
  { value: "excellent", label: "Excellent", colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: "SmilePlus" },
  { value: "good", label: "Good", colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: "Smile" },
  { value: "neutral", label: "Neutral", colorClass: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: "Meh" },
  { value: "tired", label: "Tired", colorClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: "Coffee" },
  { value: "stressed", label: "Stressed", colorClass: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: "Frown" },
  { value: "sad", label: "Sad", colorClass: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: "CloudRain" },
];

export function getMoodInfo(moodValue: MoodType): MoodInfo {
  return MOODS.find(m => m.value === moodValue) || MOODS[2]; // Default to neutral
}

// Generates a random ID without depending on the uuid package
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Date helpers
export function isDateInThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  
  // Get Monday of current week
  const day = now.getDay() || 7; 
  if(day !== 1) now.setHours(-24 * (day - 1));
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return date >= monday;
}

export function isDateInThisMonth(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function filterReflections(
  reflections: ReflectionEntry[],
  period: "all" | "this-week" | "this-month",
  moodFilter: MoodType | "all"
): ReflectionEntry[] {
  return reflections.filter((entry) => {
    let matchesPeriod = true;
    if (period === "this-week") matchesPeriod = isDateInThisWeek(entry.date);
    if (period === "this-month") matchesPeriod = isDateInThisMonth(entry.date);

    let matchesMood = true;
    if (moodFilter !== "all") matchesMood = entry.mood === moodFilter;

    return matchesPeriod && matchesMood;
  });
}

// Returns sorted by newest date first
export function sortReflectionsDesc(reflections: ReflectionEntry[]): ReflectionEntry[] {
    return [...reflections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
