import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import Image from "next/image"; 
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | StudyFlow",
  description: "Sign in to your StudyFlow account to manage your academic life.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
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
              Welcome back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to continue your academic journey
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {"Don't have an account?"}{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create new account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Track Your Academic Progress
            </h3>
            <p className="text-primary-foreground/80">
              Manage courses, complete tasks, and achieve your educational goals
              with our smart study organizer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
