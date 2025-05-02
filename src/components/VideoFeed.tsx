
import React, { useState, useRef, useEffect } from "react";
import { Video as VideoType } from "@/data/videos";
import VideoPlayer from "./VideoPlayer";
import VideoActions from "./VideoActions";
import ProfilePreview from "./ProfilePreview";
import CommentSection from "./CommentSection";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";

interface VideoItemProps {
  video: VideoType;
  isActive: boolean;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, isActive }) => {
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={videoRef}
      className="snap-start w-full h-full flex items-center justify-center bg-black relative"
    >
      {/* Video player */}
      <VideoPlayer
        videoUrl={video.videoUrl}
        inView={isActive}
        className="absolute inset-0 w-full h-full"
      />

      {/* Video info - bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent z-10">
        <div className="flex">
          <div className="flex-1 pr-16">
            {/* User info */}
            <ProfilePreview user={video.user} className="mb-4" />
            
            {/* Caption */}
            <p className="text-white text-sm mb-2">{video.description}</p>
            
            {/* Audio info */}
            <div className="flex items-center">
              <Music size={16} className="text-white mr-2" />
              <p className="text-white text-sm">
                {video.audioName} · {video.audioCreator}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video actions - right side */}
      <div className="absolute bottom-20 right-2 z-10">
        <VideoActions
          likes={video.likes}
          comments={video.comments.length}
          shares={video.shares}
          onCommentClick={() => setShowComments(true)}
        />
      </div>

      {/* Comments modal */}
      {showComments && (
        <CommentSection
          comments={video.comments}
          onClose={() => setShowComments(false)}
          // In a real app, this would be the logged-in user
          currentUser={video.user} 
        />
      )}
    </div>
  );
};

interface VideoFeedProps {
  videos: VideoType[];
  className?: string;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, className }) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Detect which video is in view based on scroll position
  const handleScroll = () => {
    if (!feedRef.current) return;
    
    const scrollTop = feedRef.current.scrollTop;
    const videoHeight = feedRef.current.clientHeight;
    const index = Math.round(scrollTop / videoHeight);
    
    if (index !== activeVideoIndex) {
      setActiveVideoIndex(index);
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
  }, [activeVideoIndex]);

  return (
    <div 
      ref={feedRef}
      className={cn(
        "h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar",
        className
      )}
    >
      {videos.map((video, index) => (
        <VideoItem 
          key={video.id} 
          video={video} 
          isActive={index === activeVideoIndex} 
        />
      ))}
    </div>
  );
};

export default VideoFeed;
