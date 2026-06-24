import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Register | StudyFlow",
  description:
    "Create a StudyFlow account to start organizing your academic journey.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/10 mb-6">
              <svg
                className="w-10 h-10 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Start Your Success Journey
            </h3>
            <p className="text-primary-foreground/80">
              Join thousands of students who have transformed their academic
              life with StudyFlow.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {[
              "Smart course and task management",
              "Progress tracking and analytics",
              "Focus mode and productivity tools",
              "Self-learning path builder",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg p-3"
              >
                <svg
                  className="w-5 h-5 text-primary-foreground shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-primary-foreground text-sm">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="StudyFlow Logo"
                width={140}
                height={50}
                className="h-20 w-auto mx-auto dark:brightness-0 dark:invert"
              />
            </Link>
            <h2 className="mt-8 text-2xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start organizing your academic life today
            </p>
          </div>

          <RegisterForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
