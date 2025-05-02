
import React, { useState, useRef, useEffect } from "react";
import { Idea } from "@/data/ideas";
import VideoPlayer from "./VideoPlayer";
import IdeaActions from "./IdeaActions";
import ProfilePreview from "./ProfilePreview";
import CommentSection from "./CommentSection";
import { cn } from "@/lib/utils";
import { Music, Lightbulb, Tag, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCount } from "@/data/ideas";

interface IdeaItemProps {
  idea: Idea;
  isActive: boolean;
}

const IdeaItem: React.FC<IdeaItemProps> = ({ idea, isActive }) => {
  const [showComments, setShowComments] = useState(false);
  const ideaRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ideaRef}
      className="snap-start w-full h-full flex items-center justify-center bg-black relative"
    >
      {/* Video or Card display based on idea type */}
      {idea.type === "video" ? (
        <VideoPlayer
          videoUrl={idea.videoUrl || ""}
          inView={isActive}
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center px-4 py-16 overflow-y-auto">
          <Card className="w-full max-w-md bg-black bg-opacity-80 border border-gray-800 shadow-lg">
            <CardContent className="p-0">
              {/* Image carousel */}
              {idea.images && idea.images.length > 0 && (
                <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
                  <img 
                    src={idea.images[0]} 
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
                
                {/* Ratings */}
                {idea.rating && (
                  <div className="bg-gray-900 p-3 rounded-lg mb-4">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                      <Star size={16} className="mr-1 text-yellow-400" />
                      Ratings
                    </h3>
                    <div className="flex justify-between text-xs">
                      <div>
                        <div className="text-white">Practicality</div>
                        <div className="text-tiktok-red font-bold">{idea.rating.practicality}/10</div>
                      </div>
                      <div>
                        <div className="text-white">Innovation</div>
                        <div className="text-tiktok-blue font-bold">{idea.rating.innovation}/10</div>
                      </div>
                      <div>
                        <div className="text-white">Impact</div>
                        <div className="text-green-400 font-bold">{idea.rating.impact}/10</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-center mb-2">
                  <Lightbulb size={16} className="text-yellow-400 mr-2" />
                  <p className="text-white text-sm">
                    {idea.category}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Idea info - bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent z-10">
        <div className="flex">
          <div className="flex-1 pr-16">
            {/* User info */}
            <ProfilePreview user={idea.user} className="mb-4" />
            
            {/* Title & Description */}
            <h3 className="text-white text-lg font-bold mb-1">{idea.title}</h3>
            <p className="text-white text-sm mb-2">{idea.description}</p>
            
            {/* Category/Audio info */}
            <div className="flex items-center">
              {idea.type === "video" ? (
                <Music size={16} className="text-white mr-2" />
              ) : (
                <Lightbulb size={16} className="text-yellow-400 mr-2" />
              )}
              <p className="text-white text-sm">
                {idea.category} • {formatCount(idea.likes)} evaluations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Idea actions - right side */}
      <div className="absolute bottom-20 right-2 z-10">
        <IdeaActions
          likes={idea.likes}
          comments={idea.comments.length}
          shares={idea.shares}
          onCommentClick={() => setShowComments(true)}
          rating={idea.rating}
        />
      </div>

      {/* Comments modal */}
      {showComments && (
        <CommentSection
          comments={idea.comments}
          onClose={() => setShowComments(false)}
          currentUser={idea.user} // In a real app, this would be the logged-in user
        />
      )}
    </div>
  );
};

interface IdeaFeedProps {
  ideas: Idea[];
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
    
    if (index !== activeIdeaIndex) {
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
