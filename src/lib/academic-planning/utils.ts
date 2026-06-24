import { Course } from "@/types/course";
import { isPassingGrade } from "./grading";

/**
 * Calculates the Cumulative Average (out of 100) for a given list of courses,
 * incorporating an optional baseline from onboarding.
 * 
 * @param courses List of planner courses
 * @param baselineAverage Optional baseline average (0-100)
 * @param baselineCredits Optional baseline credits already completed
 */
export function calculateCumulativeAverage(
  courses: Course[] | null | undefined,
  baselineAverage?: number,
  baselineCredits?: number
): number | null {
  const safeCourses = Array.isArray(courses) ? courses : [];
  let totalWeightedGrades = 0;
  let totalCreditsForAverage = 0;

  // Add baseline if provided
  if (baselineAverage !== undefined && baselineCredits !== undefined && baselineCredits > 0) {
    totalWeightedGrades += baselineAverage * baselineCredits;
    totalCreditsForAverage += baselineCredits;
  }

  for (const course of safeCourses) {
    // Skip prior-completed courses as they are already in the baseline
    if (course.semesterId === "prior-completed") continue;

    if (course.status === "completed" && course.numericGrade !== null && course.numericGrade !== undefined) {
      totalWeightedGrades += (course.numericGrade || 0) * course.credits;
      totalCreditsForAverage += course.credits;
    }
  }

  if (totalCreditsForAverage === 0) {
    return null;
  }

  return totalWeightedGrades / totalCreditsForAverage;
}

/**
 * Calculates total passed completed credits, incorporating baseline.
 */
export function calculatePassedCompletedCredits(
  courses: Course[] | null | undefined,
  baselineCredits?: number
): number {
  const safeCourses = Array.isArray(courses) ? courses : [];
  const currentPassed = safeCourses
    .filter(
      (c) =>
        c.semesterId !== "prior-completed" && // Skip prior-completed
        c.status === "completed" &&
        c.numericGrade !== undefined &&
        c.numericGrade !== null &&
        isPassingGrade(c.numericGrade)
    )
    .reduce((sum, c) => sum + c.credits, 0);
    
  return currentPassed + (baselineCredits || 0);
}

/**
 * Calculates total failed completed credits.
 */
export function calculateFailedCompletedCredits(courses: Course[]): number {
  const safeCourses = Array.isArray(courses) ? courses : [];
  return safeCourses
    .filter(
      (c) =>
        c.status === "completed" &&
        c.numericGrade !== undefined &&
        c.numericGrade !== null &&
        !isPassingGrade(c.numericGrade)
    )
    .reduce((sum, c) => sum + c.credits, 0);
}

/**
 * Calculates credits for currently in-progress courses.
 */
export function calculateInProgressCredits(courses: Course[]): number {
  const safeCourses = Array.isArray(courses) ? courses : [];
  return safeCourses
    .filter((c) => c.status === "current")
    .reduce((sum, c) => sum + c.credits, 0);
}

/**
 * Calculates credits for planned courses.
 */
export function calculatePlannedCredits(courses: Course[]): number {
  const safeCourses = Array.isArray(courses) ? courses : [];
  return safeCourses
    .filter((c) => c.status === "planned")
    .reduce((sum, c) => sum + c.credits, 0);
}

/**
 * Estimates remaining semesters based on remaining credits and history.
 */
export function estimateRemainingSemesters(
  remainingTargetCredits: number,
  semestersCourses: Course[][],
  defaultSemesterLoad: number
): number {
  if (remainingTargetCredits <= 0) return 0;

  let totalPassedFromSemesters = 0;
  let countUsableSemesters = 0;

  for (const semesterCourses of semestersCourses) {
    const passedCredits = coursesPassedInSemester(semesterCourses);
    if (passedCredits > 0) {
      totalPassedFromSemesters += passedCredits;
      countUsableSemesters += 1;
    }
  }

  const avgCreditsPerSemester =
    countUsableSemesters > 0
      ? totalPassedFromSemesters / countUsableSemesters
      : defaultSemesterLoad;

  return remainingTargetCredits / (avgCreditsPerSemester || defaultSemesterLoad || 15);
}

// Helper for semester estimation to avoid circular baseline recursion
function coursesPassedInSemester(courses: Course[]): number {
    return courses
      .filter(c => c.status === "completed" && c.numericGrade !== undefined && c.numericGrade !== null && isPassingGrade(c.numericGrade))
      .reduce((sum, c) => sum + c.credits, 0);
}
