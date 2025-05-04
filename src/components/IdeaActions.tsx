
import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  MessageSquare,
  Share,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount } from "@/data/ideas";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/components/ui/sonner";
import { 
  likeIdea, 
  voteOnIdea, 
  incrementShares,
  hasUserLikedIdea,
  getUserVoteOnIdea
} from "@/integrations/supabase/database";

interface Rating {
  practicality: number;
  innovation: number;
  impact: number;
}

interface IdeaActionsProps {
  ideaId: string;
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
  disabled = false,
}: {
  onClick: () => void;
  active: boolean;
  icon: React.ElementType;
  label: string;
  activeClass: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={cn(
      "flex flex-col items-center group",
      disabled && "opacity-60 cursor-not-allowed"
    )}
    disabled={disabled}
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
  ideaId,
  likes: initialLikes,
  comments,
  shares,
  onCommentClick,
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if user has already liked this idea
    const checkUserInteractions = async () => {
      if (!user) return;
      
      try {
        // Check like status
        const userLiked = await hasUserLikedIdea(ideaId, user.id);
        setLiked(userLiked);
        
        // Check vote status
        const voteType = await getUserVoteOnIdea(ideaId, user.id);
        setVoted(voteType);
      } catch (error) {
        console.error("Error checking user interactions:", error);
      }
    };
    
    checkUserInteractions();
  }, [ideaId, user]);

  const handleLikeClick = async () => {
    if (isLoading || !user) {
      if (!user) toast.error("Please login to like ideas");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const isNowLiked = await likeIdea(ideaId, user.id);
      
      if (isNowLiked) {
        setLikes(likes + 1);
        setLiked(true);
        toast.success("Idea liked!");
      } else {
        setLikes(Math.max(0, likes - 1));
        setLiked(false);
        toast.success("Idea unliked");
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (direction: 'up' | 'down') => {
    if (isLoading || !user) {
      if (!user) toast.error("Please login to vote");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newVoteType = await voteOnIdea(ideaId, user.id, direction);
      
      // Update UI based on returned vote state
      if (newVoteType === null) {
        setVoted(null);
        toast.success("Vote removed");
      } else {
        setVoted(direction);
        toast.success(direction === 'up' ? "Marked as promising" : "Marked as needs work");
      }
    } catch (error) {
      console.error("Error updating vote:", error);
      toast.error("Failed to update vote");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = async () => {
    // Native share if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check this idea!',
          url: window.location.href,
        });
        
        // Update share count if successful
        if (user) {
          await incrementShares(ideaId);
          toast.success("Successfully shared!");
        }
      } catch (error) {
        console.error("Share failed:", error);
        // Fallback to clipboard if sharing was cancelled
        handleClipboardShare();
      }
    } else {
      // Fallback to clipboard
      handleClipboardShare();
    }
  };
  
  const handleClipboardShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      
      // Update share count
      if (user) {
        await incrementShares(ideaId);
      }
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy link");
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
        disabled={isLoading}
      />

      <IconButton
        onClick={() => handleVote('up')}
        active={voted === 'up'}
        icon={ThumbsUp}
        label="Promising"
        activeClass="text-green-500 fill-green-500"
        disabled={isLoading}
      />

      <IconButton
        onClick={() => handleVote('down')}
        active={voted === 'down'}
        icon={ThumbsDown}
        label="Needs work"
        activeClass="text-red-500 fill-red-500"
        disabled={isLoading}
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
