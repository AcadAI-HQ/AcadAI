"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCatAvatar } from "@/lib/avatar";

interface ProfilePictureUploadProps {
  currentPhotoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  onUploadComplete?: (url: string) => void;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-32 w-32",
};

export function ProfilePictureUpload({
  displayName,
  email,
  size = "md",
}: ProfilePictureUploadProps) {
  const getInitials = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage
          src={getCatAvatar(email)}
          alt={displayName || "User"}
        />
        <AvatarFallback className="text-lg font-medium">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
