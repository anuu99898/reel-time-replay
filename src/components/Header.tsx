
import React, { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-10 bg-tiktok-dark bg-opacity-95 border-b border-gray-800",
        className
      )}
    >
      <div className="max-w-screen-md mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">
              <span className="text-tiktok-blue">Reel</span>
              <span className="text-tiktok-red">Time</span>
            </h1>
          </div>

          {/* Search */}
          <div className="hidden sm:flex items-center bg-gray-800 rounded-full px-3 py-1.5 flex-1 max-w-xs mx-4">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-white text-sm w-full"
            />
            <Search size={18} className="text-gray-400" />
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-3">
            <button className="bg-tiktok-red text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              Upload
            </button>
            <button className="bg-transparent border border-gray-700 text-white px-4 py-1.5 rounded-full text-sm">
              Log in
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-3">
          <div className="flex gap-10">
            <button
              className={cn(
                "px-1 py-1.5 font-semibold relative",
                activeTab === "for-you" ? "text-white" : "text-gray-400"
              )}
              onClick={() => setActiveTab("for-you")}
            >
              For You
              {activeTab === "for-you" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiktok-red" />
              )}
            </button>
            <button
              className={cn(
                "px-1 py-1.5 font-semibold relative",
                activeTab === "following" ? "text-white" : "text-gray-400"
              )}
              onClick={() => setActiveTab("following")}
            >
              Following
              {activeTab === "following" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiktok-red" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
