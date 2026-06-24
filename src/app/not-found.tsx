"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Ghost, Book, Clock, Home, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[10%] left-[15%] animate-float blur-[1px]">
          <Book className="w-16 h-16 text-primary/40 rotate-12" />
        </div>
        <div className="absolute bottom-[20%] right-[10%] animate-float-delayed blur-[1.5px]">
          <Compass className="w-24 h-24 text-secondary/30 -rotate-12" />
        </div>
        <div className="absolute top-[60%] left-[5%] animate-float-delayed blur-[1px]">
          <Clock className="w-12 h-12 text-accent/40 rotate-45" />
        </div>
        <div className="absolute bottom-[40%] left-[50%] animate-float opacity-30">
          <Ghost className="w-32 h-32 text-muted-foreground/20" />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="z-10 w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="relative inline-block group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-60" />
          <h1 className="relative text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 leading-none">
            404
          </h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Lost in the Study Flow?
            </h2>
            <p className="text-xl text-muted-foreground/80 max-w-md mx-auto leading-relaxed rtl:font-arabic">
              {
                "It seems you've drifted off track. The page you're looking for doesn't exist in our current curriculum."
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-2xl h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all group"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                {"Back to Dashboard"}
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl h-14 px-8 text-base font-medium border-border/60 backdrop-blur-sm bg-background/50 group"
            >
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                {"Go to Homepage"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-12 flex items-center justify-center gap-2 text-muted-foreground/40 text-sm font-medium">
          <div className="h-px w-8 bg-current/20" />
          <span>StudyFlow Academic Intelligence</span>
          <div className="h-px w-8 bg-current/20" />
        </div>
      </div>
    </div>
  );
}
