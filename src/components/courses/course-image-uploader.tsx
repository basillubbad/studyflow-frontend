"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { validateImageFile, fileToBase64 } from "@/lib/image-crop-utils";
import Image from "next/image";

interface CourseImageUploaderProps {
  onImageSelect: (base64: string) => void;
  currentImage?: string;
  disabled?: boolean;
}

export function CourseImageUploader({
  onImageSelect,
  currentImage,
  disabled = false,
}: CourseImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setPreview(null);
      return;
    }

    try {
      setError(null);
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onImageSelect(base64);
    } catch {
      setError("Failed to process image. Please try again.");
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Course Image</Label>
      <div className="space-y-3">
        {preview && (
          <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Course preview"
              fill
              className="object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
          <Input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={disabled}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, or WebP up to 5MB
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <p className="text-xs text-muted-foreground">
          Recommended aspect ratio: 3:2 for best display on course cards
        </p>
      </div>
    </div>
  );
}
