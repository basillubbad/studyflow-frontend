export interface ExamPreparationTopic {
  id: string;
  title: string;
  completed: boolean;
  priority?: "high" | "medium" | "low";
  notes?: string;
}

export interface ExamModeState {
  examId: string;
  courseId: string;
  topics: ExamPreparationTopic[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
