
import React, { useState, useRef, useEffect, useCallback } from "react";
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

  return (
    <div className="snap-start w-full h-screen flex flex-col justify-end bg-black relative overflow-hidden">
      <VideoPlayer
        videoUrl={video.videoUrl}
        inView={isActive}
        className="absolute inset-0 w-full h-full object-cover"
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
        <CommentSection
          ideaId={video.id || "video-comment"} // Adding ideaId property
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

  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    const scrollTop = feedRef.current.scrollTop;
    const height = feedRef.current.clientHeight;
    const index = Math.round(scrollTop / height);
    setActiveVideoIndex(index);
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.addEventListener("scroll", handleScroll);
    return () => feed.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Gesture support (Swipe up and down) - fix the touch event types
  const handleSwipe = useCallback((e: React.TouchEvent) => {
    const touchStart = e.touches[0].clientY;
    
    const handleTouchEnd = (event: TouchEvent) => {
      const touchEnd = event.changedTouches[0].clientY;
      if (touchStart - touchEnd > 30) {
        // Swipe up: move to next video
        if (activeVideoIndex < videos.length - 1) {
          setActiveVideoIndex((prev) => prev + 1);
        }
      } else if (touchEnd - touchStart > 30) {
        // Swipe down: move to previous video
        if (activeVideoIndex > 0) {
          setActiveVideoIndex((prev) => prev - 1);
        }
      }
      
      // Remove the event listener
      const feed = feedRef.current;
      if (feed) {
        feed.removeEventListener("touchend", handleTouchEnd);
      }
    };

    // Add the event listener using native DOM API with proper types
    const feed = feedRef.current;
    if (feed) {
      feed.addEventListener("touchend", handleTouchEnd);
    }
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
