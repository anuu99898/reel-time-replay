
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload, Image, Video, X, Plus, File, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent } from "@/components/ui/card";
import { SubmissionType, ContentType, QuestionItem } from "@/types/submission";
import { useAuth } from "@/providers/AuthProvider";

const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // New state for enhanced functionality
  const [submissionType, setSubmissionType] = useState<SubmissionType>("idea");
  const [contentType, setContentType] = useState<ContentType>("video");
  const [questions, setQuestions] = useState<QuestionItem[]>([{ id: uuidv4(), text: '' }]);
  
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
    if (!user) {
      toast.error("Please login to upload ideas or problems");
      navigate("/login");
    }
  }, [user, navigate]);

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

  // Handle question input changes
  const handleQuestionChange = (id: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text: value } : q
    ));
  };

  // Add new question field
  const addQuestion = () => {
    setQuestions([...questions, { id: uuidv4(), text: '' }]);
  };

  // Remove question field
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    } else {
      toast.error("You must have at least one question");
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
    
    // For card content type, we need an image if no file is selected
    if (submissionType === 'idea' && contentType === 'card' && !selectedFile) {
      toast.error("Please select an image for your idea card");
      return;
    }
    
    // For video content type, we need a video file
    if (submissionType === 'idea' && contentType === 'video' && (!selectedFile || fileType !== 'video')) {
      toast.error("Please select a video file for your video idea");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to upload an idea or problem");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      let mediaUrl = null;
      
      // Only upload file if one is selected (required for ideas, optional for problems)
      if (selectedFile) {
        mediaUrl = await uploadFileToStorage(
          selectedFile, 
          fileType === 'image' ? 'images' : 'videos'
        );
      }
      
      // Convert tags string to array
      const tagsArray = ideaData.tags ? ideaData.tags.split(',').map(tag => tag.trim()) : [];
      
      // Filter out empty questions
      const filteredQuestions = questions
        .filter(q => q.text.trim() !== '')
        .map(q => q.text.trim());
      
      if (submissionType === 'idea') {
        // Insert idea record to database
        const { data, error: ideaError } = await supabase
          .from('ideas')
          .insert([
            {
              title: ideaData.title,
              description: ideaData.description,
              type: fileType || 'image', // Default to image if no file type
              content_type: contentType,
              idea_type: submissionType,
              media_url: mediaUrl,
              thumbnail_url: fileType === 'video' ? mediaUrl : null,
              contact_email: ideaData.contactEmail,
              contact_phone: ideaData.contactPhone,
              user_id: user.id,
              tags: tagsArray,
              questions: filteredQuestions
            }
          ])
          .select('id')
          .single();
        
        if (ideaError) {
          throw ideaError;
        }
        
        // Insert ratings for idea
        if (data?.id) {
          const { error: ratingError } = await supabase
            .from('idea_ratings')
            .insert([
              {
                idea_id: data.id,
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
      } else {
        // Insert problem submission
        const { error: problemError } = await supabase
          .from('problem_submissions')
          .insert([
            {
              title: ideaData.title,
              description: ideaData.description,
              contact_email: ideaData.contactEmail,
              contact_phone: ideaData.contactPhone,
              user_id: user.id,
              tags: tagsArray,
              questions: filteredQuestions
            }
          ]);
        
        if (problemError) {
          throw problemError;
        }
        
        toast.success("Your problem has been submitted successfully!");
      }
      
      navigate("/");
      
    } catch (error: any) {
      console.error('Error uploading submission:', error);
      toast.error(`Failed to upload: ${error.message || "Please try again"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            {submissionType === 'idea' ? 'Upload Your Idea' : 'Submit a Problem'}
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400">
            Cancel
          </Button>
        </div>
        
        {/* Submission Type Selection */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={submissionType === 'idea' ? 'default' : 'outline'}
            className={submissionType === 'idea' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : ''}
            onClick={() => setSubmissionType('idea')}
          >
            Share an Idea
          </Button>
          <Button
            variant={submissionType === 'problem' ? 'default' : 'outline'}
            className={submissionType === 'problem' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : ''}
            onClick={() => setSubmissionType('problem')}
          >
            Submit a Problem
          </Button>
        </div>

        {/* Content Type Selection (only for ideas) */}
        {submissionType === 'idea' && (
          <div className="mb-8">
            <Label className="block mb-2">How do you want to present your idea?</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer border ${contentType === 'video' ? 'border-yellow-400 bg-black' : 'border-gray-700 bg-gray-900'}`}
                onClick={() => setContentType('video')}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Video className="h-10 w-10 mb-3 text-yellow-400" />
                  <h3 className="font-semibold">Video</h3>
                  <p className="text-xs text-gray-400 text-center mt-1">Share your idea through video</p>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer border ${contentType === 'card' ? 'border-yellow-400 bg-black' : 'border-gray-700 bg-gray-900'}`}
                onClick={() => setContentType('card')}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <FileText className="h-10 w-10 mb-3 text-yellow-400" />
                  <h3 className="font-semibold">Idea Card</h3>
                  <p className="text-xs text-gray-400 text-center mt-1">Use text with an optional image</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload - Only show for video ideas or card ideas with images */}
          {(submissionType === 'idea' && (contentType === 'video' || contentType === 'card')) && (
            <div className="flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={contentType === 'video' ? "video/*" : "image/*"}
                className="hidden"
              />
              
              {!previewUrl ? (
                <div 
                  onClick={handleFileSelect}
                  className="h-64 w-full border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors"
                >
                  <Upload size={48} className="text-gray-500 mb-2" />
                  <p className="text-gray-400">Click to upload {contentType === 'video' ? 'a video' : 'an image'}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Supported formats: {contentType === 'video' ? 'MP4, WebM, MOV' : 'JPEG, PNG, GIF'}
                  </p>
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
          )}

          {/* Idea/Problem Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={ideaData.title}
                onChange={handleInputChange}
                placeholder={`Name your ${submissionType}`}
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
                placeholder={`Explain your ${submissionType} in detail...`}
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
                  value={ideaData.contactEmail || (user?.email || "")}
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

            {/* Questions Section (for problems or ideas that need feedback) */}
            {(submissionType === 'problem' || 
              (submissionType === 'idea' && contentType === 'card')) && (
              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <Label>Questions</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addQuestion}
                    className="text-xs"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div key={question.id} className="flex gap-2">
                      <Input
                        value={question.text}
                        onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                        placeholder={`Question ${index + 1}`}
                        className="bg-gray-800 border-gray-700 flex-1"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeQuestion(question.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Add questions you'd like feedback on or help with
                </p>
              </div>
            )}

            {/* Rating Sliders - only for ideas */}
            {submissionType === 'idea' && (
              <div className="space-y-4 pt-4 border-t border-gray-800">
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
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-black"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : submissionType === 'idea' ? "Upload Idea" : "Submit Problem"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
