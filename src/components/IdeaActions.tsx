
import React, { useState } from "react";
import { Heart, MessageSquare, Share, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount } from "@/data/ideas";

interface IdeaActionsProps {
  likes: number;
  comments: number;
  shares: number;
  onCommentClick: () => void;
  rating?: {
    practicality: number;
    innovation: number;
    impact: number;
  };
}

const IdeaActions: React.FC<IdeaActionsProps> = ({
  likes: initialLikes,
  comments,
  shares,
  onCommentClick,
  rating,
}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const handleLikeClick = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleVote = (direction: 'up' | 'down') => {
    if (voted === direction) {
      setVoted(null);
    } else {
      setVoted(direction);
    }
  };

  const handleShareClick = () => {
    // In a real app, this would open a share dialog
    alert("Share functionality would open here!");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Light bulb (replaced heart) */}
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
          <Lightbulb
            size={20}
            className={cn(
              "transition-colors",
              liked ? "text-yellow-400 fill-yellow-400" : "text-white"
            )}
          />
        </div>
        <span className="text-white text-xs font-semibold mt-1">
          {formatCount(likes)}
        </span>
      </button>

      {/* Thumbs up */}
      <button
        onClick={() => handleVote('up')}
        className="flex flex-col items-center"
      >
        <div
          className={cn(
            "w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center",
            voted === 'up' && "animate-pulse-scale"
          )}
        >
          <ThumbsUp
            size={20}
            className={cn(
              "transition-colors",
              voted === 'up' ? "text-green-500 fill-green-500" : "text-white"
            )}
          />
        </div>
        <span className="text-white text-xs font-semibold mt-1">
          Promising
        </span>
      </button>

      {/* Thumbs down */}
      <button
        onClick={() => handleVote('down')}
        className="flex flex-col items-center"
      >
        <div
          className={cn(
            "w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center",
            voted === 'down' && "animate-pulse-scale"
          )}
        >
          <ThumbsDown
            size={20}
            className={cn(
              "transition-colors",
              voted === 'down' ? "text-red-500 fill-red-500" : "text-white"
            )}
          />
        </div>
        <span className="text-white text-xs font-semibold mt-1">
          Needs work
        </span>
      </button>

      {/* Comments button */}
      <button
        onClick={onCommentClick}
        className="flex flex-col items-center"
      >
        <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
          <MessageSquare size={20} className="text-white" />
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
          <Share size={20} className="text-white" />
        </div>
        <span className="text-white text-xs font-semibold mt-1">
          {formatCount(shares)}
        </span>
      </button>
    </div>
  );
};

export default IdeaActions;
