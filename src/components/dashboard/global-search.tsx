"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  BookOpen,
  CheckSquare,
  GraduationCap,
  ClipboardList,
  X,
  Bell,
  BookMarked,
  FileText,
  Link2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { localApiClient } from "@/lib/api-client";
import { SearchResultItem } from "@/types/search";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeout = window.setTimeout(async () => {
      try {
        const response = await localApiClient.get<{ items: SearchResultItem[] }>("/search", {
          q: trimmedQuery,
          limit: "8",
        });

        if (!cancelled) {
          setResults(Array.isArray(response.items) ? response.items : []);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query]);

  const handleSelect = (path: string) => {
    router.push(path);
    setQuery("");
    setIsOpen(false);
    setResults([]);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "Course": return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "Prior Course": return <BookMarked className="h-4 w-4 text-sky-500" />;
      case "Task": return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case "Exam": return <ClipboardList className="h-4 w-4 text-rose-500" />;
      case "Self-Learning": return <GraduationCap className="h-4 w-4 text-amber-500" />;
      case "Reflection": return <FileText className="h-4 w-4 text-violet-500" />;
      case "Notification": return <Bell className="h-4 w-4 text-red-500" />;
      case "Resource": return <Link2 className="h-4 w-4 text-cyan-500" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative w-full max-w-md group" ref={containerRef}>
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
          isOpen ? "text-primary" : "text-muted-foreground"
        )} />
        <Input
          type="text"
          placeholder="Search courses, tasks, exams..."
          className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all rounded-xl h-10 w-full"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {isSearching && (
          <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
        {query && (
          <button 
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Quick Results
            </div>
            {results.map((item) => (
              <button
                key={`${item.category}-${item.id}`}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-xl transition-colors text-left group/item"
                onClick={() => handleSelect(item.path)}
              >
                <div className="p-2 rounded-lg bg-background border border-border group-hover/item:border-primary/20 transition-colors">
                  {getIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="font-medium text-primary/70">{item.category}</span>
                    {item.description && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="truncate">{item.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 bg-muted/20 border-t border-border/50 text-center">
             <div className="text-[10px] text-muted-foreground">
               Press <kbd className="font-sans px-1 rounded border bg-background">ESC</kbd> to close
             </div>
          </div>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && !isSearching && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-8 bg-card border border-border rounded-2xl shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
             <Search className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No results found</h3>
          <p className="text-xs text-muted-foreground">We couldn&apos;t find anything matching &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
