
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  Upload,
  Search,
  LogIn,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/sonner";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-black border-b border-gray-800 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and brand name */}
          <Link to="/" className="flex items-center text-white">
            <span className="font-bold text-xl text-yellow-400">ReelIdeas</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-white"
            >
              <Home className="mr-1 h-4 w-4" />
              Home
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/upload")}
              className="text-gray-300 hover:text-white"
            >
              <Upload className="mr-1 h-4 w-4" />
              Upload
            </Button>
            
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="text-gray-300 hover:text-white"
                >
                  <User className="mr-1 h-4 w-4" />
                  Profile
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Logout
                </Button>
                
                <Avatar className="h-8 w-8 ml-2 cursor-pointer" onClick={() => navigate("/profile")}>
                  <AvatarImage 
                    src={userProfile?.avatar_url} 
                    alt={userProfile?.username || 'User'} 
                  />
                  <AvatarFallback className="bg-yellow-400 text-black">
                    {userProfile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/login")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <LogIn className="mr-1 h-4 w-4" />
                Login
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 space-y-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
              className="w-full justify-start text-gray-300 hover:text-white"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate("/upload");
                setIsMenuOpen(false);
              }}
              className="w-full justify-start text-gray-300 hover:text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-300 hover:text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-300 hover:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
