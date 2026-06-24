export type PlannerSemesterStatus = 'planned' | 'current' | 'completed';

export interface PlannerSemester {
  id: string;
  name: string;
  status: PlannerSemesterStatus;
  weeksCount: number;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface AcademicPlannerConfig {
  totalRequiredCredits: number;
  defaultSemesterLoad: number;
  initialCompletedCredits?: number;
}
