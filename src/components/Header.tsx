
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Upload, LogIn, Bell, User as UserIcon, Settings, LogOut, Home, Bookmark, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/providers/AuthProvider";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const { user, profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3); // Example notification count

  const handleUploadClick = () => {
    if (!user) {
      toast.error("Please log in to upload ideas");
      navigate("/login");
    } else {
      navigate("/upload");
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}"...`);
      // Implement actual search functionality here
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-10 bg-black bg-opacity-95 border-b border-gray-800 backdrop-blur-sm",
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
          <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-gray-800 rounded-full px-3 py-1.5 flex-1 max-w-xs mx-4">
            <input
              type="text"
              placeholder="Search ideas..."
              className="bg-transparent border-none outline-none text-white text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <Search size={18} className="text-gray-400 hover:text-white transition-colors" />
            </button>
          </form>

          {/* Nav buttons */}
          <div className="flex items-center gap-3">
            {user && (
              <button className="relative">
                <Bell size={22} className="text-gray-300 hover:text-white transition-colors" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tiktok-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            )}
            
            <Button 
              onClick={handleUploadClick}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
              <Upload size={18} className="mr-1.5" />
              Upload
            </Button>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-gray-700">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.username || user.email} />
                    <AvatarFallback>
                      {(profile?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="absolute right-0 top-full mt-2 w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.username || user.email} />
                        <AvatarFallback>
                          {(profile?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{profile?.full_name || profile?.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <UserIcon size={16} />
                      My Profile
                    </Link>
                    <Link 
                      to="/saved" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Bookmark size={16} />
                      Saved Ideas
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-left w-full px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors text-red-400 hover:text-red-300"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/login")}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800 transition-colors"
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
                "px-1 py-1.5 font-semibold relative transition-colors",
                activeTab === "for-you" ? "text-white" : "text-gray-400 hover:text-gray-200"
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
                "px-1 py-1.5 font-semibold relative transition-colors",
                activeTab === "following" ? "text-white" : "text-gray-400 hover:text-gray-200"
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
