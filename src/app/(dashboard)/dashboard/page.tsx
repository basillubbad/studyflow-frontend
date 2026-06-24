import { Metadata } from "next";
import DashboardClient from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard | StudyFlow",
  description: "Manage your academic life, track your GPA, organize tasks, and monitor your study progress in one central dashboard.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
