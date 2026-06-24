"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/utils";

export interface FocusLevel {
  id: string;
  name: string;
  pomodoro: number; // in minutes
  rest: number;
  longRest: number;
}

export const FOCUS_LEVELS: FocusLevel[] = [
  { id: "baby", name: "Baby step", pomodoro: 10, rest: 5, longRest: 10 },
  { id: "popular", name: "Popular", pomodoro: 20, rest: 5, longRest: 15 },
  { id: "medium", name: "Medium", pomodoro: 40, rest: 8, longRest: 20 },
  { id: "extended", name: "Extended", pomodoro: 60, rest: 10, longRest: 25 },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLevel: string;
  onLevelChange: (levelId: string) => void;
  customSettings: {
    pomodoro: number;
    rest: number;
    longRest: number;
  };
  onCustomSettingsChange: (settings: {
    pomodoro: number;
    rest: number;
    longRest: number;
  }) => void;
  challengeHours: number;
  onChallengeHoursChange: (hours: number) => void;
  challengeMinutes: number;
  onChallengeMinutesChange: (minutes: number) => void;
  className?: string;
}

export function SettingsPanel({
  isOpen,
  onClose,
  selectedLevel,
  onLevelChange,
  customSettings,
  onCustomSettingsChange,
  challengeHours,
  onChallengeHoursChange,
  challengeMinutes,
  onChallengeMinutesChange,
  className,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute right-0 top-0 z-50 h-full w-80 border-l bg-background p-6 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold">Customize focus level</h2>
      </div>

      <div className="space-y-4">
        {FOCUS_LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onLevelChange(level.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted",
              selectedLevel === level.id && "bg-muted",
            )}
          >
            <div
              className={cn(
                "size-5 rounded-full border-2 flex items-center justify-center",
                selectedLevel === level.id
                  ? "border-pink-500"
                  : "border-muted-foreground/30",
              )}
            >
              {selectedLevel === level.id && (
                <div className="size-3 rounded-full bg-pink-500" />
              )}
            </div>
            <div>
              <p className="font-medium">{level.name}</p>
              <p className="text-xs text-muted-foreground">
                {level.pomodoro} min · {level.rest} min · {level.longRest} min
              </p>
            </div>
          </button>
        ))}

        {/* Custom option */}
        <button
          onClick={() => onLevelChange("custom")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted",
            selectedLevel === "custom" && "bg-muted",
          )}
        >
          <div
            className={cn(
              "size-5 rounded-full border-2 flex items-center justify-center",
              selectedLevel === "custom"
                ? "border-pink-500"
                : "border-muted-foreground/30",
            )}
          >
            {selectedLevel === "custom" && (
              <div className="size-3 rounded-full bg-pink-500" />
            )}
          </div>
          <p className="font-medium">Custom</p>
        </button>

        {selectedLevel === "custom" && (
          <div className="ml-8 space-y-6 pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {customSettings.pomodoro} min
                </span>
                <span>Pomodoro</span>
              </div>
              <Slider
                value={[customSettings.pomodoro]}
                onValueChange={([value]) =>
                  onCustomSettingsChange({ ...customSettings, pomodoro: value })
                }
                min={5}
                max={90}
                step={5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {customSettings.rest} min
                </span>
                <span>Rest</span>
              </div>
              <Slider
                value={[customSettings.rest]}
                onValueChange={([value]) =>
                  onCustomSettingsChange({ ...customSettings, rest: value })
                }
                min={1}
                max={30}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {customSettings.longRest} min
                </span>
                <span>Long Rest</span>
              </div>
              <Slider
                value={[customSettings.longRest]}
                onValueChange={([value]) =>
                  onCustomSettingsChange({ ...customSettings, longRest: value })
                }
                min={5}
                max={60}
                step={5}
              />
            </div>
          </div>
        )}

        {/* Daily Challenge Section */}
        <div className="pt-6 border-t mt-6">
          <h3 className="font-semibold text-sm mb-4">Daily Challenge</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Hours Input */}
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Hours
                </label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={challengeHours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      onChallengeHoursChange(val);
                    }
                  }}
                  placeholder="0"
                  className="text-center"
                />
              </div>

              {/* Minutes Input */}
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Minutes
                </label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={challengeMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      onChallengeMinutesChange(val);
                    }
                  }}
                  placeholder="0"
                  className="text-center"
                />
              </div>
            </div>

            {/* Challenge Duration Display */}
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Total Challenge
              </p>
              <p className="font-semibold text-lg text-primary">
                {formatMinutes(challengeHours * 60 + challengeMinutes)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
