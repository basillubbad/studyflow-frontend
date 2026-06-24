import React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ThemeProvider } from "next-themes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="lg:pl-64">
          <DashboardHeader />
          <main className="p-4 lg:p-6">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
