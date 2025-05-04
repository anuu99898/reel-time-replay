
import React from "react";
import CommentSection from "@/components/CommentSection";

interface CommentSectionWrapperProps {
  comments: any[];
  onClose: () => void;
  currentUser: {
    id: string;
    username: string;
    avatar: string;
    name: string;
    followers: number;
    following: number;
    bio: string;
  } | null;
  onCommentSubmit?: (text: string) => Promise<any>;
  fetchComments?: () => Promise<void>;
  ideaId: string; // Make ideaId required
}

const CommentSectionWrapper: React.FC<CommentSectionWrapperProps> = (props) => {
  return <CommentSection {...props} />;
};

export default CommentSectionWrapper;
