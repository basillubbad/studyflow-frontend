export type MoodType = 'excellent' | 'good' | 'neutral' | 'stressed' | 'tired' | 'sad';

export interface ReflectionEntry {
  id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  mood: MoodType;
  
  // Core Reflection Content
  achieved: string;
  difficult: string;
  learned: string;
  improveNext: string;
  
  // Optional extras
  gratitude?: string;
  tags?: string[];
  
  createdAt: string;
  updatedAt: string;
}

// Helper specific to UI rendering of mood types
export interface MoodInfo {
  value: MoodType;
  label: string;
  colorClass: string;
  icon: string; // Used to match against available lucide-react icons in UI
}
