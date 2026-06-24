"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (!token || !email) {
      setError(
        "Invalid or missing reset token. Please try the forgot password process again.",
      );
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      return;
    }

    if (!token || !email) {
      setError(
        "Invalid or missing reset token. Please try the forgot password process again.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.resetPassword({
        token: token,
        email: email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary animate-in zoom-in duration-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            Password reset successful
          </h3>
          <p className="text-muted-foreground">
            Your password has been successfully updated. You can now log in with
            your new password.
          </p>
        </div>
        <Button asChild className="w-full h-11">
          <Link href="/login">Login Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-in fade-in duration-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="h-11"
            disabled={!token || !email || isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm New Password</Label>
          <Input
            id="password_confirmation"
            type="password"
            placeholder="••••••••"
            value={formData.password_confirmation}
            onChange={(e) =>
              setFormData({
                ...formData,
                password_confirmation: e.target.value,
              })
            }
            required
            className="h-11"
            disabled={!token || !email || isLoading}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11"
        disabled={isLoading || !token || !email}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting password...
          </>
        ) : (
          "Reset password"
        )}
      </Button>

      <div className="text-center">
        <Button
          asChild
          variant="link"
          className="text-muted-foreground hover:text-primary p-0 h-auto"
        >
          <Link href="/login" className="text-sm">
            Back to login
          </Link>
        </Button>
      </div>
    </form>
  );
}
