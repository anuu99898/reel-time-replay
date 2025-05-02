
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Upload, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
  }, []);

  const handleUploadClick = () => {
    if (!currentUser) {
      toast.error("Please log in to upload ideas");
      navigate("/login");
    } else {
      navigate("/upload");
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-10 bg-black bg-opacity-95 border-b border-gray-800",
        className
      )}
    >
      <div className="max-w-screen-md mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold">
              <span className="text-tiktok-blue">Reel</span>
              <span className="text-tiktok-red">Ideas</span>
            </h1>
          </Link>

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
            <Button 
              onClick={handleUploadClick}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-full text-sm font-semibold"
            >
              <Upload size={18} className="mr-1.5" />
              Upload
            </Button>
            
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-700" 
                  />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.username}
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                      <div className="text-left">
                        <p className="font-medium text-sm">{currentUser.username}</p>
                        <p className="text-xs text-gray-400">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="text-left w-full px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/login")}
                variant="outline"
                className="border-gray-700 text-white"
              >
                <LogIn size={18} className="mr-1.5" />
                Log in
              </Button>
            )}
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
