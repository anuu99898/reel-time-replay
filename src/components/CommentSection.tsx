import React, { useState } from "react";
import { Comment as CommentType, User, formatCount } from "@/data/ideas";
import { Heart, X, Send, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";

interface CommentProps {
  comment: CommentType;
  onLike: (commentId: string, isLiked: boolean) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like comments");
      return;
    }
    
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
    onLike(comment.id, !liked);
  };

  return (
    <div className="flex gap-2 py-3">
      <img
        src={comment.user.avatar}
        alt={comment.user.username}
        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
      />
      <div className="flex-1">
        <div className="flex flex-col">
          <span className="font-semibold text-sm">@{comment.user.username}</span>
          <p className="text-sm mt-0.5">{comment.text}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">{comment.timestamp}</span>
            <button className="text-xs text-gray-400">Reply</button>
          </div>
        </div>
      </div>
      <button
        onClick={handleLike}
        className="flex flex-col items-center justify-start gap-1"
      >
        <Lightbulb
          size={16}
          className={cn(
            "transition-colors",
            liked ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
          )}
        />
        <span className="text-xs text-gray-400">{formatCount(likes)}</span>
      </button>
    </div>
  );
};

interface CommentSectionProps {
  comments: CommentType[];
  ideaId: string;
  onClose: () => void;
  currentUser?: User | null;
  onCommentSubmit?: (text: string) => Promise<void>;
  fetchComments?: () => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  ideaId,
  onClose,
  currentUser,
  onCommentSubmit,
  fetchComments,
}) => {
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return;
    
    try {
      // In a real app, we would update the comment likes in the database
      // For now, we'll just update the local state
      toast.success(isLiked ? "Comment liked!" : "Comment unliked");
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Failed to update like");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // If we have an external handler, use it
      if (onCommentSubmit) {
        await onCommentSubmit(commentText);
        setCommentText("");
        
        // Refresh comments list if we have a fetch function
        if (fetchComments) {
          await fetchComments();
        }
        
        setIsSubmitting(false);
        return;
      }
      
      // Otherwise handle locally (add to database directly)
      const { data, error } = await supabase
        .from('comments')
        .insert({
          idea_id: ideaId,
          user_id: user?.id,
          text: commentText
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Create a new comment object
      const newComment: CommentType = {
        id: data.id,
        user: currentUser,
        text: commentText,
        likes: 0,
        timestamp: "Just now",
      };

      setCommentsList([newComment, ...commentsList]);
      setCommentText("");
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-50">
      <div className="flex-1" onClick={onClose}></div>
      <div className="bg-black dark:bg-gray-900 rounded-t-2xl h-[70vh] flex flex-col animate-slide-up border-t border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-lg">
            {commentsList.length} feedback{commentsList.length !== 1 ? "s" : ""}
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4">
          {commentsList.length > 0 ? (
            commentsList.map((comment) => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                onLike={handleLikeComment}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="p-4 border-t border-gray-800 flex items-center gap-2">
          {currentUser ? (
            <>
              <input
                type="text"
                className="flex-1 p-2 border border-gray-700 rounded-full bg-transparent text-white"
                placeholder="Share your thoughts on this idea..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmitting}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    handleSubmitComment();
                  }
                }}
              />
              <Button 
                onClick={handleSubmitComment}
                size="icon"
                variant="ghost"
                disabled={!commentText.trim() || isSubmitting}
              >
                <Send size={20} className={commentText.trim() ? "text-yellow-400" : ""} />
              </Button>
            </>
          ) : (
            <div className="w-full text-center text-gray-400">
              Please login to comment
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
