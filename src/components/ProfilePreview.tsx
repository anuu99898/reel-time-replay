
import React from "react";
import { User } from "@/data/videos";
import { formatCount } from "@/data/videos";
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
          className="w-12 h-12 rounded-full object-cover border-2 border-white"
        />
        <div className="absolute -bottom-1 -right-1 bg-tiktok-red rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold border border-white">
          +
        </div>
      </div>
      <div className="ml-3">
        <div className="flex items-center gap-1">
          <p className="font-bold text-white text-sm">@{user.username}</p>
          <span className="bg-tiktok-blue px-1 rounded text-[10px] text-white">
            Follow
          </span>
        </div>
        <p className="text-white text-opacity-90 text-xs truncate max-w-[150px]">
          {user.name}
        </p>
        <p className="text-white text-opacity-70 text-xs">
          <span className="font-semibold">{formatCount(user.followers)}</span> followers
        </p>
      </div>
    </div>
  );
};

export default ProfilePreview;
