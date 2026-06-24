import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { sanitizeUser, updateUser } from "@/lib/server/auth-store";

export async function POST(request: NextRequest) {
  const currentUser = await getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  const updatedUser = await updateUser(currentUser.id, {
    name: typeof body.name === "string" ? body.name : currentUser.name,
    university:
      typeof body.university === "string" ? body.university : currentUser.university,
    major: typeof body.major === "string" ? body.major : currentUser.major,
    academicYear:
      typeof body.academic_year === "string"
        ? body.academic_year
        : typeof body.academicYear === "string"
          ? body.academicYear
          : currentUser.academicYear,
    currentGPA:
      typeof body.current_gpa === "number"
        ? String(body.current_gpa)
        : typeof body.currentGPA === "string"
          ? body.currentGPA
          : currentUser.currentGPA,
    totalCreditHours:
      typeof body.total_credit_hours === "number"
        ? String(body.total_credit_hours)
        : typeof body.totalCreditHours === "string"
          ? body.totalCreditHours
          : currentUser.totalCreditHours,
    completedCreditHours:
      typeof body.completed_credit_hours === "number"
        ? String(body.completed_credit_hours)
        : typeof body.completedCreditHours === "string"
          ? body.completedCreditHours
          : currentUser.completedCreditHours,
    onboardingCompleted:
      typeof body.onboarding_completed === "boolean"
        ? body.onboarding_completed
        : typeof body.onboardingCompleted === "boolean"
          ? body.onboardingCompleted
          : Boolean(
              currentUser.onboardingCompleted ||
                body.academic_year ||
                body.academicYear ||
                body.university ||
                body.major,
            ),
    avatarUrl:
      typeof body.avatar_url === "string"
        ? body.avatar_url
        : typeof body.avatarUrl === "string"
          ? body.avatarUrl
          : currentUser.avatarUrl,
    focusPreferences:
      typeof body.focus_preferences === "object" && body.focus_preferences
        ? {
            ...currentUser.focusPreferences,
            ...body.focus_preferences,
          }
        : currentUser.focusPreferences,
    reminderPreferences:
      typeof body.reminder_preferences === "object" && body.reminder_preferences
        ? {
            ...currentUser.reminderPreferences,
            ...body.reminder_preferences,
          }
        : currentUser.reminderPreferences,
    themePreference:
      body.theme_preference === "light" ||
      body.theme_preference === "dark" ||
      body.theme_preference === "system"
        ? body.theme_preference
        : currentUser.themePreference,
  });

  if (!updatedUser) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Profile updated successfully.",
    user: sanitizeUser(updatedUser),
  });
}
