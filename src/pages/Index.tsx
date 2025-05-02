
import React from "react";
import Header from "@/components/Header";
import VideoFeed from "@/components/VideoFeed";
import { videos } from "@/data/videos";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-24 pb-2 px-0 sm:px-4 max-w-screen-md mx-auto">
        <VideoFeed videos={videos} />
      </div>
    </div>
  );
};

export default Index;
