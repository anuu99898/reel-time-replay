
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoPlayerProps {
  videoUrl: string;
  autoPlay?: boolean;
  inView: boolean;
  onVideoEnd?: () => void;
  className?: string;
  preload?: "auto" | "metadata" | "none";
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  autoPlay = true,
  inView,
  onVideoEnd,
  className,
  preload = "auto"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Default to muted for faster loading
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const loadAttemptRef = useRef(0);

  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    setHasUserInteracted(true);

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Show loading indicator
      if (!isVideoLoaded) {
        setIsLoading(true);
      }
      
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(error => {
        console.error("Video play error:", error);
        // Some browsers require user interaction before playing videos with audio
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          }).catch(err => {
            console.error("Still can't play:", err);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      });
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    setHasUserInteracted(true);
  };

  // Update progress bar
  const updateProgress = () => {
    if (!videoRef.current) return;
    const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percentage);
  };

  // Seek video when clicking on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const progressBar = e.currentTarget;
    const clickPositionInBar = e.clientX - progressBar.getBoundingClientRect().left;
    const percentage = (clickPositionInBar / progressBar.offsetWidth) * 100;
    videoRef.current.currentTime = (percentage / 100) * videoRef.current.duration;
    setProgress(percentage);
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(100);
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  // Handle video loading events
  const handleVideoLoading = () => {
    setIsLoading(true);
  };

  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    setIsLoading(false);
    loadAttemptRef.current = 0;
    
    if (autoPlay && inView) {
      playVideo();
    }
  };
  
  // Extract play logic to reuse
  const playVideo = () => {
    if (!videoRef.current) return;
    
    videoRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Video play error:", error);
        
        // If we've tried less than 3 times, try with muted
        if (loadAttemptRef.current < 3) {
          loadAttemptRef.current += 1;
          
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            
            videoRef.current.play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(err => {
                console.error("Still can't autoplay:", err);
                setIsLoading(false);
              });
          }
        } else {
          // Give up after 3 attempts
          setIsLoading(false);
        }
      });
  };

  // Handle when the video can start playing (enough data is loaded)
  const handleCanPlay = () => {
    setIsLoading(false);
    
    // If video is in view and should autoplay, start playing
    if (inView && autoPlay && !isPlaying) {
      playVideo();
    }
  };

  // Handle seeking to avoid displaying loading indicator during normal seeking
  const handleSeeking = () => {
    // Only show loading if we're not near the end of the video
    if (videoRef.current && (videoRef.current.duration - videoRef.current.currentTime) > 0.5) {
      setIsLoading(true);
    }
  };
  
  const handleSeeked = () => {
    setIsLoading(false);
  };
  
  // Optimize video preloading
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (inView) {
      // Optimize video loading
      if (preload === "auto") {
        // Set to low quality initially for faster loading if browser supports it
        if ('playsInline' in videoRef.current) {
          videoRef.current.playsInline = true;
        }
        
        // Reset src if needed
        if (videoRef.current.src !== videoUrl && videoUrl) {
          videoRef.current.src = videoUrl;
          videoRef.current.load();
        }
      }
    }
  }, [inView, videoUrl, preload]);

  // Play/pause when the video comes into view
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (inView) {
      // Reset loading attempts when coming into view
      loadAttemptRef.current = 0;
      
      // Start with muted for faster autopla
      
      // Explicitly preload video when in view to improve loading performance
      if (videoRef.current.preload !== "auto") {
        videoRef.current.preload = "auto";
      }
      
      setIsLoading(true);
      
      // Slight delay to allow browser to initialize video
      const timer = setTimeout(() => {
        playVideo();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Pause and potentially unload when out of view
      videoRef.current.pause();
      setIsPlaying(false);
      
      // If far from current view, save memory by reducing quality
      if (videoRef.current.preload !== "metadata") {
        videoRef.current.preload = "metadata";
      }
    }
  }, [inView, autoPlay, hasUserInteracted]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain md:object-cover"
        loop
        playsInline
        muted={isMuted}
        preload={preload}
        onTimeUpdate={updateProgress}
        onEnded={handleVideoEnd}
        onLoadedData={handleVideoLoaded}
        onLoadStart={handleVideoLoading}
        onCanPlay={handleCanPlay}
        onWaiting={handleVideoLoading}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onClick={togglePlay}
        style={{ 
          maxHeight: '100%',
          maxWidth: '100%'
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
          <div className="animate-spin">
            <Loader2 size={48} className="text-yellow-400" />
          </div>
        </div>
      )}

      {/* Play/Pause overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
          >
            <Play size={32} className="text-yellow-400" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-2 right-2 flex flex-col gap-2 z-20">
        {/* Progress bar */}
        <div 
          className="h-1 bg-white bg-opacity-20 rounded-full overflow-hidden cursor-pointer" 
          onClick={handleSeek}
        >
          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between">
          {/* Play/Pause button */}
          <button 
            onClick={togglePlay} 
            className="text-white hover:text-yellow-400 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Mute/Unmute button */}
          <button 
            onClick={toggleMute} 
            className="text-white hover:text-yellow-400 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
