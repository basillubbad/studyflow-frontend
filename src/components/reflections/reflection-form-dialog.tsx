import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReflectionEntry, MoodType } from "@/types/reflections";
import { MOODS, generateId } from "@/lib/reflections/utils";
import { Coffee, CloudRain, Frown, Meh, Smile, SmilePlus } from "lucide-react";
import { toast } from "sonner";

interface ReflectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: ReflectionEntry) => void;
  initialData?: ReflectionEntry | null;
}

export function ReflectionFormDialog({ open, onOpenChange, onSave, initialData }: ReflectionFormDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [mood, setMood] = useState<MoodType>("good");
  const [achieved, setAchieved] = useState("");
  const [difficult, setDifficult] = useState("");
  const [learned, setLearned] = useState("");
  const [improveNext, setImproveNext] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const resetForm = useCallback(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      setMood(initialData.mood);
      setAchieved(initialData.achieved);
      setDifficult(initialData.difficult);
      setLearned(initialData.learned);
      setImproveNext(initialData.improveNext);
      setGratitude(initialData.gratitude || "");
      setTagsInput(initialData.tags ? initialData.tags.join(", ") : "");
      return;
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    setTitle("");
    setDate(`${yyyy}-${mm}-${dd}`);
    setMood("good");
    setAchieved("");
    setDifficult("");
    setLearned("");
    setImproveNext("");
    setGratitude("");
    setTagsInput("");
  }, [initialData]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(resetForm);
    return () => cancelAnimationFrame(frame);
  }, [open, resetForm]);

  const handleSave = () => {
    if (!title.trim() || !date) return;
    
    // Require at least one content field
    if (!achieved.trim() && !difficult.trim() && !learned.trim() && !improveNext.trim()) {
        toast.error("Please write at least one reflection note (Achieved, Difficult, Learned, or Improve).");
        return;
    }

    const tagsArray = tagsInput
        .split(",")
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

    const nowIso = new Date().toISOString();

    onSave({
      id: initialData ? initialData.id : generateId(),
      title: title.trim(),
      date,
      mood,
      achieved: achieved.trim(),
      difficult: difficult.trim(),
      learned: learned.trim(),
      improveNext: improveNext.trim(),
      gratitude: gratitude.trim() ? gratitude.trim() : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      createdAt: initialData ? initialData.createdAt : nowIso,
      updatedAt: nowIso,
    });
    
    onOpenChange(false);
  };

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

  const isSaveDisabled = !title.trim() || !date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] sm:h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        
        <DialogHeader className="px-6 py-4 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-xl">{initialData ? "Edit Reflection" : "New Reflection"}</DialogTitle>
          <DialogDescription>Record your thoughts, challenges, and wins.</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Title & Date */}
             <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="title" className="font-semibold text-foreground">Entry Title <span className="text-red-500">*</span></Label>
                    <Input id="title" placeholder="e.g. End of Midterms" value={title} onChange={e => setTitle(e.target.value)} className="h-11" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="date" className="font-semibold text-foreground">Date <span className="text-red-500">*</span></Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11" />
                 </div>
             </div>

             {/* Mood Selector Grid */}
             <div className="space-y-3">
                 <Label className="font-semibold text-foreground">How are you feeling?</Label>
                 <div className="grid grid-cols-3 gap-2">
                    {MOODS.map(m => {
                        const isSelected = mood === m.value;
                        return (
                            <button 
                                key={m.value}
                                type="button"
                                onClick={() => setMood(m.value)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200
                                   ${isSelected ? `${m.colorClass} border-2 shadow-sm scale-105` : 'bg-card border-border hover:bg-muted text-muted-foreground'}
                                `}
                            >
                               {renderMoodIcon(m.icon, "w-6 h-6 mb-1")}
                               <span className="text-xs font-medium">{m.label}</span>
                            </button>
                        );
                    })}
                 </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="achieved" className="font-semibold text-foreground">What did you achieve?</Label>
                <Textarea id="achieved" placeholder="Wins, small or large..." value={achieved} onChange={e => setAchieved(e.target.value)} className="resize-none min-h-[90px]" />
             </div>
             
             <div className="space-y-2">
                <Label htmlFor="difficult" className="font-semibold text-foreground">What was difficult?</Label>
                <Textarea id="difficult" placeholder="Struggles or roadblocks faced..." value={difficult} onChange={e => setDifficult(e.target.value)} className="resize-none min-h-[90px]" />
             </div>
             
             <div className="space-y-2">
                <Label htmlFor="learned" className="font-semibold text-foreground">What did you learn?</Label>
                <Textarea id="learned" placeholder="Key takeaways from the experience..." value={learned} onChange={e => setLearned(e.target.value)} className="resize-none min-h-[90px]" />
             </div>
             
             <div className="space-y-2">
                <Label htmlFor="improveNext" className="font-semibold text-foreground">What do you want to improve next?</Label>
                <Textarea id="improveNext" placeholder="Steps for future growth..." value={improveNext} onChange={e => setImproveNext(e.target.value)} className="resize-none min-h-[90px]" />
             </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-border/60">
             <div className="space-y-2">
                <Label htmlFor="gratitude" className="font-semibold text-foreground">Gratitude Note (Optional)</Label>
                <Input id="gratitude" placeholder="I am grateful for..." value={gratitude} onChange={e => setGratitude(e.target.value)} className="h-11" />
             </div>
             <div className="space-y-2">
                <Label htmlFor="tags" className="font-semibold text-foreground">Tags (Optional)</Label>
                <Input id="tags" placeholder="exam, personal, stress (comma separated)" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="h-11" />
             </div>
          </div>
          
        </div>
        
        <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaveDisabled} className="rounded-xl w-full sm:w-auto">
             {initialData ? "Save Changes" : "Save Reflection"}
          </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
}
