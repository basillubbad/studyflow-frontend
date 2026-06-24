import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ReflectionEntry } from "@/types/reflections";
import { getMoodInfo } from "@/lib/reflections/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmilePlus, Smile, Meh, Frown, Coffee, CloudRain, CalendarDays, Edit2, Trash2, Heart } from "lucide-react";

interface ReflectionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reflection: ReflectionEntry | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

function ReflectionSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  if (!content) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h4>
      <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

export function ReflectionDetailDialog({ open, onOpenChange, reflection, onEditClick, onDeleteClick }: ReflectionDetailDialogProps) {
  if (!reflection) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        
        <DialogHeader className="px-6 py-5 border-b bg-card shrink-0 flex flex-row items-start justify-between">
           <div className="space-y-1.5">
               <DialogTitle className="text-2xl font-bold tracking-tight">{reflection.title}</DialogTitle>
               <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                     <CalendarDays className="w-4 h-4" />
                     {new Date(reflection.date).toLocaleDateString(undefined, {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                     })}
                  </div>
               </div>
           </div>
           <div className="hidden sm:block">
              <Badge variant="outline" className={`px-3 py-1.5 text-sm capitalize shadow-none border ${moodInfo.colorClass}`}>
                  {renderMoodIcon(moodInfo.icon, "w-4 h-4 mr-2")}
                  {moodInfo.label} Mood
              </Badge>
           </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Mobile Mood Badge fallback */}
          <div className="sm:hidden block">
             <Badge variant="outline" className={`w-full justify-center py-2 text-sm capitalize shadow-none border ${moodInfo.colorClass}`}>
                  {renderMoodIcon(moodInfo.icon, "w-4 h-4 mr-2")}
                  Feeling {moodInfo.label}
             </Badge>
          </div>

          <ReflectionSection title="What I Achieved" content={reflection.achieved} />
          <ReflectionSection title="What Was Difficult" content={reflection.difficult} />
          <ReflectionSection title="What I Learned" content={reflection.learned} />
          <ReflectionSection title="What to Improve Next" content={reflection.improveNext} />
          
          {reflection.gratitude && (
              <div className="flex gap-3 bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 text-pink-700/90 items-start">
                  <Heart className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                      <span className="font-semibold block mb-0.5">I am grateful for...</span>
                      {reflection.gratitude}
                  </div>
              </div>
          )}

          {(reflection.tags && reflection.tags.length > 0) && (
              <div className="pt-4 border-t border-border/50">
                 <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                    {reflection.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-muted hover:bg-muted text-muted-foreground text-sm">#{tag}</Badge>
                    ))}
                 </div>
              </div>
          )}

        </div>
        
        <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 gap-2 sm:gap-0 justify-between items-center sm:justify-between w-full">
           <Button variant="ghost" onClick={onDeleteClick} className="text-destructive hover:bg-destructive/10 hover:text-destructive hidden sm:flex">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
           </Button>
           
           <div className="flex gap-2 w-full sm:w-auto">
               <Button variant="outline" onClick={onEditClick} className="rounded-xl flex-1 sm:flex-none">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Info
               </Button>
               <Button onClick={() => onOpenChange(false)} className="rounded-xl flex-1 sm:flex-none">Close</Button>
           </div>
           
           <Button variant="ghost" onClick={onDeleteClick} className="text-destructive hover:bg-destructive/10 hover:text-destructive flex sm:hidden w-full mt-2">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Entry
           </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
}
