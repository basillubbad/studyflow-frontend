import Link from "next/link";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
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
              Reset your password
            </h2>
            <p className="mt-2 text-muted-foreground">
              Please enter your new password below to secure your account.
            </p>
          </div>

          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
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
