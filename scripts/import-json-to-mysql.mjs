import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const root = process.cwd();

const usersPath = path.join(root, "data", "users.json");
const appDataPath = path.join(root, "data", "app-data.json");

function toDate(value) {
  return value ? new Date(value) : null;
}

async function main() {
  const usersRaw = JSON.parse(await readFile(usersPath, "utf8"));
  const appDataRaw = JSON.parse(await readFile(appDataPath, "utf8"));

  for (const user of usersRaw.users || []) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        university: user.university || "",
        major: user.major || "",
        academicYear: user.academicYear || "",
        currentGPA: user.currentGPA || "",
        totalCreditHours: user.totalCreditHours || "",
        completedCreditHours: user.completedCreditHours || "",
        onboardingCompleted: Boolean(user.onboardingCompleted),
        avatarUrl: user.avatarUrl || null,
        focusPreferences: user.focusPreferences || {},
        reminderPreferences: user.reminderPreferences || {},
        themePreference: user.themePreference || "system",
        resetToken: user.resetToken || null,
        resetTokenExpiresAt: toDate(user.resetTokenExpiresAt),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        university: user.university || "",
        major: user.major || "",
        academicYear: user.academicYear || "",
        currentGPA: user.currentGPA || "",
        totalCreditHours: user.totalCreditHours || "",
        completedCreditHours: user.completedCreditHours || "",
        onboardingCompleted: Boolean(user.onboardingCompleted),
        avatarUrl: user.avatarUrl || null,
        focusPreferences: user.focusPreferences || {},
        reminderPreferences: user.reminderPreferences || {},
        themePreference: user.themePreference || "system",
        resetToken: user.resetToken || null,
        resetTokenExpiresAt: toDate(user.resetTokenExpiresAt),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  for (const [userId, userData] of Object.entries(appDataRaw.users || {})) {
    await prisma.userAppData.upsert({
      where: { userId },
      update: {
        semesters: userData.semesters || [],
        courses: userData.courses || [],
        tasks: userData.tasks || [],
        reflections: userData.reflections || [],
        notifications: userData.notifications || [],
        focusSessions: userData.focusSessions || [],
        selfLearningPlans: userData.selfLearningPlans || [],
        examPrepByItemId: userData.examPrepByItemId || {},
        detachedResources: userData.detachedResources || {},
      },
      create: {
        userId,
        semesters: userData.semesters || [],
        courses: userData.courses || [],
        tasks: userData.tasks || [],
        reflections: userData.reflections || [],
        notifications: userData.notifications || [],
        focusSessions: userData.focusSessions || [],
        selfLearningPlans: userData.selfLearningPlans || [],
        examPrepByItemId: userData.examPrepByItemId || {},
        detachedResources: userData.detachedResources || {},
      },
    });
  }

  console.log("JSON data imported into MySQL successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
