"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types/settings";
import { useAppState } from "@/hooks/use-app-state";
import { AuthService } from "@/services/auth.service";
import { SettingsHeader } from "@/components/settings/settings-header";
import { ProfileSection } from "@/components/settings/profile-section";
import { AcademicSettingsSection } from "@/components/settings/academic-settings-section";
import { NotificationSettingsSection } from "@/components/settings/notification-settings-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle2, LogOut, RefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HeaderSkeleton, ListSkeleton } from "@/components/shared/skeletons";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";

export default function SettingsPage() {
  const { state, isLoaded, updateState } = useAppState();
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
  };

  // Sync with central state when it loads
  useEffect(() => {
    if (isLoaded && state.userProfile) {
      setLocalProfile(state.userProfile);
    }
  }, [isLoaded, state.userProfile]);

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!localProfile) return;
    setLocalProfile({ ...localProfile, ...updates });
    setHasChanges(true);
    setSaveSuccess(false);
    setSaveError(false);
  };

  const handleUpdateReminders = (
    updates: Partial<UserProfile["reminderPreferences"]>,
  ) => {
    if (!localProfile) return;
    setLocalProfile({
      ...localProfile,
      reminderPreferences: { ...localProfile.reminderPreferences, ...updates },
    });
    setHasChanges(true);
    setSaveSuccess(false);
    setSaveError(false);
  };

  const handleSave = async () => {
    if (!localProfile) return;

    // Validate credit hours
    const totalHours = parseInt(localProfile.totalCreditHours) || 0;
    const completedHours = parseInt(localProfile.completedCreditHours) || 0;
    if (completedHours > totalHours && totalHours > 0) {
      // Don't save if invalid
      return;
    }

    setIsSaving(true);
    setSaveError(false);

    try {
      const updated = await AuthService.updateProfile({
        name: localProfile.name,
        university: localProfile.university,
        major: localProfile.major,
        academicYear: localProfile.academicYear,
        currentGPA: localProfile.currentGPA,
        totalCreditHours: localProfile.totalCreditHours,
        completedCreditHours: localProfile.completedCreditHours,
        themePreference: localProfile.themePreference,
        focusPreferences: localProfile.focusPreferences,
        reminderPreferences: localProfile.reminderPreferences,
      });

      updateState({
        userProfile: updated,
        academicPlanning: {
          ...state.academicPlanning,
          config: {
            ...state.academicPlanning.config,
            totalRequiredCredits: parseInt(updated.totalCreditHours) || 144,
          },
        },
      });

      setLocalProfile(updated);
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalProfile(state.userProfile);
    setHasChanges(false);
    setSaveSuccess(false);
    setSaveError(false);
  };

  if (!isLoaded || !localProfile) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 pt-4 md:pt-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <SettingsHeader />

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              "Saving..."
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
          Failed to save changes. Please check your connection and try again.
        </div>
      )}

      <div className="space-y-10">
        <ProfileSection profile={localProfile} onUpdate={handleUpdateProfile} />

        <Separator />

        <AcademicSettingsSection
          profile={localProfile}
          onUpdate={handleUpdateProfile}
        />

        <Separator />

        <NotificationSettingsSection
          preferences={localProfile.reminderPreferences}
          onUpdate={handleUpdateReminders}
        />

        <Separator />

        <AppearanceSection />

        <Separator className="my-10" />

        {/* System Settings */}
        <section className="space-y-8">
          {/* Logout Part */}
          <div className="pt-4 border-border/40 max-w-sm">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(true)}
              className="h-14 w-full justify-start px-5 rounded-2xl border-border/40 hover:bg-muted/50 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <LogOut className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <div className="flex flex-col items-start translate-y-[1px]">
                  <span className="text-sm font-bold text-foreground">
                    Sign Out
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                    End current session
                  </span>
                </div>
              </div>
            </Button>
          </div>
        </section>

        <section className="pt-12">
          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/60 rounded-3xl opacity-40 hover:opacity-100 transition-opacity bg-muted/5">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              <span>StudyFlow v2.1.0</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span>Modern Academic Engine</span>
            </div>
          </div>
        </section>
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+128px)] bg-card border border-primary/20 shadow-lg px-6 py-3 rounded-full flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <p className="text-sm font-medium">You have unsaved changes</p>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Now"}
          </Button>
        </div>
      )}

      <ConfirmActionDialog
        isOpen={isLogoutDialogOpen}
        title="Sign Out"
        description="Are you sure you want to sign out of StudyFlow?"
        confirmText="Sign Out"
        icon={<LogOut className="h-6 w-6" />}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
}