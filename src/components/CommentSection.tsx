
import React, { useState } from "react";
import { Comment as CommentType, User, formatCount } from "@/data/videos";
import { Heart, X, Send } from "lucide-react";
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
        <Heart
          size={16}
          className={cn(
            "transition-colors",
            liked ? "text-tiktok-red fill-tiktok-red" : "text-gray-400"
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
  currentUser?: User; // In a real app, this would be the logged-in user
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onClose,
  currentUser,
}) => {
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState(comments);

  const handleSubmitComment = () => {
    if (!commentText.trim() || !currentUser) return;

    // In a real app, this would send a request to the backend
    const newComment: CommentType = {
      id: `comment${Date.now()}`,
      user: currentUser,
      text: commentText,
      likes: 0,
      timestamp: "Just now",
    };

    setCommentsList([newComment, ...commentsList]);
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-50">
      <div className="flex-1" onClick={onClose}></div>
      <div className="bg-white dark:bg-tiktok-dark rounded-t-2xl h-[70vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-lg">
            {commentsList.length} comments
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4">
          {commentsList.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>

        {/* Comment input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-full bg-transparent dark:text-white"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button 
            onClick={handleSubmitComment}
            size="icon"
            variant="ghost"
            disabled={!commentText.trim()}
          >
            <Send size={20} className={commentText.trim() ? "text-tiktok-red" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
