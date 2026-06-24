export type SearchCategory =
  | "Course"
  | "Prior Course"
  | "Task"
  | "Exam"
  | "Self-Learning"
  | "Reflection"
  | "Notification"
  | "Resource";

export interface SearchResultItem {
  id: string;
  title: string;
  category: SearchCategory;
  path: string;
  description?: string;
}
