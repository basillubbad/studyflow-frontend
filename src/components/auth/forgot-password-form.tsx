"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { AuthService } from "@/services/auth.service"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await AuthService.forgotPassword(email);
      // Laravel returns the token and email directly in this mock/dev flow
      if (response.token) {
        router.push(`/reset-password?token=${response.token}&email=${response.email || email}`);
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      // In case of error, maybe show a toast or stay on page
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary animate-in zoom-in duration-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Check your email</h3>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        <Button asChild className="w-full h-11" variant="outline">
          <Link href="/login">
            Back to login
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending link...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      <div className="text-center">
        <Button asChild variant="link" className="text-muted-foreground hover:text-primary p-0 h-auto">
          <Link href="/login" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </Button>
      </div>
    </form>
  )
}
