"use client";
import { useState } from "react";
import { LearningResource } from "@/types/self-learning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Play, Link, Plus, ExternalLink, Trash2, X } from "lucide-react";
import { generatePlanId } from "@/lib/self-learning/utils";

interface PlanResourcesPanelProps {
  resources: LearningResource[];
  onAddResource?: (resource: Omit<LearningResource, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onDeleteResource?: (id: string) => Promise<void>;
}

export function PlanResourcesPanel({ resources, onAddResource, onDeleteResource }: PlanResourcesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<LearningResource["type"]>("link");
  const [desc, setDesc] = useState("");

  const getIcon = (t: string) => {
    if (t === "file") return <FileText className="h-4 w-4" />;
    if (t === "note") return <FileText className="h-4 w-4" />;
    return <Link className="h-4 w-4" />;
  };

  const getColor = (t: string) => {
    if (t === "file") return "text-red-600 dark:text-red-400 bg-red-100/20 dark:bg-red-900/20";
    if (t === "note") return "text-amber-600 dark:text-amber-400 bg-amber-100/20 dark:bg-amber-900/20";
    return "text-blue-600 dark:text-blue-400 bg-blue-100/20 dark:bg-blue-900/20";
  };

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return;
    if (onAddResource) {
      await onAddResource({ title: title.trim(), url: url.trim(), type, description: desc.trim() || undefined });
    }
    setTitle(""); setUrl(""); setDesc(""); setType("link"); setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (onDeleteResource) {
      await onDeleteResource(id);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Resources</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(!showForm)} className="h-8 w-8 p-0">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="mb-4 p-4 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Title *</Label>
                <Input placeholder="e.g. Master React in 10 Days" value={title} onChange={e => setTitle(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">URL or Upload File *</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="h-9 text-sm flex-1" />
                  <div className="relative w-28">
                    <Input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUrl(reader.result as string);
                          setTitle(prev => prev || file.name);
                          setType("file");
                        };
                        reader.readAsDataURL(file);
                      }} 
                    />
                    <Button type="button" variant="outline" size="sm" className="w-full h-9">
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={type} onValueChange={(v: LearningResource["type"]) => setType(v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="file">File/PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input placeholder="Optional hints or notes..." value={desc} onChange={e => setDesc(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} disabled={!title.trim() || !url.trim()}>Save Resource</Button>
            </div>
          </div>
        )}

        {resources.length === 0 && !showForm ? (
          <div className="py-6 text-center text-muted-foreground">
            <p className="text-sm">No resources yet.</p>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(true)} className="mt-2 gap-1"><Plus className="h-3.5 w-3.5" />Add Resource</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors group">
                <div className={`p-2 rounded-lg shrink-0 ${getColor(r.type)}`}>{getIcon(r.type)}</div>
                <div className="flex-1 min-w-0">
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                    {r.title}<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </a>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>}
                </div>
                <button onClick={() => handleDelete(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
