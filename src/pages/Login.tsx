
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Mock authentication (replace with real auth when connecting to backend)
const MOCK_USERS = [
  { email: "demo@example.com", password: "password123" },
  { email: "user@example.com", password: "userpass" },
];

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // Login logic
      const user = MOCK_USERS.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Set user in localStorage (replace with proper auth tokens in real app)
        localStorage.setItem("currentUser", JSON.stringify({
          email: formData.email,
          username: formData.email.split("@")[0],
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + formData.email,
        }));
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("Invalid credentials");
      }
    } else {
      // Register logic
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Mock registration (would normally connect to backend)
      localStorage.setItem("currentUser", JSON.stringify({
        email: formData.email,
        username: formData.email.split("@")[0],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + formData.email,
      }));
      toast.success("Account created successfully!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 animate-pulse-scale">
            <Lightbulb size={40} className="text-black" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-tiktok-blue">Reel</span>
            <span className="text-tiktok-red">Ideas</span>
          </h1>
          <p className="text-gray-400 mt-2">Share and connect with brilliant ideas</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 text-center ${
                isLogin ? "text-white font-semibold border-b-2 border-yellow-400" : "text-gray-400"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                !isLogin ? "text-white font-semibold border-b-2 border-yellow-400" : "text-gray-400"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="pl-10 bg-gray-800 border-gray-700"
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
                  className="pl-10 bg-gray-800 border-gray-700"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                    className="pl-10 bg-gray-800 border-gray-700"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
              {isLogin ? "Login" : "Create Account"}
            </Button>
          </form>

          {isLogin && (
            <p className="text-center text-gray-400 mt-4">
              <a href="#" className="text-yellow-400 hover:underline">
                Forgot password?
              </a>
            </p>
          )}
        </div>

        <p className="text-center text-gray-400 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-yellow-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-yellow-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
