export type SearchCategory =
  | "Course"
  | "Prior Course"
  | "Semester"
  | "Task"
  | "Exam"
  | "Self-Learning"
  | "Reflection"
  | "Notification"
  | "Resource"
  | "Focus";

export interface SearchResultItem {
  id: string;
  title: string;
  category: SearchCategory;
  path: string;
  description?: string;
}
