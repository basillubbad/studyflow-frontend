import { cn } from "@/lib/utils";

interface WelcomeSectionProps {
  userName?: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  const displayName = userName || "Student";
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = now.toLocaleDateString("en-US", dateOptions);

  const hour = now.getHours();
  let greeting = "Good evening";
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  return (
    <div className="flex flex-col gap-1 mb-8 mt-2">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        <span className="capitalize">{greeting}</span>, {displayName}{" "}
        <span className="text-2xl inline-block wave-animation">👋</span>
      </h1>
      <span
        className={cn(
          "text-sm font-medium text-muted-foreground mt-1",
          "before:content-['Today_is_'] before:mr-1 before:text-muted-foreground/70 before:font-normal",
        )}
      >
        {today}
      </span>
    </div>
  );
}
