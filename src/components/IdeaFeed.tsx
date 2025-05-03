
import React, { useState, useRef, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import IdeaActions from "./IdeaActions";
import ProfilePreview from "./ProfilePreview";
import CommentSection from "./CommentSection";
import { cn } from "@/lib/utils";
import { Tag, Star, MessageSquare, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCount } from "@/data/ideas";
import { useNavigate } from "react-router-dom";
import { IdeaProps } from "@/types/idea";
import { useIsMobile } from "@/hooks/use-mobile";

interface IdeaItemProps {
  idea: IdeaProps;
  isActive: boolean;
}

const IdeaItem: React.FC<IdeaItemProps> = ({ idea, isActive }) => {
  const [showComments, setShowComments] = useState(false);
  const ideaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleIdeaClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements
    if (
      e.target instanceof HTMLButtonElement ||
      (e.target instanceof HTMLElement && 
       (e.target.closest('button') || 
        e.target.closest('.no-navigate')))
    ) {
      return;
    }
    navigate(`/idea/${idea.id}`);
  };

  // Check if this is a problem-based submission
  const hasProblem = idea.questions && idea.questions.length > 0;

  return (
    <div
      ref={ideaRef}
      className="snap-start w-full h-full flex items-center justify-center bg-black relative"
    >
      {/* Video or Card display based on idea type */}
      <div 
        className="absolute inset-0 w-full h-full cursor-pointer" 
        onClick={handleIdeaClick}
      >
        {idea.type === "video" ? (
          <VideoPlayer
            videoUrl={idea.media || ""}
            inView={isActive}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center px-4 py-16 overflow-y-auto">
            <Card className="w-full max-w-md bg-black bg-opacity-80 border border-gray-800 shadow-lg">
              <CardContent className="p-0">
                {/* Image for card type idea */}
                {idea.thumbnailUrl && (
                  <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
                    <img 
                      src={idea.thumbnailUrl} 
                      alt={idea.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Idea content */}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-white mb-2">{idea.title}</h2>
                  <p className="text-white text-opacity-90 mb-4">{idea.description}</p>
                  
                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {idea.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-xs text-white rounded-full flex items-center"
                        >
                          <Tag size={12} className="mr-1" />
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Questions */}
                  {idea.comments && idea.comments.length > 0 && (
                    <div className="bg-gray-900 p-3 rounded-lg mb-4">
                      <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                        <MessageSquare size={16} className="mr-1 text-yellow-400" />
                        Discussion ({idea.comments.length})
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Join the conversation and provide feedback
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Problem indicator - top overlay */}
      {hasProblem && (
        <div className="absolute top-4 left-4 z-30">
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full flex items-center shadow-lg">
            <AlertTriangle size={16} className="mr-1" />
            <span className="font-medium">Problem needs solutions</span>
          </div>
        </div>
      )}

      {/* Idea info - bottom overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent z-10",
        isMobile ? "pt-20" : "pt-16"  // Extra padding to ensure content is visible on mobile
      )} onClick={handleIdeaClick}>
        <div className="flex flex-col">
          {/* User info */}
          <ProfilePreview user={idea.user} className="mb-3" />
          
          {/* Title & Description */}
          <div className="pr-16">
            <h3 className="text-white text-lg font-bold mb-1">{idea.title}</h3>
            <p className="text-white text-sm mb-2 line-clamp-2">{idea.description}</p>
            
            {/* Tags info */}
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {idea.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-sm text-gray-300">#{tag} </span>
                ))}
                {idea.tags.length > 3 && (
                  <span className="text-sm text-gray-500">+{idea.tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Idea actions - right side */}
      <div className="absolute bottom-20 right-2 z-10 no-navigate">
        <IdeaActions
          likes={idea.likes}
          comments={idea.comments.length}
          shares={idea.shares}
          onCommentClick={() => setShowComments(true)}
          rating={idea.ratings}
        />
      </div>

      {/* Comments modal */}
      {showComments && (
        <CommentSection
          comments={idea.comments}
          onClose={() => setShowComments(false)}
          currentUser={null} // In a real app, this would be the logged-in user
        />
      )}
    </div>
  );
};

interface IdeaFeedProps {
  ideas: IdeaProps[];
  className?: string;
}

const IdeaFeed: React.FC<IdeaFeedProps> = ({ ideas, className }) => {
  const [activeIdeaIndex, setActiveIdeaIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Detect which idea is in view based on scroll position
  const handleScroll = () => {
    if (!feedRef.current) return;
    
    const scrollTop = feedRef.current.scrollTop;
    const ideaHeight = feedRef.current.clientHeight;
    const index = Math.round(scrollTop / ideaHeight);
    
    if (index !== activeIdeaIndex && index < ideas.length) {
      setActiveIdeaIndex(index);
    }
  };

  useEffect(() => {
    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener("scroll", handleScroll);
      return () => {
        feedElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [activeIdeaIndex]);

  return (
    <div 
      ref={feedRef}
      className={cn(
        "h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar",
        className
      )}
    >
      {ideas.map((idea, index) => (
        <IdeaItem 
          key={idea.id} 
          idea={idea} 
          isActive={index === activeIdeaIndex} 
        />
      ))}
    </div>
  );
};

export default IdeaFeed;
