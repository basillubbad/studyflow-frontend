import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Setup | StudyFlow",
  description: "Set up your academic profile on StudyFlow.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
