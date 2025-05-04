
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Video as VideoType } from "@/data/videos";
import VideoPlayer from "./VideoPlayer";
import VideoActions from "./VideoActions";
import ProfilePreview from "./ProfilePreview";
import CommentSectionWrapper from "./CommentSectionWrapper";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";

interface VideoItemProps {
  video: VideoType;
  isActive: boolean;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, isActive }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="snap-start w-full h-screen flex flex-col justify-end bg-black relative overflow-hidden">
      <VideoPlayer
        videoUrl={video.videoUrl}
        inView={isActive}
        className="absolute inset-0 w-full h-full object-cover"
        preload="auto"
      />

      <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <ProfilePreview user={video.user} className="mb-2" />
        <p className="text-white text-sm mb-2 break-words whitespace-pre-wrap">
          {video.description}
        </p>
        <div className="flex items-center text-white text-sm truncate">
          <Music size={16} className="mr-2" />
          {video.audioName} · {video.audioCreator}
        </div>
      </div>

      <div className="absolute right-4 bottom-24 z-10">
        <VideoActions
          likes={video.likes}
          comments={video.comments.length}
          shares={video.shares}
          onCommentClick={() => setShowComments(true)}
        />
      </div>

      {showComments && (
        <CommentSectionWrapper
          ideaId={video.id}
          comments={video.comments}
          onClose={() => setShowComments(false)}
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

  // Improved scroll handling with debounce
  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      if (!feedRef.current) return;
      
      const scrollTop = feedRef.current.scrollTop;
      const height = feedRef.current.clientHeight;
      const index = Math.round(scrollTop / height);
      
      if (index !== activeVideoIndex && index >= 0 && index < videos.length) {
        setActiveVideoIndex(index);
      }
    });
  }, [activeVideoIndex, videos.length]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    
    // Ensure proper initial alignment on component mount
    const initialScroll = () => {
      const height = feed.clientHeight;
      feed.scrollTo({
        top: activeVideoIndex * height,
        behavior: "auto"
      });
    };
    
    // Run initial alignment after a small delay to ensure DOM is ready
    const timer = setTimeout(initialScroll, 100);
    
    feed.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      feed.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, activeVideoIndex]);

  // Improved swipe gesture handling
  const handleSwipe = useCallback((e: React.TouchEvent) => {
    if (!feedRef.current) return;
    const touchStart = e.touches[0].clientY;
    
    const handleTouchEnd = (event: TouchEvent) => {
      const touchEnd = event.changedTouches[0].clientY;
      const swipeThreshold = 50; // Increased threshold for better detection
      
      if (touchStart - touchEnd > swipeThreshold) {
        // Swipe up: move to next video
        if (activeVideoIndex < videos.length - 1) {
          const nextIndex = activeVideoIndex + 1;
          setActiveVideoIndex(nextIndex);
          
          // Smooth scroll to next video
          feedRef.current?.scrollTo({
            top: nextIndex * feedRef.current.clientHeight,
            behavior: "smooth"
          });
        }
      } else if (touchEnd - touchStart > swipeThreshold) {
        // Swipe down: move to previous video
        if (activeVideoIndex > 0) {
          const prevIndex = activeVideoIndex - 1;
          setActiveVideoIndex(prevIndex);
          
          // Smooth scroll to previous video
          feedRef.current?.scrollTo({
            top: prevIndex * feedRef.current.clientHeight,
            behavior: "smooth"
          });
        }
      }
      
      // Remove the event listener
      document.removeEventListener("touchend", handleTouchEnd);
    };

    // Add the event listener using document to capture all touch events
    document.addEventListener("touchend", handleTouchEnd);
  }, [activeVideoIndex, videos.length]);

  return (
    <div
      ref={feedRef}
      className={cn(
        "h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar scroll-smooth",
        className
      )}
      onTouchStart={handleSwipe}
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
