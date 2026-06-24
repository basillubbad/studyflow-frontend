import { UserProfile } from "@/types/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GraduationCap, Hash, Trophy, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcademicSettingsSectionProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

export function AcademicSettingsSection({ profile, onUpdate }: AcademicSettingsSectionProps) {
  const totalHours = parseInt(profile.totalCreditHours) || 0;
  const completedHours = parseInt(profile.completedCreditHours) || 0;
  const isInvalid = completedHours > totalHours && totalHours > 0;
  const remainingHours = Math.max(0, totalHours - completedHours);

  return (
    <Card className={cn(isInvalid && "border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Academic Settings</CardTitle>
            <CardDescription>
              Information about your academic progress and goals.
            </CardDescription>
          </div>
          {totalHours > 0 && !isInvalid && (
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Remaining</div>
              <div className="text-2xl font-black text-primary">{remainingHours} <span className="text-sm font-medium text-muted-foreground">hrs</span></div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="academicYear"
                value={profile.academicYear}
                onChange={(e) => onUpdate({ academicYear: e.target.value })}
                className="pl-9"
                placeholder="e.g., 3rd Year"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentGPA">GPA / Average</Label>
            <div className="relative">
              <Trophy className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentGPA"
                type="text"
                value={profile.currentGPA}
                onChange={(e) => onUpdate({ currentGPA: e.target.value })}
                className="pl-9"
                placeholder="e.g., 3.50 or 85%"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCreditHours">Total Credit Hours Required</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="totalCreditHours"
                type="number"
                value={profile.totalCreditHours}
                onChange={(e) => onUpdate({ totalCreditHours: e.target.value })}
                className={cn("pl-9", isInvalid && "border-destructive focus-visible:ring-destructive")}
                placeholder="e.g., 120"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completedCreditHours">Credit Hours Completed</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="completedCreditHours"
                type="number"
                value={profile.completedCreditHours}
                onChange={(e) => onUpdate({ completedCreditHours: e.target.value })}
                className={cn("pl-9", isInvalid && "border-destructive focus-visible:ring-destructive")}
                placeholder="e.g., 45"
              />
            </div>
          </div>
        </div>

        {isInvalid && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <div className="p-1.5 bg-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-destructive">Invalid Credit Hours</p>
              <p className="text-xs text-destructive/80 leading-relaxed">
                Completed hours ({completedHours}) cannot exceed the total required hours ({totalHours}). 
                Please adjust either the total required or the completed hours.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
