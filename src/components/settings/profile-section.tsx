import { useState } from "react";
import { UserProfile } from "@/types/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, School, BookOpen, Camera } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";

interface ProfileSectionProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

export function ProfileSection({ profile, onUpdate }: ProfileSectionProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl || null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        onUpdate({ avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal details and how others see you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b">
          <div className="relative group">
            <UserAvatar 
              profile={{ ...profile, avatarUrl: avatarPreview || profile.avatarUrl }} 
              className="h-24 w-24 border-2 border-primary/10"
              fallbackClassName="text-2xl"
            />
            <Label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-6 w-6" />
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-semibold">{profile.name || "Your Name"}</h3>
            <p className="text-sm text-muted-foreground">{profile.major || "No major set"}</p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                Change Avatar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="pl-9"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <div className="relative">
              <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="university"
                value={profile.university}
                onChange={(e) => onUpdate({ university: e.target.value })}
                className="pl-9"
                placeholder="Enter your university"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Major / Field of Study</Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="major"
                value={profile.major}
                onChange={(e) => onUpdate({ major: e.target.value })}
                className="pl-9"
                placeholder="Enter your major"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
