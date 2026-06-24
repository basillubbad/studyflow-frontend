import * as React from "react";

import { UserProfile } from "@/types/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getAvatarColor } from "@/lib/utils/profile-utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  profile: Partial<UserProfile>;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ profile, className, fallbackClassName }: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  const name = profile.name || "Student";
  const initials = getInitials(name);
  const bgColor = getAvatarColor(profile.id || name);
  const hasValidUrl = !!profile.avatarUrl && profile.avatarUrl.trim() !== "";

  // Reset states when URL changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [profile.avatarUrl]);

  return (
    <Avatar className={cn(
      "border border-border shadow-sm flex items-center justify-center overflow-hidden", 
      !imageLoaded && !hasValidUrl ? bgColor : "bg-transparent",
      className
    )}>
      {hasValidUrl && !imageError && (
        <AvatarImage 
          src={profile.avatarUrl} 
          alt={name} 
          className={cn(
            "object-cover h-full w-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      
      {(!hasValidUrl || imageError || !imageLoaded) && (
        <AvatarFallback 
          className={cn(
            "text-white font-semibold tracking-wider flex items-center justify-center w-full h-full absolute inset-0", 
            bgColor,
            imageLoaded && "hidden", // Completely hide if image is loaded
            fallbackClassName
          )}
        >
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
