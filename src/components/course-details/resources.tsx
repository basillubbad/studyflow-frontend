"use client";

import { Resource } from "@/types/course";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Play, Link, Plus, ExternalLink, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ResourcesProps {
  resources?: Resource[];
  onAddResource?: (resource: Omit<Resource, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onDeleteResource?: (id: string) => Promise<void>;
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Resources({ resources = [], onAddResource, onDeleteResource }: ResourcesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<Resource["type"]>("link");
  const [newDesc, setNewDesc] = useState("");

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "file":     return <FileText className="h-4 w-4" />;
      case "image":    return <FileText className="h-4 w-4" />; // Or an image icon
      default:         return <Link className="h-4 w-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "file":     return "text-amber-600 dark:text-amber-400 bg-amber-100/20 dark:bg-amber-900/20";
      case "link":     return "text-blue-600 dark:text-blue-400 bg-blue-100/20 dark:bg-blue-900/20";
      case "image":    return "text-teal-600 dark:text-teal-400 bg-teal-100/20 dark:bg-teal-900/20";
      default:         return "text-slate-600 dark:text-slate-400 bg-slate-100/20 dark:bg-slate-900/20";
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    
    if (onAddResource) {
      await onAddResource({
        title: newTitle.trim(),
        url: newUrl.trim(),
        type: newType,
        description: newDesc.trim() || undefined
      });
    }
    
    setNewTitle(""); setNewUrl(""); setNewDesc(""); setNewType("link");
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (onDeleteResource) {
      await onDeleteResource(id);
    }
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Course Resources</h3>
        <Button
          size="sm" variant="ghost"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1 h-auto p-1.5"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Add Resource Form */}
      {showAddForm && (
        <div className="mb-4 p-4 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Title *</Label>
              <Input placeholder="e.g. Lecture Slides Week 3" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">URL or Upload File *</Label>
              <div className="flex gap-2">
                <Input placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)} className="h-9 text-sm flex-1" />
                <div className="relative w-28">
                  <Input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewUrl(reader.result as string);
                        setNewTitle(prev => prev || file.name);
                        const ft = file.type;
                        if (ft.includes('image')) setNewType('image');
                        else setNewType('file');
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
              <Select value={newType} onValueChange={(v: Resource["type"]) => setNewType(v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="file">File/PDF/Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input placeholder="Optional" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim() || !newUrl.trim()}>Add Resource</Button>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No resources added yet</p>
          <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />Add Resource
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 group">
              <div className={`p-2 rounded-md shrink-0 ${getResourceColor(resource.type)}`}>
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={resource.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:underline line-clamp-2 flex items-center gap-1"
                >
                  {resource.title}
                  <ExternalLink className="h-3 w-3 inline shrink-0 text-slate-400" />
                </a>
                {resource.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{resource.description}</p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide">{resource.type}</p>
              </div>
              {onDeleteResource && (
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 shrink-0 mt-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)} className="w-full gap-2">
            <Plus className="h-4 w-4" />Add Another Resource
          </Button>
        </div>
      )}
    </Card>
  );
}
