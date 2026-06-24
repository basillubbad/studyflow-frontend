import { ExamModeState, ExamPreparationTopic } from "@/types/exam-mode";

const LS_KEY = "studyflow_exam_prep";

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function loadAllStates(): Record<string, ExamModeState> {
  return {};
}

function saveAllStates(states: Record<string, ExamModeState>): void {
  // Data should be handled by backend
}

export function getExamModeState(courseId: string, examId: string): ExamModeState {
  const all = loadAllStates();
  const key = `${courseId}__${examId}`;
  return all[key] ?? {
    examId,
    courseId,
    topics: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function saveExamModeState(state: ExamModeState): void {
  const all = loadAllStates();
  const key = `${state.courseId}__${state.examId}`;
  all[key] = { ...state, updatedAt: new Date().toISOString() };
  saveAllStates(all);
}

export function addTopic(
  state: ExamModeState,
  title: string,
  priority?: ExamPreparationTopic["priority"],
  notes?: string
): ExamModeState {
  const topic: ExamPreparationTopic = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    priority,
    notes,
  };
  return { ...state, topics: [...state.topics, topic] };
}

export function toggleTopic(state: ExamModeState, topicId: string): ExamModeState {
  return {
    ...state,
    topics: state.topics.map(t =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    ),
  };
}

export function deleteTopic(state: ExamModeState, topicId: string): ExamModeState {
  return { ...state, topics: state.topics.filter(t => t.id !== topicId) };
}

export function calcRevisionProgress(topics: ExamPreparationTopic[]): number {
  if (topics.length === 0) return 0;
  return Math.round((topics.filter(t => t.completed).length / topics.length) * 100);
}

export function generateTopicId(): string {
  return generateId();
}
