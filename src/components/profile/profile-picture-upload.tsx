"use client";

import { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2 } from "lucide-react";

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

const buttonSizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function ProfilePictureUpload({
  currentPhotoURL,
  displayName,
  email,
  onUploadComplete,
  onRemove,
  size = "md",
}: ProfilePictureUploadProps) {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique filename
      const fileExtension = file.name.split(".").pop();
      const fileName = `profile-pictures/${user.uid}/avatar.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      // Upload the file
      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile with the new photo URL
      await updateUserProfile({ photoURL: downloadURL });

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been uploaded successfully.",
      });

      onUploadComplete?.(downloadURL);
    } catch (error: any) {
      console.error("Failed to upload profile picture:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!user?.uid || !currentPhotoURL) return;

    setIsRemoving(true);

    try {
      // Try to delete the old image from storage (ignore errors if file doesn't exist)
      try {
        const oldImageRef = ref(storage, `profile-pictures/${user.uid}/avatar`);
        await deleteObject(oldImageRef);
      } catch {
        // File might not exist, ignore
      }

      // Update user profile to remove photo URL
      await updateUserProfile({ photoURL: null });

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });

      onRemove?.();
    } catch (error: any) {
      console.error("Failed to remove profile picture:", error);
      toast({
        title: "Remove failed",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getFallbackUrl = () => {
    return `https://api.dicebear.com/8.x/adventurer/svg?seed=${email || "user"}`;
  };

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage
          src={currentPhotoURL || getFallbackUrl()}
          alt={displayName || "User"}
        />
        <AvatarFallback className="text-lg font-medium">
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || isRemoving}
      />

      <Button
        size="icon"
        variant="secondary"
        className={`absolute -bottom-1 -right-1 rounded-full shadow-md ${buttonSizeClasses[size]}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || isRemoving}
      >
        {isUploading ? (
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
        ) : (
          <Camera className={iconSizeClasses[size]} />
        )}
      </Button>

      {/* Remove Button (only show if there's a custom photo) */}
      {currentPhotoURL && (
        <Button
          size="icon"
          variant="destructive"
          className={`absolute -bottom-1 -left-1 rounded-full shadow-md ${buttonSizeClasses[size]}`}
          onClick={handleRemove}
          disabled={isUploading || isRemoving}
        >
          {isRemoving ? (
            <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
          ) : (
            <Trash2 className={iconSizeClasses[size]} />
          )}
        </Button>
      )}
    </div>
  );
}
