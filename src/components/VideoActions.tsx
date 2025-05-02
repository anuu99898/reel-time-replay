
import React, { useState } from "react";
import { Heart, MessageSquare, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount } from "@/data/videos";

interface VideoActionsProps {
  likes: number;
  comments: number;
  shares: number;
  onCommentClick: () => void;
}

const VideoActions: React.FC<VideoActionsProps> = ({
  likes: initialLikes,
  comments,
  shares,
  onCommentClick,
}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleLikeClick = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleShareClick = () => {
    // In a real app, this would open a share dialog
    alert("Share functionality would open here!");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Like button */}
      <button
        onClick={handleLikeClick}
        className="flex flex-col items-center"
      >
        <div
          className={cn(
            "w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center",
            liked && "animate-pulse-scale"
          )}
        >
          <Heart
            size={28}
            className={cn(
              "transition-colors",
              liked ? "text-tiktok-red fill-tiktok-red" : "text-white"
            )}
          />
        </div>
        <span className="text-white text-xs font-semibold mt-1">
          {formatCount(likes)}
        </span>
      </button>

      {/* Comments button */}
      <button
        onClick={onCommentClick}
        className="flex flex-col items-center"
      >
        <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
          <MessageSquare size={24} className="text-white" />
        </div>
        <span className="text-white text-xs font-semibold mt-1">
          {formatCount(comments)}
        </span>
      </button>

      {/* Share button */}
      <button
        onClick={handleShareClick}
        className="flex flex-col items-center"
      >
        <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
          <Share size={24} className="text-white" />
        </div>
        <span className="text-white text-xs font-semibold mt-1">
          {formatCount(shares)}
        </span>
      </button>
    </div>
  );
};

export default VideoActions;
