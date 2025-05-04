
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Lightbulb, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const buttonClassName = (path: string) =>
    `py-2 px-3 text-sm font-medium ${
      location.pathname === path
        ? "text-white"
        : "text-gray-300 hover:text-white"
    }`;

  const mobileButtonClassName = (path: string) =>
    `block py-3 px-4 text-lg ${
      location.pathname === path
        ? "text-yellow-400 font-medium"
        : "text-white"
    }`;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled || isMenuOpen
          ? "bg-black border-b border-gray-800"
          : "bg-gradient-to-b from-black via-black/80 to-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="bg-yellow-400 rounded-full p-1 mr-2">
            <Lightbulb className="text-black h-5 w-5" />
          </div>
          <span className="font-bold text-white text-lg">ReelIdeas</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={buttonClassName("/")}>
            Home
          </Link>
          <Link to="/explore" className={buttonClassName("/explore")}>
            Explore
          </Link>
          <Link to="/upload" className={buttonClassName("/upload")}>
            Submit Idea
          </Link>
        </div>

        {/* Search, Notifications and Profile */}
        <div className="flex items-center gap-2">
          <SearchBar />
          
          {user && <NotificationBell />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-9 w-9">
                  <Avatar>
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} 
                      alt="Profile" 
                    />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 absolute left-0 right-0">
          <div className="flex flex-col">
            <Link to="/" className={mobileButtonClassName("/")} onClick={closeMenu}>
              Home
            </Link>
            <Link
              to="/explore"
              className={mobileButtonClassName("/explore")}
              onClick={closeMenu}
            >
              Explore
            </Link>
            <Link
              to="/upload"
              className={mobileButtonClassName("/upload")}
              onClick={closeMenu}
            >
              Submit Idea
            </Link>
            {user && (
              <Link
                to="/profile"
                className={mobileButtonClassName("/profile")}
                onClick={closeMenu}
              >
                My Profile
              </Link>
            )}
            <div className="py-4 border-t border-gray-800">
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                  className="w-full text-left py-3 px-4 text-red-500"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block py-3 px-4 text-yellow-400 font-medium"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {children}
    </header>
  );
};

export default Header;
