
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
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset video container height when orientation or screen size changes
    const handleResize = () => {
      if (videoRef.current) {
        videoRef.current.style.height = `${window.innerHeight}px`;
      }
    };
    
    handleResize(); // Set initial height
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={videoRef}
      className="snap-start w-full h-screen flex flex-col justify-end bg-black relative overflow-hidden"
    >
      <VideoPlayer
        videoUrl={video.videoUrl}
        inView={isActive}
        className="absolute inset-0 w-full h-full object-cover"
        preload={isActive ? "auto" : "metadata"}
      />

      <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <ProfilePreview user={video.user} className="mb-2" />
        <p className="text-white text-sm mb-2 break-words whitespace-pre-wrap">
          {video.description}
        </p>
        <div className="flex items-center text-white text-sm truncate">
          <Music size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">
            {video.audioName} · {video.audioCreator}
          </span>
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
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset feed height when window size changes
  useEffect(() => {
    const handleResize = () => {
      if (feedRef.current) {
        // Force height update on resize to ensure proper snap points
        const targetIndex = activeVideoIndex;
        setTimeout(() => {
          if (feedRef.current) {
            feedRef.current.scrollTo({
              top: targetIndex * window.innerHeight,
              behavior: "auto"
            });
          }
        }, 50);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeVideoIndex]);

  // Improved scroll handling with debounce and precision
  const handleScroll = useCallback(() => {
    if (!feedRef.current || isScrolling) return;
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      if (!feedRef.current) return;
      
      const scrollTop = feedRef.current.scrollTop;
      const height = window.innerHeight;
      const index = Math.round(scrollTop / height);
      
      if (index !== activeVideoIndex && index >= 0 && index < videos.length) {
        setActiveVideoIndex(index);
        
        // After setting active index, snap to the correct position
        scrollTimeoutRef.current = setTimeout(() => {
          if (feedRef.current) {
            feedRef.current.scrollTo({
              top: index * height,
              behavior: "smooth"
            });
            
            setTimeout(() => {
              setIsScrolling(false);
            }, 200);
          }
        }, 50);
      }
    });
  }, [activeVideoIndex, videos.length, isScrolling]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    
    // Ensure proper initial alignment on component mount
    const initialScroll = () => {
      feed.scrollTo({
        top: activeVideoIndex * window.innerHeight,
        behavior: "auto"
      });
    };
    
    // Run initial alignment after a small delay to ensure DOM is ready
    const timer = setTimeout(initialScroll, 150);
    
    feed.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      feed.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, activeVideoIndex]);

  // Enhanced swipe gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!feedRef.current || isScrolling) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;
    const swipeThreshold = 50;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      setIsScrolling(true);
      
      let nextIndex = activeVideoIndex;
      if (swipeDistance > 0 && activeVideoIndex < videos.length - 1) {
        // Swipe up
        nextIndex = activeVideoIndex + 1;
      } else if (swipeDistance < 0 && activeVideoIndex > 0) {
        // Swipe down
        nextIndex = activeVideoIndex - 1;
      }
      
      if (nextIndex !== activeVideoIndex) {
        setActiveVideoIndex(nextIndex);
        
        // Smooth scroll to next video
        feedRef.current?.scrollTo({
          top: nextIndex * window.innerHeight,
          behavior: "smooth"
        });
        
        // Reset scrolling state after animation completes
        setTimeout(() => {
          setIsScrolling(false);
        }, 400);
      } else {
        setIsScrolling(false);
      }
    }
  }, [activeVideoIndex, isScrolling, touchStartY, videos.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;
      
      if (e.key === 'ArrowDown' && activeVideoIndex < videos.length - 1) {
        setIsScrolling(true);
        const nextIndex = activeVideoIndex + 1;
        setActiveVideoIndex(nextIndex);
        
        feedRef.current?.scrollTo({
          top: nextIndex * window.innerHeight,
          behavior: "smooth"
        });
        
        setTimeout(() => {
          setIsScrolling(false);
        }, 400);
      } else if (e.key === 'ArrowUp' && activeVideoIndex > 0) {
        setIsScrolling(true);
        const prevIndex = activeVideoIndex - 1;
        setActiveVideoIndex(prevIndex);
        
        feedRef.current?.scrollTo({
          top: prevIndex * window.innerHeight,
          behavior: "smooth"
        });
        
        setTimeout(() => {
          setIsScrolling(false);
        }, 400);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideoIndex, isScrolling, videos.length]);

  return (
    <div
      ref={feedRef}
      className={cn(
        "h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar scroll-smooth",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ height: '100vh', overscrollBehavior: 'contain' }}
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
