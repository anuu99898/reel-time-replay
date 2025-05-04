
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/components/ui/sonner";

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
        const { data: likeData } = await supabase
          .from('idea_interactions')
          .select('*')
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
          .eq('interaction_type', 'like')
          .single();
          
        if (likeData) {
          setLiked(true);
        }
        
        const { data: voteData } = await supabase
          .from('idea_interactions')
          .select('*')
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
          .in('interaction_type', ['vote_up', 'vote_down'])
          .single();
          
        if (voteData) {
          setVoted(voteData.interaction_type === 'vote_up' ? 'up' : 'down');
        }
      } catch (error) {
        // No interactions found or error, which is fine
        console.log('No previous interactions found');
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
      if (liked) {
        // Unlike the idea
        await supabase
          .from('idea_interactions')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
          .eq('interaction_type', 'like');
          
        // Update likes count in ideas table
        await supabase
          .rpc('decrement_likes', { idea_id: ideaId });
          
        setLikes(likes - 1);
        setLiked(false);
        toast.success("Idea unliked");
      } else {
        // Like the idea
        await supabase
          .from('idea_interactions')
          .insert({
            idea_id: ideaId,
            user_id: user.id,
            interaction_type: 'like'
          });
          
        // Update likes count in ideas table
        await supabase
          .rpc('increment_likes', { idea_id: ideaId });
          
        setLikes(likes + 1);
        setLiked(true);
        toast.success("Idea liked!");
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
      if (voted === direction) {
        // Remove vote
        await supabase
          .from('idea_interactions')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
          .eq('interaction_type', direction === 'up' ? 'vote_up' : 'vote_down');
          
        setVoted(null);
        toast.success("Vote removed");
      } else {
        // First remove any existing votes
        if (voted) {
          await supabase
            .from('idea_interactions')
            .delete()
            .eq('idea_id', ideaId)
            .eq('user_id', user.id)
            .in('interaction_type', ['vote_up', 'vote_down']);
        }
        
        // Add new vote
        await supabase
          .from('idea_interactions')
          .insert({
            idea_id: ideaId,
            user_id: user.id,
            interaction_type: direction === 'up' ? 'vote_up' : 'vote_down'
          });
          
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

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check this idea!',
        url: window.location.href,
      }).then(() => {
        // Update share count
        if (user) {
          supabase
            .rpc('increment_shares', { idea_id: ideaId })
            .then(() => {
              toast.success("Successfully shared!");
            });
        }
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      
      // Update share count
      if (user) {
        supabase
          .rpc('increment_shares', { idea_id: ideaId })
          .then(() => {
            toast.success("Link copied to clipboard!");
          });
      } else {
        toast.success("Link copied to clipboard!");
      }
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
