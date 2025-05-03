
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoPlayerProps {
  videoUrl: string;
  autoPlay?: boolean;
  inView: boolean;
  onVideoEnd?: () => void;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  autoPlay = true,
  inView,
  onVideoEnd,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const isMobile = useIsMobile();

  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        console.error("Video play error:", error);
        // Some browsers require user interaction before playing videos with audio
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(err => console.error("Still can't play:", err));
        }
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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

  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    if (autoPlay && inView) {
      videoRef.current?.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error("Video play error:", error);
          // Try with muted (autoplay policy often requires muted)
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.error("Still can't autoplay:", err));
          }
        });
    }
  };

  // Play/pause when the video comes into view
  useEffect(() => {
    if (!videoRef.current || !isVideoLoaded) return;
    
    if (inView) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error("Video play error:", error);
          // Try with muted (autoplay policy often requires muted)
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.error("Still can't play in view:", err));
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [inView, isVideoLoaded]);

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
        onTimeUpdate={updateProgress}
        onEnded={handleVideoEnd}
        onLoadedData={handleVideoLoaded}
        onClick={togglePlay}
        style={{ 
          maxHeight: '100%',
          maxWidth: '100%'
        }}
      />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-black bg-opacity-50 text-white"
          >
            <Play size={32} />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-2 right-2 flex flex-col gap-2">
        {/* Progress bar */}
        <div 
          className="video-progress cursor-pointer" 
          onClick={handleSeek}
        >
          <div className="video-progress-fill" style={{ width: `${progress}%` }} />
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
