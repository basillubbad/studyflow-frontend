import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReflectionEntry } from "@/types/reflections";
import { getMoodInfo, isDateInThisWeek } from "@/lib/reflections/utils";
import { LineChart, BookOpen, Flame, SmilePlus, Smile, Meh, Frown, Coffee, CloudRain } from "lucide-react";

interface ReflectionsStatsProps {
  reflections: ReflectionEntry[];
}

export function ReflectionsStats({ reflections }: ReflectionsStatsProps) {
  const totalCount = reflections.length;
  const thisWeekCount = reflections.filter(r => isDateInThisWeek(r.date)).length;

  const latestReflection = reflections.length > 0 
    ? [...reflections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const latestMoodValue = latestReflection?.mood || "neutral";
  const latestMoodInfo = getMoodInfo(latestMoodValue);

  const renderMoodIcon = (iconName: string, className: string) => {
      switch(iconName) {
         case "SmilePlus": return <SmilePlus className={className} />;
         case "Smile": return <Smile className={className} />;
         case "Meh": return <Meh className={className} />;
         case "Frown": return <Frown className={className} />;
         case "Coffee": return <Coffee className={className} />;
         case "CloudRain": return <CloudRain className={className} />;
         default: return <Smile className={className} />;
      }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Reflections */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Reflections</CardTitle>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {totalCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
             Journaling entries overall
          </p>
        </CardContent>
      </Card>

      {/* This Week */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {thisWeekCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
             Entries recorded this week
          </p>
        </CardContent>
      </Card>

      {/* Latest Mood */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Latest Mood</CardTitle>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <LineChart className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          {latestReflection ? (
             <div className="flex items-center gap-3 mt-1">
                 <div className={`p-2 rounded-full border ${latestMoodInfo.colorClass}`}>
                    {renderMoodIcon(latestMoodInfo.icon, "w-6 h-6")}
                 </div>
                 <div>
                    <div className="text-lg font-bold tracking-tight text-foreground capitalize">
                        {latestMoodInfo.label}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate opacity-80">
                        {new Date(latestReflection.date).toLocaleDateString()}
                    </p>
                 </div>
             </div>
          ) : (
            <div className="mt-1">
              <div className="text-3xl font-bold tracking-tight text-foreground opacity-50">
                 --
              </div>
              <p className="text-xs text-muted-foreground mt-1">No entries yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
