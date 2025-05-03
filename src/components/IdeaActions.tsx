import React, { useState } from "react";
import {
  Lightbulb,
  MessageSquare,
  Share,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount } from "@/data/ideas";

interface Rating {
  practicality: number;
  innovation: number;
  impact: number;
}

interface IdeaActionsProps {
  likes: number;
  comments: number;
  shares: number;
  onCommentClick: () => void;
  rating?: Rating;
}

const IconButton = ({
  onClick,
  active,
  icon: Icon,
  label,
  activeClass,
}: {
  onClick: () => void;
  active: boolean;
  icon: React.ElementType;
  label: string;
  activeClass: string;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex flex-col items-center group"
  >
    <div
      className={cn(
        "w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center transition-transform duration-200",
        active && activeClass,
        active && "scale-110"
      )}
    >
      <Icon
        size={20}
        className={cn(
          "transition-colors",
          active ? activeClass : "text-white"
        )}
      />
    </div>
    <span className="text-white text-xs font-semibold mt-1">
      {label}
    </span>
  </button>
);

const IdeaActions: React.FC<IdeaActionsProps> = ({
  likes: initialLikes,
  comments,
  shares,
  onCommentClick,
}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const handleLikeClick = () => {
    setLiked((prev) => {
      setLikes((count) => count + (prev ? -1 : 1));
      return !prev;
    });
  };

  const handleVote = (direction: 'up' | 'down') => {
    setVoted((prev) => (prev === direction ? null : direction));
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check this idea!',
        url: window.location.href,
      });
    } else {
      alert("Share functionality would open here!");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <IconButton
        onClick={handleLikeClick}
        active={liked}
        icon={Lightbulb}
        label={formatCount(likes)}
        activeClass="text-yellow-400 fill-yellow-400"
      />

      <IconButton
        onClick={() => handleVote('up')}
        active={voted === 'up'}
        icon={ThumbsUp}
        label="Promising"
        activeClass="text-green-500 fill-green-500"
      />

      <IconButton
        onClick={() => handleVote('down')}
        active={voted === 'down'}
        icon={ThumbsDown}
        label="Needs work"
        activeClass="text-red-500 fill-red-500"
      />

      <IconButton
        onClick={onCommentClick}
        active={false}
        icon={MessageSquare}
        label={formatCount(comments)}
        activeClass=""
      />

      <IconButton
        onClick={handleShareClick}
        active={false}
        icon={Share}
        label={formatCount(shares)}
        activeClass=""
      />
    </div>
  );
};

export default IdeaActions;
