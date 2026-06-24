import { Metadata } from "next";
import TasksClient from "./tasks-client";

export const metadata: Metadata = {
  title: "Academic Tasks | StudyFlow",
  description: "Track your assignments, exams, and study goals in one smart task manager for university students.",
};

export default function TasksPage() {
  return <TasksClient />;
}
