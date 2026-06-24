import Link from "next/link";
import Image from "next/image";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
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
              Forgot password?
            </h2>
            <p className="mt-2 text-muted-foreground">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          <ForgotPasswordForm />
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Secure Your Account
            </h3>
            <p className="text-primary-foreground/80">
              Reset your password to regain access to your personal study dashboard and academic plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
