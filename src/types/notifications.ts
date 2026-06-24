export type NotificationType = 
  | "task" 
  | "course" 
  | "exam" 
  | "assignment" 
  | "reflection" 
  | "system" 
  | "reminder";

export type NotificationSeverity = "info" | "warning" | "critical" | "success";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  read: boolean;
  dismissed?: boolean;
  createdAt: string;
  eventDate?: string;
  targetRoute: string; // The URL to navigate to or internal path
  targetId?: string;   // Optional ID for the item (e.g. task ID)
}
