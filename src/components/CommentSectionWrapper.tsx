
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
}

const CommentSectionWrapper: React.FC<CommentSectionWrapperProps & { ideaId?: string }> = (props) => {
  // Make sure ideaId is always provided
  const enhancedProps = {
    ...props,
    ideaId: props.ideaId || "default-idea-id"
  };
  
  return <CommentSection {...enhancedProps} />;
};

export default CommentSectionWrapper;
