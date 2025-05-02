
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload, Image, Video, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

const UploadPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [ideaData, setIdeaData] = useState({
    title: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    tags: "",
    practicality: 50,
    innovation: 50,
    impact: 50,
  });

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        setCurrentUser(data.session.user);
      } else {
        toast.error("Please login to upload ideas");
        navigate("/login");
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIdeaData({
      ...ideaData,
      [name]: value,
    });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIdeaData({
      ...ideaData,
      [name]: parseInt(value),
    });
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Determine file type
    if (file.type.startsWith("image/")) {
      setFileType("image");
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
    } else {
      toast.error("Please select an image or video file");
      return;
    }

    // Store the file for later upload
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileType(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFileToStorage = async (file: File, fileType: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileType}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('idea-media')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('idea-media')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select an image or video for your idea");
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to upload an idea");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload file to storage
      const mediaUrl = await uploadFileToStorage(
        selectedFile, 
        fileType === 'image' ? 'images' : 'videos'
      );
      
      // 2. Convert tags string to array
      const tagsArray = ideaData.tags ? ideaData.tags.split(',').map(tag => tag.trim()) : [];
      
      // 3. Insert idea record to database
      const { data: ideaData: newIdea, error: ideaError } = await supabase
        .from('ideas')
        .insert([
          {
            title: ideaData.title,
            description: ideaData.description,
            type: fileType,
            media_url: mediaUrl,
            thumbnail_url: fileType === 'video' ? mediaUrl : null, // For videos, use the same URL for thumbnail
            contact_email: ideaData.contactEmail,
            contact_phone: ideaData.contactPhone,
            user_id: currentUser.id,
            tags: tagsArray
          }
        ])
        .select('id')
        .single();
      
      if (ideaError) {
        throw ideaError;
      }
      
      // 4. Insert ratings
      if (newIdea?.id) {
        const { error: ratingError } = await supabase
          .from('idea_ratings')
          .insert([
            {
              idea_id: newIdea.id,
              practicality: ideaData.practicality,
              innovation: ideaData.innovation,
              impact: ideaData.impact
            }
          ]);
        
        if (ratingError) {
          console.error('Error creating ratings:', ratingError);
          // Continue even if rating insertion fails
        }
      }
      
      toast.success("Your idea has been uploaded successfully!");
      setIsLoading(false);
      navigate("/");
      
    } catch (error) {
      console.error('Error uploading idea:', error);
      toast.error("Failed to upload your idea. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Upload Your Idea</h1>
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400">
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="flex flex-col items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
            
            {!previewUrl ? (
              <div 
                onClick={handleFileSelect}
                className="h-64 w-full border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors"
              >
                <Upload size={48} className="text-gray-500 mb-2" />
                <p className="text-gray-400">Click to upload an image or video</p>
                <p className="text-gray-500 text-sm mt-2">Supported formats: JPEG, PNG, GIF, MP4</p>
              </div>
            ) : (
              <div className="relative w-full rounded-lg overflow-hidden h-64 bg-gray-900">
                {fileType === "image" ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={clearFile}
                >
                  <X size={18} />
                </Button>
              </div>
            )}
          </div>

          {/* Idea Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={ideaData.title}
                onChange={handleInputChange}
                placeholder="Name your idea"
                className="bg-gray-800 border-gray-700 mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={ideaData.description}
                onChange={handleInputChange}
                placeholder="Explain your idea in detail..."
                className="bg-gray-800 border-gray-700 min-h-[120px] mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={ideaData.contactEmail || (currentUser?.email || "")}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="bg-gray-800 border-gray-700 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={ideaData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={ideaData.tags}
                onChange={handleInputChange}
                placeholder="technology, green, education"
                className="bg-gray-800 border-gray-700 mt-1"
              />
            </div>

            {/* Rating Sliders */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold">Rate your idea</h3>

              <div>
                <div className="flex justify-between">
                  <Label htmlFor="practicality">Practicality</Label>
                  <span className="text-sm text-gray-400">{ideaData.practicality}%</span>
                </div>
                <Input
                  id="practicality"
                  name="practicality"
                  type="range"
                  value={ideaData.practicality}
                  onChange={handleRatingChange}
                  min="0"
                  max="100"
                  step="5"
                  className="mt-1 accent-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between">
                  <Label htmlFor="innovation">Innovation</Label>
                  <span className="text-sm text-gray-400">{ideaData.innovation}%</span>
                </div>
                <Input
                  id="innovation"
                  name="innovation"
                  type="range"
                  value={ideaData.innovation}
                  onChange={handleRatingChange}
                  min="0"
                  max="100"
                  step="5"
                  className="mt-1 accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between">
                  <Label htmlFor="impact">Potential Impact</Label>
                  <span className="text-sm text-gray-400">{ideaData.impact}%</span>
                </div>
                <Input
                  id="impact"
                  name="impact"
                  type="range"
                  value={ideaData.impact}
                  onChange={handleRatingChange}
                  min="0"
                  max="100"
                  step="5"
                  className="mt-1 accent-yellow-400"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-black"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload Idea"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
