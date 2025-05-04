
import React from "react";
import { User } from "@/data/videos";
import { cn } from "@/lib/utils";

interface ProfilePreviewProps {
  user: User;
  className?: string;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ user, className }) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
        />
      </div>
      <div className="ml-3">
        <p className="font-bold text-white text-sm">@{user.username}</p>
      </div>
    </div>
  );
};

export default ProfilePreview;
