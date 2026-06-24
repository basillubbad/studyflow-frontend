import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { saveNotification } from "@/lib/server/app-data-store";
import { prisma } from "@/lib/server/prisma";

type StoredUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  university: string;
  major: string;
  academicYear: string;
  currentGPA: string;
  totalCreditHours: string;
  completedCreditHours: string;
  onboardingCompleted: boolean;
  avatarUrl?: string;
  focusPreferences: {
    preferredSessionDuration: number;
    preferredBreakDuration: number;
    autoStartBreak: boolean;
    defaultFocusMode: "pomodoro" | "stopwatch";
  };
  reminderPreferences: {
    remindersEnabled: boolean;
    defaultReminderTiming: number;
    defaultReminderUnit: "minutes" | "hours" | "days";
    emailNotificationsEnabled: boolean;
    inAppNotificationsEnabled: boolean;
  };
  themePreference: "light" | "dark" | "system";
  resetToken?: string;
  resetTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_USER_PREFERENCES = {
  focusPreferences: {
    preferredSessionDuration: 25,
    preferredBreakDuration: 5,
    autoStartBreak: false,
    defaultFocusMode: "pomodoro" as const,
  },
  reminderPreferences: {
    remindersEnabled: true,
    defaultReminderTiming: 15,
    defaultReminderUnit: "minutes" as const,
    emailNotificationsEnabled: false,
    inAppNotificationsEnabled: true,
  },
  themePreference: "system" as const,
};

type StoredUsersFile = {
  users: StoredUserRecord[];
};

function mapDbUserToStoredUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  university: string;
  major: string;
  academicYear: string;
  currentGPA: string;
  totalCreditHours: string;
  completedCreditHours: string;
  onboardingCompleted: boolean;
  avatarUrl: string | null;
  focusPreferences: unknown;
  reminderPreferences: unknown;
  themePreference: string;
  resetToken: string | null;
  resetTokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): StoredUserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    university: user.university,
    major: user.major,
    academicYear: user.academicYear,
    currentGPA: user.currentGPA,
    totalCreditHours: user.totalCreditHours,
    completedCreditHours: user.completedCreditHours,
    onboardingCompleted: user.onboardingCompleted,
    avatarUrl: user.avatarUrl ?? undefined,
    focusPreferences: user.focusPreferences as StoredUserRecord["focusPreferences"],
    reminderPreferences:
      user.reminderPreferences as StoredUserRecord["reminderPreferences"],
    themePreference: user.themePreference as StoredUserRecord["themePreference"],
    resetToken: user.resetToken ?? undefined,
    resetTokenExpiresAt: user.resetTokenExpiresAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function readStore(): Promise<StoredUsersFile> {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    users: users.map(mapDbUserToStoredUser),
  };
}

async function writeStore(data: StoredUsersFile) {
  for (const user of data.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        university: user.university,
        major: user.major,
        academicYear: user.academicYear,
        currentGPA: user.currentGPA,
        totalCreditHours: user.totalCreditHours,
        completedCreditHours: user.completedCreditHours,
        onboardingCompleted: user.onboardingCompleted,
        avatarUrl: user.avatarUrl ?? null,
        focusPreferences: user.focusPreferences,
        reminderPreferences: user.reminderPreferences,
        themePreference: user.themePreference,
        resetToken: user.resetToken ?? null,
        resetTokenExpiresAt: user.resetTokenExpiresAt
          ? new Date(user.resetTokenExpiresAt)
          : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        university: user.university,
        major: user.major,
        academicYear: user.academicYear,
        currentGPA: user.currentGPA,
        totalCreditHours: user.totalCreditHours,
        completedCreditHours: user.completedCreditHours,
        onboardingCompleted: user.onboardingCompleted,
        avatarUrl: user.avatarUrl ?? null,
        focusPreferences: user.focusPreferences,
        reminderPreferences: user.reminderPreferences,
        themePreference: user.themePreference,
        resetToken: user.resetToken ?? null,
        resetTokenExpiresAt: user.resetTokenExpiresAt
          ? new Date(user.resetTokenExpiresAt)
          : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedKey] = passwordHash.split(":");
  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedKey, "hex");
  return timingSafeEqual(derivedKey, storedBuffer);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function sanitizeUser(user: StoredUserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    university: user.university,
    major: user.major,
    academicYear: user.academicYear,
    currentGPA: user.currentGPA,
    totalCreditHours: user.totalCreditHours,
    completedCreditHours: user.completedCreditHours,
    onboardingCompleted: user.onboardingCompleted,
    avatarUrl: user.avatarUrl,
    focusPreferences: user.focusPreferences,
    reminderPreferences: user.reminderPreferences,
    themePreference: user.themePreference,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const store = await readStore();

  if (store.users.some((user) => normalizeEmail(user.email) === email)) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date().toISOString();
  const user: StoredUserRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: createPasswordHash(input.password),
    university: "",
    major: "",
    academicYear: "",
    currentGPA: "",
    totalCreditHours: "",
    completedCreditHours: "",
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
    ...DEFAULT_USER_PREFERENCES,
  };

  store.users.push(user);
  await writeStore(store);
  await saveNotification(user.id, {
    id: `welcome-${user.id}`,
    title: `Welcome to StudyFlow, ${user.name}!`,
    message:
      "Your account is ready. Start by setting up your dashboard, courses, and study plan.",
    type: "system",
    severity: "success",
    read: false,
    createdAt: now,
    targetRoute: "/dashboard",
  });
  return user;
}

export async function findUserByEmail(email: string) {
  const store = await readStore();
  return (
    store.users.find((user) => normalizeEmail(user.email) === normalizeEmail(email)) ??
    null
  );
}

export async function findUserById(id: string) {
  const store = await readStore();
  return store.users.find((user) => user.id === id) ?? null;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }
  return user;
}

export async function updateUser(
  userId: string,
  updates: Partial<
    Pick<
      StoredUserRecord,
      | "name"
      | "university"
      | "major"
      | "academicYear"
      | "currentGPA"
      | "totalCreditHours"
      | "completedCreditHours"
      | "onboardingCompleted"
      | "avatarUrl"
      | "focusPreferences"
      | "reminderPreferences"
      | "themePreference"
    >
  >,
) {
  const store = await readStore();
  const index = store.users.findIndex((user) => user.id === userId);
  if (index === -1) {
    return null;
  }

  const current = store.users[index];
  const nextUser: StoredUserRecord = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  store.users[index] = nextUser;
  await writeStore(store);
  return nextUser;
}

export async function createResetToken(email: string) {
  const store = await readStore();
  const index = store.users.findIndex(
    (user) => normalizeEmail(user.email) === normalizeEmail(email),
  );
  if (index === -1) {
    return null;
  }

  const token = randomBytes(24).toString("hex");
  store.users[index] = {
    ...store.users[index],
    resetToken: token,
    resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  return {
    token,
    email: store.users[index].email,
  };
}

export async function resetPassword(input: {
  email: string;
  token: string;
  password: string;
}) {
  const store = await readStore();
  const index = store.users.findIndex(
    (user) => normalizeEmail(user.email) === normalizeEmail(input.email),
  );
  if (index === -1) {
    return null;
  }

  const user = store.users[index];
  const isExpired = !user.resetTokenExpiresAt || new Date(user.resetTokenExpiresAt) < new Date();

  if (!user.resetToken || user.resetToken !== input.token || isExpired) {
    throw new Error("Invalid or expired reset token.");
  }

  store.users[index] = {
    ...user,
    passwordHash: createPasswordHash(input.password),
    resetToken: undefined,
    resetTokenExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  return store.users[index];
}
