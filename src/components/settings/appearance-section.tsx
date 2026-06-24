import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Card className="border-border/40 shadow-sm bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Appearance</CardTitle>
        <CardDescription>
          Choose a theme that feels right for you.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Simple & Elegant Segmented Control */}
        <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50 max-w-sm">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                theme === t.value
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-border/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <t.icon className={cn("h-4 w-4", theme === t.value ? "text-primary" : "text-muted-foreground/70")} />
              {t.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
