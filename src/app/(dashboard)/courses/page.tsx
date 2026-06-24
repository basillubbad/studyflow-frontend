import { Metadata } from "next";
import CoursesClient from "./courses-client";

export const metadata: Metadata = {
  title: "My Courses | StudyFlow",
  description: "Manage and track your academic courses, credits, and GPA progress in one smart dashboard.",
};

export default function CoursesPage() {
  return <CoursesClient />;
}
