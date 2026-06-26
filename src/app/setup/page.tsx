"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, GraduationCap, Loader2 } from "lucide-react"
import { blurNumberInputOnWheel } from "@/lib/prevent-number-wheel"

const steps = [
  { id: 1, title: "Academic Year" },
  { id: 2, title: "Credit Hours" },
  { id: 3, title: "Academic Performance" },
  { id: 4, title: "University Info" },
]

export default function SetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    academicYear: "",
    totalCreditHours: "",
    completedCreditHours: "",
    currentGPA: "",
    university: "",
    major: "",
  })

  const progress = (currentStep / steps.length) * 100
  const totalCreditsNumber = parseInt(formData.totalCreditHours) || 0
  const completedCreditsNumber = parseInt(formData.completedCreditHours) || 0
  const hasCreditValidationError =
    totalCreditsNumber > 0 && completedCreditsNumber > totalCreditsNumber

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (hasCreditValidationError) {
      return
    }

    setIsLoading(true)
    
    try {
      const { AuthService } = await import("@/services/auth.service");
      await AuthService.setup({
        academicYear: formData.academicYear,
        totalCreditHours: formData.totalCreditHours,
        completedCreditHours: formData.completedCreditHours,
        currentGPA: formData.currentGPA,
        university: formData.university,
        major: formData.major,
      });

      const { AppStore } = await import("@/lib/store/app-store");
      AppStore.update(state => ({
        ...state,
        onboardingCompleted: true,
        academicPlanning: {
          ...state.academicPlanning,
          config: {
            ...state.academicPlanning.config,
            totalRequiredCredits: parseInt(formData.totalCreditHours) || 144
          }
        }
      }));

      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to setup account:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.academicYear !== ""
      case 2:
        return (
          formData.totalCreditHours !== "" &&
          formData.completedCreditHours !== "" &&
          !hasCreditValidationError
        )
      case 3:
        return formData.currentGPA !== ""
      case 4:
        return true // Optional fields
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Image 
            src="/logo.png" 
            alt="StudyFlow Logo" 
            width={120} 
            height={40} 
            className="h-8 w-auto"
          />
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          {/* Step 1: Academic Year */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">What year are you in?</h1>
                <p className="text-muted-foreground mt-2">This helps us personalize your experience</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year (Freshman)</SelectItem>
                    <SelectItem value="2">2nd Year (Sophomore)</SelectItem>
                    <SelectItem value="3">3rd Year (Junior)</SelectItem>
                    <SelectItem value="4">4th Year (Senior)</SelectItem>
                    <SelectItem value="5">5th Year</SelectItem>
                    <SelectItem value="graduate">Graduate Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Credit Hours */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Tell us about your credits</h1>
                <p className="text-muted-foreground mt-2">We will track your progress towards graduation</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalCreditHours">Total Credit Hours Required</Label>
                  <Input
                    id="totalCreditHours"
                    type="number"
                    min="0"
                    placeholder="e.g., 120"
                    value={formData.totalCreditHours}
                    onChange={(e) => setFormData({ ...formData, totalCreditHours: e.target.value })}
                    onWheel={blurNumberInputOnWheel}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completedCreditHours">Credit Hours Completed</Label>
                  <Input
                    id="completedCreditHours"
                    type="number"
                    min="0"
                    max={formData.totalCreditHours || undefined}
                    placeholder="e.g., 45"
                    value={formData.completedCreditHours}
                    onChange={(e) => setFormData({ ...formData, completedCreditHours: e.target.value })}
                    onWheel={blurNumberInputOnWheel}
                    className="h-12"
                  />
                </div>

                {hasCreditValidationError && (
                  <p className="text-sm font-medium text-destructive">
                    Completed credit hours cannot be greater than total required credit hours.
                  </p>
                )}

                {formData.totalCreditHours && formData.completedCreditHours && (
                  <div className="bg-muted rounded-lg p-4 mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {Math.round((completedCreditsNumber / totalCreditsNumber) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(completedCreditsNumber / totalCreditsNumber) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {totalCreditsNumber - completedCreditsNumber} credits remaining
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Academic Performance */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Your current GPA</h1>
                <p className="text-muted-foreground mt-2">Enter your GPA on a 4.0 scale or as a percentage</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentGPA">Current GPA / Average</Label>
                <Input
                  id="currentGPA"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 3.50 or 85"
                  value={formData.currentGPA}
                  onChange={(e) => setFormData({ ...formData, currentGPA: e.target.value })}
                  onWheel={blurNumberInputOnWheel}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Enter either your GPA (0-4.0 scale) or percentage (0-100)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: University Info (Optional) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Almost done!</h1>
                <p className="text-muted-foreground mt-2">Optional: Add your university details</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University Name</Label>
                  <Input
                    id="university"
                    type="text"
                    placeholder="e.g., MIT"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Major / Field of Study</Label>
                  <Input
                    id="major"
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">You are all set!</p>
                    <p className="text-sm text-muted-foreground">
                      You can always update these details later in your profile settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="h-11 bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-11"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
