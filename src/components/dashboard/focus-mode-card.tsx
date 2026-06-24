import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function FocusModeCard() {
  return (
    <Card className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none" />
      <CardHeader className="relative pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Focus Mode
        </CardTitle>
        <CardDescription>Stay productive with Pomodoro</CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col items-center justify-center py-6">
        <Button
          className="w-full sm:w-auto rounded-full px-8 gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
          size="lg"
          asChild
        >
          <Link href="/focus">
            <Play className="h-4 w-4 fill-current" />
            Start Focus Session
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
