"use client";

import { useState, useEffect, useCallback } from "react";
import { AppState, EMPTY_APP_STATE } from "@/types/app-state";
import { AppStore } from "@/lib/store/app-store";
import { PlannerSemester } from "@/types/academic-planning";
import { Course } from "@/types/course";
import { TaskItem } from "@/types/tasks";
import { LearningPlan } from "@/types/self-learning";
import { ReflectionEntry } from "@/types/reflections";
import { DataService } from "@/services/data.service";

// ─── Pure helper functions (outside hook, no dependency issues) ───────────────

function keepStreakAlive(state: AppState): AppState {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const lastActive = state.streak?.lastActiveDate || "";
  const activeDays = state.streak?.activeDays || [];
  const hasToday = activeDays.includes(today);
  const newActiveDays = hasToday ? activeDays : [...activeDays, today];

  let newState = state;

  if (lastActive === today && (state.streak?.currentCount || 0) > 0) {
    if (hasToday) return state;
    newState = { ...state, streak: { ...state.streak, activeDays: newActiveDays } };
  } else {
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;
    const currentCount = state.streak?.currentCount || 0;
    const longestCount = state.streak?.longestCount || 0;
    const newCount = lastActive === yesterday ? currentCount + 1 : 1;

    newState = {
      ...state,
      streak: {
        currentCount: newCount,
        longestCount: Math.max(longestCount, newCount),
        lastActiveDate: today,
        activeDays: newActiveDays,
      },
    };
  }

  persistStreak(newState.streak);
  return newState;
}

async function persistStreak(streak: AppState["streak"]) {
  // Backend doesn't support streak yet.
  void streak;
  return;
}

function syncSemesterStatus(state: AppState, semesterId?: string): AppState {
  if (!semesterId || semesterId === "prior-completed") return state;
  const semesterCourses = state.courses.filter(c => c.semesterId === semesterId);
  if (semesterCourses.length === 0) return state;
  const allCompleted = semesterCourses.every(c => c.status === "completed");
  const currentSemester = state.academicPlanning.semesters.find(s => s.id === semesterId);
  if (allCompleted && currentSemester?.status !== "completed") {
    return {
      ...state,
      academicPlanning: {
        ...state.academicPlanning,
        semesters: state.academicPlanning.semesters.map(s =>
          s.id === semesterId ? { ...s, status: "completed" } : s
        ),
      },
    };
  }
  if (!allCompleted && currentSemester?.status === "completed") {
    return {
      ...state,
      academicPlanning: {
        ...state.academicPlanning,
        semesters: state.academicPlanning.semesters.map(s =>
          s.id === semesterId ? { ...s, status: "current" } : s
        ),
      },
    };
  }
  return state;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppState() {
  const [state, setState] = useState<AppState>(EMPTY_APP_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("studyflow_auth_token");

    const unsubscribe = AppStore.subscribe((newState) => {
      setState(newState);
    });

    if (token) {
      // Load from localStorage first (instant display)
      const savedUser = localStorage.getItem("studyflow_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Parse reminder_preferences if it's a JSON string
          let reminderPrefs = parsed.reminderPreferences || parsed.reminder_preferences;
          if (typeof reminderPrefs === "string") {
            try { reminderPrefs = JSON.parse(reminderPrefs); } catch { reminderPrefs = null; }
          }
          // Normalize both camelCase and snake_case fields from cache
          const normalized = {
            ...parsed,
            academicYear: parsed.academicYear || parsed.academic_year || "",
            totalCreditHours: parsed.totalCreditHours || parsed.total_credit_hours?.toString() || "",
            completedCreditHours: parsed.completedCreditHours || parsed.completed_credit_hours?.toString() || "",
            currentGPA: parsed.currentGPA || parsed.current_gpa?.toString() || "",
            onboardingCompleted: parsed.onboardingCompleted ?? parsed.onboarding_completed ?? false,
            avatarUrl: parsed.avatarUrl || parsed.avatar_url || undefined,
            reminderPreferences: {
              remindersEnabled: true,
              defaultReminderTiming: 15,
              defaultReminderUnit: "minutes",
              emailNotificationsEnabled: false,
              inAppNotificationsEnabled: true,
              ...(reminderPrefs || {}),
            },
            focusPreferences: {
              preferredSessionDuration: 25,
              preferredBreakDuration: 5,
              autoStartBreak: false,
              defaultFocusMode: "pomodoro",
              ...(parsed.focusPreferences || parsed.focus_preferences || {}),
            },
          };
          AppStore.update({ userProfile: normalized });
        } catch {
          // ignore parse errors
        }
      }

      // Fetch fresh profile from API and update store
      import("@/services/auth.service").then(({ AuthService }) => {
        return AuthService.getProfile();
      }).then((profile) => {
        // Update full userProfile (already mapped to camelCase by AuthService)
        AppStore.update((prev) => ({
          ...prev,
          userProfile: { ...prev.userProfile, ...profile },
          streak: profile?.streak || prev.streak,
        }));
      }).catch((err) => {
        console.error("Failed to load profile", err);
      }).finally(() => {
        setState(AppStore.get());
        setIsLoaded(true);
      });
    } else {
      setTimeout(() => {
        setState(AppStore.get());
        setIsLoaded(true);
      }, 0);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const updateState = useCallback((update: Partial<AppState> | ((s: AppState) => AppState)) => {
    AppStore.update(update);
  }, []);

  const resetApp = useCallback(() => {
    AppStore.reset();
    setState(EMPTY_APP_STATE);
  }, []);

  // ─── Module Loaders (On Demand) ─────────────────────────────────────────────
  
  const loadCourses = useCallback(async () => {
    if (AppStore.get().loadedModules.includes('courses')) return;
    try {
      const courses = await DataService.getCourses();
      AppStore.update(prev => ({ ...prev, courses, loadedModules: [...prev.loadedModules, 'courses'] }));
    } catch (err) { console.error("Failed to load courses", err); }
  }, []);

  const loadTasks = useCallback(async () => {
    if (AppStore.get().loadedModules.includes('tasks')) return;
    try {
      const tasks = await DataService.getTasks();
      AppStore.update(prev => ({ ...prev, tasks, loadedModules: [...prev.loadedModules, 'tasks'] }));
    } catch (err) { console.error("Failed to load tasks", err); }
  }, []);

  const loadLearningPlans = useCallback(async () => {
    if (AppStore.get().loadedModules.includes('learningPlans')) return;
    try {
      const selfLearningPlans = await DataService.getLearningPlans();
      AppStore.update(prev => ({ ...prev, selfLearningPlans, loadedModules: [...prev.loadedModules, 'learningPlans'] }));
    } catch (err) { console.error("Failed to load learning plans", err); }
  }, []);

  const loadSemesters = useCallback(async () => {
    if (AppStore.get().loadedModules.includes('semesters')) return;
    try {
      const semesters = await DataService.getSemesters();
      AppStore.update(prev => ({ 
        ...prev, 
        academicPlanning: { ...prev.academicPlanning, semesters },
        loadedModules: [...prev.loadedModules, 'semesters'] 
      }));
    } catch (err) { console.error("Failed to load semesters", err); }
  }, []);

  const loadReflections = useCallback(async () => {
    if (AppStore.get().loadedModules.includes('reflections')) return;
    try {
      const reflections = await DataService.getReflections();
      AppStore.update(prev => ({ ...prev, reflections, loadedModules: [...prev.loadedModules, 'reflections'] }));
    } catch (err) { console.error("Failed to load reflections", err); }
  }, []);

  const loadNotifications = useCallback(async (force = false) => {
    if (!force && AppStore.get().loadedModules.includes('notifications')) return;
    try {
      const notifications = await DataService.getNotifications();
      AppStore.update(prev => ({
        ...prev,
        notifications,
        loadedModules: prev.loadedModules.includes('notifications')
          ? prev.loadedModules
          : [...prev.loadedModules, 'notifications']
      }));
    } catch (err) { console.error("Failed to load notifications", err); }
  }, []);

  // ─── Semesters ──────────────────────────────────────────────────────────────

  const addSemester = useCallback(async (semester: PlannerSemester) => {
    try {
      const saved = await DataService.createSemester(semester);
      AppStore.update(prev => keepStreakAlive({
        ...prev,
        academicPlanning: { ...prev.academicPlanning, semesters: [...prev.academicPlanning.semesters, saved] }
      }));
    } catch {
      AppStore.update(prev => keepStreakAlive({
        ...prev,
        academicPlanning: { ...prev.academicPlanning, semesters: [...prev.academicPlanning.semesters, semester] }
      }));
    }
  }, []);

  const updateSemester = useCallback(async (semester: PlannerSemester) => {
    try {
      const saved = await DataService.updateSemester(semester);
      AppStore.update(prev => keepStreakAlive({
        ...prev,
        academicPlanning: { ...prev.academicPlanning, semesters: prev.academicPlanning.semesters.map(s => s.id === saved.id ? saved : s) }
      }));
    } catch {
      AppStore.update(prev => keepStreakAlive({
        ...prev,
        academicPlanning: { ...prev.academicPlanning, semesters: prev.academicPlanning.semesters.map(s => s.id === semester.id ? semester : s) }
      }));
    }
  }, []);

  const deleteSemester = useCallback(async (id: string) => {
    try { await DataService.deleteSemester(id); } catch { console.error("Failed to delete semester"); }
    AppStore.update(prev => keepStreakAlive({
      ...prev,
      academicPlanning: { ...prev.academicPlanning, semesters: prev.academicPlanning.semesters.filter(s => s.id !== id) }
    }));
  }, []);

  // ─── Courses ────────────────────────────────────────────────────────────────

  const addCourse = useCallback(async (course: Course) => {
    try {
      const saved = await DataService.createCourse(course);
      AppStore.update(prev => keepStreakAlive(syncSemesterStatus({ ...prev, courses: [...prev.courses, saved] }, saved.semesterId)));
    } catch {
      AppStore.update(prev => keepStreakAlive(syncSemesterStatus({ ...prev, courses: [...prev.courses, course] }, course.semesterId)));
    }
  }, []);

  const updateCourse = useCallback(async (course: Course) => {
    try {
      const saved = await DataService.updateCourse(course);
      AppStore.update(prev => keepStreakAlive(syncSemesterStatus({ ...prev, courses: prev.courses.map(c => c.id === saved.id ? saved : c) }, saved.semesterId)));
    } catch {
      AppStore.update(prev => keepStreakAlive(syncSemesterStatus({ ...prev, courses: prev.courses.map(c => c.id === course.id ? course : c) }, course.semesterId)));
    }
  }, []);

  const deleteCourse = useCallback(async (id: string) => {
    try { await DataService.deleteCourse(id); } catch { console.error("Failed to delete course"); }
    AppStore.update(prev => {
      const course = prev.courses.find(c => c.id === id);
      return keepStreakAlive(syncSemesterStatus({ ...prev, courses: prev.courses.filter(c => c.id !== id) }, course?.semesterId));
    });
  }, []);

  // ─── Tasks ──────────────────────────────────────────────────────────────────

  const addTask = useCallback(async (task: TaskItem) => {
    try {
      const saved = await DataService.createTask(task);
      AppStore.update(prev => keepStreakAlive({ ...prev, tasks: [...prev.tasks, saved] }));
    } catch {
      AppStore.update(prev => keepStreakAlive({ ...prev, tasks: [...prev.tasks, task] }));
    }
  }, []);

  const updateTask = useCallback(async (task: TaskItem) => {
    try {
      const saved = await DataService.updateTask(task);
      AppStore.update(prev => keepStreakAlive({ ...prev, tasks: prev.tasks.map(t => String(t.id) === String(saved.id) ? saved : t) }));
    } catch {
      AppStore.update(prev => keepStreakAlive({ ...prev, tasks: prev.tasks.map(t => String(t.id) === String(task.id) ? task : t) }));
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try { await DataService.deleteTask(id); } catch { console.error("Failed to delete task"); }
    AppStore.update(prev => keepStreakAlive({ ...prev, tasks: prev.tasks.filter(t => String(t.id) !== String(id)) }));
  }, []);

  // ─── Learning Plans ─────────────────────────────────────────────────────────

  const addLearningPlan = useCallback(async (plan: LearningPlan) => {
    try {
      const saved = await DataService.createLearningPlan(plan);
      AppStore.update(prev => keepStreakAlive({ ...prev, selfLearningPlans: [...prev.selfLearningPlans, saved] }));
    } catch {
      AppStore.update(prev => keepStreakAlive({ ...prev, selfLearningPlans: [...prev.selfLearningPlans, plan] }));
    }
  }, []);

  const updateLearningPlan = useCallback(async (plan: LearningPlan) => {
    try {
      const saved = await DataService.updateLearningPlan(plan);
      AppStore.update(prev => keepStreakAlive({ ...prev, selfLearningPlans: prev.selfLearningPlans.map(p => p.id === saved.id ? saved : p) }));
    } catch {
      AppStore.update(prev => keepStreakAlive({ ...prev, selfLearningPlans: prev.selfLearningPlans.map(p => p.id === plan.id ? plan : p) }));
    }
  }, []);

  const deleteLearningPlan = useCallback(async (id: string) => {
    try { await DataService.deleteLearningPlan(id); } catch { console.error("Failed to delete learning plan"); }
    AppStore.update(prev => keepStreakAlive({ ...prev, selfLearningPlans: prev.selfLearningPlans.filter(p => p.id !== id) }));
  }, []);

  // ─── Reflections ────────────────────────────────────────────────────────────

  const addReflection = useCallback(async (reflection: ReflectionEntry) => {
    try {
      const saved = await DataService.createReflection(reflection);
      AppStore.update(prev => keepStreakAlive({ ...prev, reflections: [saved, ...prev.reflections] }));
    } catch {
      AppStore.update(prev => keepStreakAlive({ ...prev, reflections: [reflection, ...prev.reflections] }));
    }
  }, []);

  // ─── Streak ─────────────────────────────────────────────────────────────────

  const updateStreak = useCallback(() => {
    AppStore.update(prev => keepStreakAlive(prev));
  }, []);

  // ─── Unified Task Save/Delete ────────────────────────────────────────────────

  const saveUnifiedTask = useCallback(async (task: TaskItem) => {
    // Tasks مرتبطة بـ self-learning — تحفظ في memory بس
    if (task.sourceModule === "self-learning" && task.linkedLearningPlanId) {
      const currentPlan = AppStore.get().selfLearningPlans.find(
        (plan) => plan.id === task.linkedLearningPlanId,
      );
      if (!currentPlan) return;

      let updatedPlan = currentPlan;

      if (task.id.startsWith("milestone-")) {
        const milestoneId = task.id.replace("milestone-", "");
        updatedPlan = {
          ...currentPlan,
          milestones: currentPlan.milestones.map((milestone) =>
            milestone.id === milestoneId
              ? {
                  ...milestone,
                  title: task.title,
                  description: task.description,
                  targetDate: task.dueDate,
                  completed: task.status === "done",
                }
              : milestone,
          ),
          updatedAt: new Date().toISOString(),
        };
      } else if (task.id.startsWith("sl-task-")) {
        const selfTaskId = task.id.replace("sl-task-", "");
        updatedPlan = {
          ...currentPlan,
          stages: currentPlan.stages.map((stage) => ({
            ...stage,
            tasks: stage.tasks?.map((stageTask) =>
              stageTask.id === selfTaskId
                ? {
                    ...stageTask,
                    title: task.title,
                    dueDate: task.dueDate,
                    time: task.dueTime,
                    completed: task.status === "done",
                  }
                : stageTask,
            ),
          })),
          updatedAt: new Date().toISOString(),
        };
      }

      AppStore.update((prev) => ({
        ...prev,
        selfLearningPlans: prev.selfLearningPlans.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan,
        ),
      }));

      try {
        const savedPlan = await DataService.updateLearningPlan(updatedPlan);
        AppStore.update((prev) => ({
          ...prev,
          selfLearningPlans: prev.selfLearningPlans.map((plan) =>
            plan.id === savedPlan.id ? savedPlan : plan,
          ),
        }));
      } catch {
        console.error("Failed to persist self-learning task update");
      }
      return;
    }

    // Tasks مرتبطة بـ course — تحفظ في memory بس
    if (task.sourceModule === "course" && task.linkedCourseId) {
      const currentCourse = AppStore.get().courses.find(
        (course) => course.id === task.linkedCourseId,
      );
      if (!currentCourse) return;

      let updatedCourse = currentCourse;

      if (task.id.startsWith("assign-")) {
        const assignmentId = task.id.replace("assign-", "");
        updatedCourse = {
          ...currentCourse,
          assignments: currentCourse.assignments?.map((assignment) =>
            assignment.id === assignmentId
              ? {
                  ...assignment,
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate || assignment.dueDate,
                  status: task.status === "done" ? "submitted_on_time" : "pending",
                }
              : assignment,
          ),
        };
      } else if (task.id.startsWith("event-")) {
        const eventId = task.id.replace("event-", "");
        updatedCourse = {
          ...currentCourse,
          academicEvents: currentCourse.academicEvents?.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  title: task.title,
                  date: task.dueDate || event.date,
                }
              : event,
          ) as never,
        };
      } else if (task.id.startsWith("w-task-")) {
        const studyTaskId = task.id.replace("w-task-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            studyTasks: week.studyTasks.map((studyTask) =>
              studyTask.id === studyTaskId
                ? {
                    ...studyTask,
                    title: task.title,
                    dueDate: task.dueDate,
                    completed: task.status === "done",
                  }
                : studyTask,
            ),
          })),
        };
      } else if (task.id.startsWith("w-assign-")) {
        const weeklyAssignmentId = task.id.replace("w-assign-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            assignments: week.assignments.map((assignment) =>
              assignment.id === weeklyAssignmentId
                ? {
                    ...assignment,
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate || assignment.dueDate,
                    status: task.status === "done" ? "submitted_on_time" : "pending",
                  }
                : assignment,
            ),
          })),
        };
      } else if (task.id.startsWith("w-exam-")) {
        const weeklyExamId = task.id.replace("w-exam-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            exams: week.exams.map((exam) =>
              exam.id === weeklyExamId
                ? {
                    ...exam,
                    title: task.title,
                    date: task.dueDate || exam.date,
                    time: task.dueTime || exam.time,
                    completed: task.status === "done",
                  }
                : exam,
            ),
          })),
        };
      } else if (task.id.startsWith("w-item-")) {
        const weeklyItemId = task.id.replace("w-item-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            items: week.items?.map((item) =>
              item.id === weeklyItemId
                ? {
                    ...item,
                    title: task.title,
                    date: task.dueDate || item.date,
                    time: task.dueTime || item.time,
                    completed: task.status === "done",
                    status: task.status === "done" ? "completed" : "upcoming",
                  }
                : item,
            ),
          })),
        };
      }

      AppStore.update((prev) => ({
        ...prev,
        courses: prev.courses.map((course) =>
          course.id === updatedCourse.id ? updatedCourse : course,
        ),
      }));

      try {
        const savedCourse = await DataService.updateCourse(updatedCourse);
        AppStore.update((prev) => ({
          ...prev,
          courses: prev.courses.map((course) =>
            course.id === savedCourse.id ? savedCourse : course,
          ),
        }));
      } catch {
        console.error("Failed to persist course task update");
      }
      return;
    }

    // Tasks عادية — نحفظها على الباك
    const prefixes = ["milestone-", "sl-task-", "w-assign-", "w-exam-", "w-task-", "assign-", "event-", "w-item-"];
    if (prefixes.some(p => task.id.startsWith(p))) {
      AppStore.update(prev => ({ ...prev, tasks: prev.tasks.map(t => String(t.id) === String(task.id) ? task : t) }));
      return;
    }

    const existingTask = AppStore.get().tasks.find(t => t.id === task.id);
    if (existingTask) {
      // تعديل task موجودة
      try {
        const saved = await DataService.updateTask(task);
        AppStore.update(prev => keepStreakAlive({ ...prev, tasks: prev.tasks.map(t => String(t.id) === String(saved.id) ? saved : t) }));
      } catch {
        AppStore.update(prev => keepStreakAlive({ ...prev, tasks: prev.tasks.map(t => String(t.id) === String(task.id) ? task : t) }));
      }
    } else {
      // إضافة task جديدة
      try {
        const saved = await DataService.createTask(task);
        AppStore.update(prev => keepStreakAlive({ ...prev, tasks: [saved, ...prev.tasks] }));
      } catch {
        AppStore.update(prev => keepStreakAlive({ ...prev, tasks: [task, ...prev.tasks] }));
      }
    }
  }, []);

  const deleteUnifiedTask = useCallback(async (task: TaskItem) => {
    if (task.sourceModule === "self-learning" && task.linkedLearningPlanId) {
      const currentPlan = AppStore.get().selfLearningPlans.find(
        (plan) => plan.id === task.linkedLearningPlanId,
      );
      if (!currentPlan) return;

      let updatedPlan = currentPlan;
      if (task.id.startsWith("milestone-")) {
        const milestoneId = task.id.replace("milestone-", "");
        updatedPlan = {
          ...currentPlan,
          milestones: currentPlan.milestones.filter(
            (milestone) => milestone.id !== milestoneId,
          ),
          updatedAt: new Date().toISOString(),
        };
      } else if (task.id.startsWith("sl-task-")) {
        const selfTaskId = task.id.replace("sl-task-", "");
        updatedPlan = {
          ...currentPlan,
          stages: currentPlan.stages.map((stage) => ({
            ...stage,
            tasks: stage.tasks?.filter((stageTask) => stageTask.id !== selfTaskId),
          })),
          updatedAt: new Date().toISOString(),
        };
      }

      AppStore.update((prev) => ({
        ...prev,
        selfLearningPlans: prev.selfLearningPlans.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan,
        ),
      }));

      try {
        const savedPlan = await DataService.updateLearningPlan(updatedPlan);
        AppStore.update((prev) => ({
          ...prev,
          selfLearningPlans: prev.selfLearningPlans.map((plan) =>
            plan.id === savedPlan.id ? savedPlan : plan,
          ),
        }));
      } catch {
        console.error("Failed to persist self-learning task deletion");
      }
      return;
    }

    if (task.sourceModule === "course" && task.linkedCourseId) {
      const currentCourse = AppStore.get().courses.find(
        (course) => course.id === task.linkedCourseId,
      );
      if (!currentCourse) return;

      let updatedCourse = currentCourse;
      if (task.id.startsWith("assign-")) {
        const assignmentId = task.id.replace("assign-", "");
        updatedCourse = {
          ...currentCourse,
          assignments: currentCourse.assignments?.filter(
            (assignment) => assignment.id !== assignmentId,
          ),
        };
      } else if (task.id.startsWith("event-")) {
        const eventId = task.id.replace("event-", "");
        updatedCourse = {
          ...currentCourse,
          academicEvents: currentCourse.academicEvents?.filter(
            (event) => event.id !== eventId,
          ),
        };
      } else if (task.id.startsWith("w-task-")) {
        const studyTaskId = task.id.replace("w-task-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            studyTasks: week.studyTasks.filter(
              (studyTask) => studyTask.id !== studyTaskId,
            ),
          })),
        };
      } else if (task.id.startsWith("w-assign-")) {
        const weeklyAssignmentId = task.id.replace("w-assign-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            assignments: week.assignments.filter(
              (assignment) => assignment.id !== weeklyAssignmentId,
            ),
          })),
        };
      } else if (task.id.startsWith("w-exam-")) {
        const weeklyExamId = task.id.replace("w-exam-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            exams: week.exams.filter((exam) => exam.id !== weeklyExamId),
          })),
        };
      } else if (task.id.startsWith("w-item-")) {
        const weeklyItemId = task.id.replace("w-item-", "");
        updatedCourse = {
          ...currentCourse,
          weeklyPlan: currentCourse.weeklyPlan?.map((week) => ({
            ...week,
            items: week.items?.filter((item) => item.id !== weeklyItemId),
          })),
        };
      }

      AppStore.update((prev) => ({
        ...prev,
        courses: prev.courses.map((course) =>
          course.id === updatedCourse.id ? updatedCourse : course,
        ),
      }));

      try {
        const savedCourse = await DataService.updateCourse(updatedCourse);
        AppStore.update((prev) => ({
          ...prev,
          courses: prev.courses.map((course) =>
            course.id === savedCourse.id ? savedCourse : course,
          ),
        }));
      } catch {
        console.error("Failed to persist course task deletion");
      }
      return;
    }

    try {
      await DataService.deleteTask(task.id);
    } catch {
      console.error("Failed to delete task");
    }

    AppStore.update(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== task.id) }));
  }, []);

  return {
    state,
    isLoaded,
    updateState,
    resetApp,
    addSemester,
    updateSemester,
    deleteSemester,
    addCourse,
    updateCourse,
    deleteCourse,
    addTask,
    updateTask,
    deleteTask,
    addLearningPlan,
    updateLearningPlan,
    deleteLearningPlan,
    addReflection,
    updateStreak,
    saveUnifiedTask,
    deleteUnifiedTask,
    loadCourses,
    loadTasks,
    loadLearningPlans,
    loadSemesters,
    loadReflections,
    loadNotifications,
    user: state.userProfile,
    courses: state.courses,
    tasks: state.tasks,
    selfLearningPlans: state.selfLearningPlans,
    reflections: state.reflections,
    streak: state.streak || { currentCount: 0, longestCount: 0, lastActiveDate: "", activeDays: [] },
  };
}
