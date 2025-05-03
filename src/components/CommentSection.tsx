import React, { useState } from "react";
import { Comment as CommentType, User, formatCount } from "@/data/ideas";
import { Heart, X, Send, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommentProps {
  comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
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
  onClose: () => void;
  currentUser?: User | null; // In a real app, this would be the logged-in user
  onCommentSubmit?: (text: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onClose,
  currentUser,
  onCommentSubmit,
}) => {
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // If we have an external handler, use it
    if (onCommentSubmit) {
      await onCommentSubmit(commentText);
      setCommentText("");
      setIsSubmitting(false);
      return;
    }
    
    // Otherwise handle locally (fallback for demo purposes)
    const newComment: CommentType = {
      id: `comment${Date.now()}`,
      user: currentUser,
      text: commentText,
      likes: 0,
      timestamp: "Just now",
    };

    setCommentsList([newComment, ...commentsList]);
    setCommentText("");
    setIsSubmitting(false);
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
              <Comment key={comment.id} comment={comment} />
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
