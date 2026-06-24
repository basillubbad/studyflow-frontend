import { ReflectionEntry } from "@/types/reflections";
import { getMoodInfo } from "@/lib/reflections/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmilePlus, Smile, Meh, Frown, Coffee, CloudRain, CalendarDays, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ReflectionCardProps {
  reflection: ReflectionEntry;
  onView: (reflection: ReflectionEntry) => void;
  onEdit: (reflection: ReflectionEntry) => void;
  onDelete: (id: string) => void;
}

export function ReflectionCard({ reflection, onView, onEdit, onDelete }: ReflectionCardProps) {
  const moodInfo = getMoodInfo(reflection.mood);
  
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

  // Generate a small preview snippet safely from whatever fields have text
  const previewText = reflection.learned || reflection.achieved || reflection.difficult || reflection.improveNext || "";
  const excerpt = previewText.length > 100 ? previewText.substring(0, 100) + "..." : previewText;

  // Stop click propagation on the dropdown so it doesn&apos;t trigger onView.
  const handleDropdownClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <Card 
      onClick={() => onView(reflection)}
      className="border-border/60 shadow-sm hover:shadow-md transition-all duration-200 bg-card cursor-pointer block hover:-translate-y-0.5"
    >
      <CardContent className="p-5 flex flex-col gap-4">
        
        {/* Header Row */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
             <h3 className="font-semibold text-lg text-foreground truncate" title={reflection.title}>
               {reflection.title}
             </h3>
             <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
               <CalendarDays className="w-3.5 h-3.5" />
               <time dateTime={reflection.date}>
                 {new Date(reflection.date).toLocaleDateString(undefined, {
                   weekday: 'short',
                   month: 'short',
                   day: 'numeric'
                 })}
               </time>
             </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <Badge variant="outline" className={`capitalize shadow-none border ${moodInfo.colorClass}`}>
                {renderMoodIcon(moodInfo.icon, "w-3 h-3 mr-1.5")}
                {moodInfo.label}
             </Badge>
             
             <div onClick={handleDropdownClick}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit(reflection)} className="cursor-pointer">
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(reflection.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>
          </div>
        </div>
        
        {/* Content Excerpt */}
        {excerpt && (
          <div className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed">
            &quot;{excerpt}&quot;
          </div>
        )}
        
        {/* Tags Row */}
        {(reflection.tags && reflection.tags.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
             {reflection.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground">
                   #{tag}
                </Badge>
             ))}
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}
