
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        toast.success("Login successful!");
        navigate("/");
      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }

        // Register with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            }
          }
        });

        if (error) throw error;
        
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-tiktok-blue/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-tiktok-red/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <Lightbulb size={40} className="text-black" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-tiktok-blue">Reel</span>
            <span className="text-tiktok-red">Ideas</span>
          </h1>
          <p className="text-gray-400 mt-2 text-center">Share and connect with brilliant ideas from around the world</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-800">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 text-center transition-all ${
                isLogin ? "text-white font-semibold border-b-2 border-yellow-400" : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-center transition-all ${
                !isLogin ? "text-white font-semibold border-b-2 border-yellow-400" : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-gray-300">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="pl-3 bg-gray-800/50 border-gray-700 focus:border-yellow-400"
                    value={formData.fullName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-gray-800/50 border-gray-700 focus:border-yellow-400"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 bg-gray-800/50 border-gray-700 focus:border-yellow-400"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 bg-gray-800/50 border-gray-700 focus:border-yellow-400"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                isLogin ? "Login" : "Create Account"
              )}
            </Button>
          </form>

          {isLogin && (
            <p className="text-center text-gray-400 mt-4">
              <a href="#" className="text-yellow-400 hover:underline hover:text-yellow-500 transition-colors">
                Forgot password?
              </a>
            </p>
          )}
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          By continuing, you agree to our{" "}
          <a href="#" className="text-yellow-400 hover:underline hover:text-yellow-500 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-yellow-400 hover:underline hover:text-yellow-500 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
