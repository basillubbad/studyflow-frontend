"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { Settings2, RotateCcw ,X} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimerDisplay } from "@/components/focus/timer-display";
import { SessionTabs, type SessionType } from "@/components/focus/session-tabs";
import { SettingsPanel, FOCUS_LEVELS } from "@/components/focus/settings-panel";
import { TasksPanel } from "@/components/focus/tasks-panel";
import { ChallengeBar } from "@/components/focus/challenge-bar";
import { useTimer } from "@/hooks/use-timer";
import { FocusSkeleton } from "@/components/shared/skeletons";
import { DataService } from "@/services/data.service";

const STORAGE_KEY = "pomodoro-settings";
const CHALLENGE_STORAGE_KEY = "daily-challenge";

interface StoredSettings {
  selectedLevel: string;
  customSettings: {
    pomodoro: number;
    rest: number;
    longRest: number;
  };
}

interface StoredChallenge {
  hours: number;
  minutes: number;
}

const DEFAULT_SETTINGS: StoredSettings = {
  selectedLevel: "extended",
  customSettings: {
    pomodoro: 25,
    rest: 5,
    longRest: 15,
  },
};

const DEFAULT_CHALLENGE: StoredChallenge = {
  hours: 3,
  minutes: 0,
};

function getStoredSettings(): StoredSettings {
  return DEFAULT_SETTINGS;
}

function getStoredChallenge(): StoredChallenge {
  return DEFAULT_CHALLENGE;
}

// Hydration-safe mounted flag without setState in useEffect
function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function useHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export default function FocusPage() {
  const mounted = useHydrated();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState<string>(
    () => getStoredSettings().selectedLevel,
  );

  const [customSettings, setCustomSettings] = useState<
    StoredSettings["customSettings"]
  >(() => getStoredSettings().customSettings);

  const [challengeHours, setChallengeHours] = useState<number>(
    () => getStoredChallenge().hours,
  );

  const [challengeMinutes, setChallengeMinutes] = useState<number>(
    () => getStoredChallenge().minutes,
  );

  const [activeSession, setActiveSession] = useState<SessionType>("pomodoro");

  const sessionStartRef = useRef<string | null>(null);

  const [sessionCounts, setSessionCounts] = useState({
    pomodoro: 0,
    rest: 0,
    longRest: 0,
  });

  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  // Load today's focus sessions from the backend so counts survive a refresh
  useEffect(() => {
    if (!mounted) return;

    const todayKey = new Date().toDateString();

    DataService.getFocusSessions()
      .then((sessions) => {
        const todaysSessions = sessions.filter(
          (s) => new Date(s.startTime).toDateString() === todayKey,
        );

        const counts = { pomodoro: 0, rest: 0, longRest: 0 };
        let focusMinutes = 0;

        todaysSessions.forEach((s) => {
          if (s.mode === "pomodoro") {
            counts.pomodoro += 1;
            focusMinutes += s.durationMinutes;
          }
        });

        setSessionCounts(counts);
        setTotalFocusMinutes(focusMinutes);
      })
      .catch(() => {
        console.error("Failed to load today's focus sessions");
      });
  }, [mounted]);

  // Calculate total challenge minutes from hours and minutes input
  const totalChallengeMinutes = challengeHours * 60 + challengeMinutes;

  const getDurationsByLevel = useCallback(
    (levelId: string) => {
      if (levelId === "custom") {
        return customSettings;
      }

      return (
        FOCUS_LEVELS.find((level) => level.id === levelId) ??
        DEFAULT_SETTINGS.customSettings
      );
    },
    [customSettings],
  );

  const getCurrentDurations = useCallback(() => {
    return getDurationsByLevel(selectedLevel);
  }, [selectedLevel, getDurationsByLevel]);

  const getDurationForSession = useCallback(
    (session: SessionType) => {
      const durations = getCurrentDurations();

      switch (session) {
        case "pomodoro":
          return durations.pomodoro * 60;
        case "rest":
          return durations.rest * 60;
        case "longRest":
          return durations.longRest * 60;
      }
    },
    [getCurrentDurations],
  );

  const handleTimerComplete = useCallback(() => {
    setSessionCounts((prev) => ({
      ...prev,
      [activeSession]: prev[activeSession] + 1,
    }));

    if (activeSession === "pomodoro") {
      const durations = getCurrentDurations();
      setTotalFocusMinutes((prev) => prev + durations.pomodoro);

      // Log the completed pomodoro session to the backend
      const endTime = new Date().toISOString();
      DataService.createFocusSession({
        durationMinutes: durations.pomodoro,
        startTime: sessionStartRef.current || endTime,
        endTime,
        mode: "pomodoro",
        completed: true,
      }).catch(() => {
        console.error("Failed to log focus session to backend");
      });
      sessionStartRef.current = null;
    }

    if (activeSession === "pomodoro") {
      const newPomodoros = sessionCounts.pomodoro + 1;

      if (newPomodoros % 4 === 0) {
        setActiveSession("longRest");
      } else {
        setActiveSession("rest");
      }
    } else {
      setActiveSession("pomodoro");
    }
  }, [activeSession, sessionCounts.pomodoro, getCurrentDurations]);

  const { time, state, start, pause, reset, setTime } = useTimer({
    initialTime: getDurationForSession("pomodoro"),
    onComplete: handleTimerComplete,
  });

  // Save settings to backend (to be implemented)
  useEffect(() => {
    if (!mounted) return;
    // Data should be handled by backend
  }, [selectedLevel, customSettings, mounted]);

  // Save challenge settings to backend (to be implemented)
  useEffect(() => {
    if (!mounted) return;
    // Data should be handled by backend
  }, [challengeHours, challengeMinutes, mounted]);

  // Update timer when session or settings change
  useEffect(() => {
    if (state === "idle") {
      setTime(getDurationForSession(activeSession));
    }
  }, [
    activeSession,
    selectedLevel,
    customSettings,
    state,
    getDurationForSession,
    setTime,
  ]);

  const handleSessionChange = (session: SessionType) => {
    setActiveSession(session);
    sessionStartRef.current = null;
    reset();
    setTime(getDurationForSession(session));
  };

  const handleLevelChange = (levelId: string) => {
    setSelectedLevel(levelId);

    if (state === "idle") {
      const durations = getDurationsByLevel(levelId);

      switch (activeSession) {
        case "pomodoro":
          setTime(durations.pomodoro * 60);
          break;
        case "rest":
          setTime(durations.rest * 60);
          break;
        case "longRest":
          setTime(durations.longRest * 60);
          break;
      }
    }
  };

  const handleRestart = () => {
    reset();
    sessionStartRef.current = null;
    setTime(getDurationForSession(activeSession));
    setSessionCounts({ pomodoro: 0, rest: 0, longRest: 0 });
    setTotalFocusMinutes(0);
  };

  const handleChallengeHoursChange = (hours: number) => {
    const validHours = Math.max(0, hours);
    setChallengeHours(validHours);
  };

  const handleChallengeMinutesChange = (minutes: number) => {
    // Clamp minutes between 0 and 59
    const validMinutes = Math.max(0, Math.min(59, minutes));
    setChallengeMinutes(validMinutes);
  };

  const getLevelName = () => {
    if (selectedLevel === "custom") return "Custom";
    const level = FOCUS_LEVELS.find((l) => l.id === selectedLevel);
    return level?.name || "Extended";
  };

  const totalSessionTime = getDurationForSession(activeSession);
  const progress = ((totalSessionTime - time) / totalSessionTime) * 100;
  if (!mounted) {
    return <FocusSkeleton />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <header className="flex items-center justify-between border-b p-2">
        <div className="border-border p-2">
          <Link href="/dashboard">
            <Image
              src="/logo.png"
              alt="StudyFlow Logo"
              width={140}
              height={50}
              className="h-12 w-auto dark:brightness-0 dark:invert"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="mr-2 size-4" />
            Customize
          </Button>

          <Button variant="ghost" size="sm" onClick={handleRestart}>
            <RotateCcw className="mr-2 size-4" />
            Restart session
          </Button>
           <Link href="/dashboard">
                        <X className="h-4 w-4" />
                      </Link>
        </div>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-3">
        <main className="lg:col-span-2 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl space-y-6 md:space-y-8">
            <ChallengeBar
              totalMinutes={totalChallengeMinutes}
              completedMinutes={totalFocusMinutes}
              currentSessionElapsedSeconds={
                getDurationForSession(activeSession) - time
              }
              isTimerRunning={state === "running"}
              activeSession={activeSession}
            />

            <SessionTabs
              activeSession={activeSession}
              onSessionChange={handleSessionChange}
              sessionCounts={sessionCounts}
            />

            <div className="flex justify-center py-6 md:py-8">
              <TimerDisplay
                time={time}
                level={getLevelName()}
                progress={progress}
              />
            </div>

            <div className="flex justify-center mb-6">
              {state === "running" ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full max-w-md text-lg font-semibold"
                  onClick={pause}
                >
                  STOP
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="h-14 w-full max-w-md text-lg font-semibold hover:primary"
                  onClick={() => {
                    if (activeSession === "pomodoro" && !sessionStartRef.current) {
                      sessionStartRef.current = new Date().toISOString();
                    }
                    start();
                  }}
                >
                  {state === "paused" ? "RESUME" : "START"}
                </Button>
              )}
            </div>
          </div>
        </main>

        <aside className="w-full lg:col-span-1 border-t lg:border-t-0 lg:border-l p-4 bg-muted/5 lg:bg-transparent">
          <TasksPanel />
        </aside>
      </div>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setSettingsOpen(false)}
        />
      )}

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedLevel={selectedLevel}
        onLevelChange={handleLevelChange}
        customSettings={customSettings}
        onCustomSettingsChange={setCustomSettings}
        challengeHours={challengeHours}
        onChallengeHoursChange={handleChallengeHoursChange}
        challengeMinutes={challengeMinutes}
        onChallengeMinutesChange={handleChallengeMinutesChange}
        className="fixed"
      />
    </div>
  );
}