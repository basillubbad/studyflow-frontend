import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/types/settings";
import { AppStore } from "@/lib/store/app-store";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface ForgotPasswordResponse {
  message: string;
  token: string;
  email: string;
}

interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const DEFAULT_REMINDER_PREFERENCES = {
  remindersEnabled: true,
  defaultReminderTiming: 15,
  defaultReminderUnit: "minutes" as const,
  emailNotificationsEnabled: false,
  inAppNotificationsEnabled: true,
};

const DEFAULT_FOCUS_PREFERENCES = {
  preferredSessionDuration: 25,
  preferredBreakDuration: 5,
  autoStartBreak: false,
  defaultFocusMode: "pomodoro" as const,
};

type BackendUser = Record<string, unknown>;

function mapUserFromBackend(user: BackendUser): UserProfile {
  // reminder_preferences may come as a JSON string from backend
  let reminderPrefs = user.reminderPreferences || user.reminder_preferences;
  if (typeof reminderPrefs === "string") {
    try { reminderPrefs = JSON.parse(reminderPrefs); } catch { reminderPrefs = null; }
  }

  return {
    ...user,
    academicYear: user.academicYear || user.academic_year || "",
    totalCreditHours: user.totalCreditHours || user.total_credit_hours?.toString() || "",
    completedCreditHours: user.completedCreditHours || user.completed_credit_hours?.toString() || "",
    currentGPA: user.currentGPA || user.current_gpa?.toString() || "",
    onboardingCompleted: user.onboardingCompleted ?? user.onboarding_completed ?? false,
    avatarUrl: user.avatarUrl || user.avatar_url || undefined,
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
    reminderPreferences: { ...DEFAULT_REMINDER_PREFERENCES, ...(reminderPrefs || {}) },
    focusPreferences: { ...DEFAULT_FOCUS_PREFERENCES, ...(user.focusPreferences || user.focus_preferences || {}) },
    themePreference: user.themePreference || user.theme_preference || "system",
  } as UserProfile;
}

/**
 * Service for authentication and user profile management
 */
export const AuthService = {
  /**
   * Login user and store token
   */
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<{ token: string; user: BackendUser }>("/login", credentials);
    if (response.token) {
      const mappedUser = mapUserFromBackend(response.user);
      localStorage.setItem("studyflow_auth_token", response.token);
      localStorage.setItem("studyflow_user", JSON.stringify(mappedUser));
      AppStore.update({ userProfile: mappedUser });
      return { ...response, user: mappedUser };
    }
    return response as unknown as { token: string; user: UserProfile };
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData) {
    const response = await apiClient.post<{ message: string; token: string; user: BackendUser }>("/register", data);
    if (response.token) {
      const mappedUser = mapUserFromBackend(response.user);
      localStorage.setItem("studyflow_auth_token", response.token);
      localStorage.setItem("studyflow_user", JSON.stringify(mappedUser));
      AppStore.update({ userProfile: mappedUser });
      return { ...response, user: mappedUser };
    }
    return response as unknown as { message: string; token: string; user: UserProfile };
  },

  /**
   * Setup user profile after registration
   */
  async setup(data: {
    academicYear: string;
    totalCreditHours: string;
    completedCreditHours: string;
    currentGPA: string;
    university: string;
    major: string;
  }) {
    // Map setup data to the backend's expected format if needed
    const payload = {
        academic_year: data.academicYear,
        total_credit_hours: data.totalCreditHours ? parseInt(data.totalCreditHours) : null,
        completed_credit_hours: data.completedCreditHours ? parseInt(data.completedCreditHours) : null,
        current_gpa: data.currentGPA ? parseFloat(data.currentGPA) : null,
        university: data.university,
        major: data.major
    };
    const response = await apiClient.post<{message: string, user: BackendUser}>("/user/update-profile", payload);
    const mappedUser = mapUserFromBackend(response.user);
    localStorage.setItem("studyflow_user", JSON.stringify(mappedUser));
    AppStore.update({ userProfile: mappedUser });
    return mappedUser;
  },

  /**
   * Send password reset link
   */
  async forgotPassword(email: string) {
    return apiClient.post<ForgotPasswordResponse>("/forgot-password", { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData) {
    return apiClient.post<{ message: string }>("/reset-password", data);
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await apiClient.get<{user: BackendUser}>("/user");
    return mapUserFromBackend(response.user);
  },

  /**
   * Update current user profile (partial update)
   */
  async updateProfile(updates: Partial<UserProfile>) {
    const payload = {
      ...updates,
      academic_year: updates.academicYear,
      total_credit_hours: updates.totalCreditHours ? parseInt(updates.totalCreditHours) : undefined,
      completed_credit_hours: updates.completedCreditHours ? parseInt(updates.completedCreditHours) : undefined,
      current_gpa: updates.currentGPA ? parseFloat(updates.currentGPA) : undefined,
    };
    const response = await apiClient.post<{message: string, user: BackendUser}>("/user/update-profile", payload);
    const mappedUser = mapUserFromBackend(response.user);
    localStorage.setItem("studyflow_user", JSON.stringify(mappedUser));
    AppStore.update({ userProfile: mappedUser });
    return mappedUser;
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem("studyflow_auth_token");
    localStorage.removeItem("studyflow_user");
    AppStore.reset();
    window.location.href = "/login";
  }
};
