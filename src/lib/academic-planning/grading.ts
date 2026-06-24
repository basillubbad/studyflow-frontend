/**
 * Academic Grading Configuration
 *
 * Provides the single source of truth for numeric grades (0-100) and pass/fail thresholds.
 * The system uses a 100-scale Cumulative Average, so GPA mapping points have been removed.
 */

// A grade below 60 is considered failing according to the requirements
export const PASSING_GRADE_THRESHOLD = 60;

/**
 * Returns whether a numeric grade is a passing grade.
 */
export function isPassingGrade(numericGrade: number): boolean {
  return numericGrade >= PASSING_GRADE_THRESHOLD;
}

/**
 * Returns 'passed' or 'failed' string status.
 */
export function getGradeStatus(numericGrade: number): "passed" | "failed" {
  return isPassingGrade(numericGrade) ? "passed" : "failed";
}
