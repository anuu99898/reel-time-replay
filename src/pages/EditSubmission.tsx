
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { SubmissionType, ContentType, QuestionItem } from "@/types/submission";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image, Video, X, Plus, File, FileText, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const EditSubmission = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [submissionType, setSubmissionType] = useState<SubmissionType>("idea");
  const [contentType, setContentType] = useState<ContentType>("video");
  const [questions, setQuestions] = useState<QuestionItem[]>([{ id: uuidv4(), text: '' }]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    tags: "",
  });

  useEffect(() => {
    if (!user) {
      toast.error("Please login to edit submissions");
      navigate("/login");
      return;
    }
    
    const fetchSubmission = async () => {
      if (!id) return;
      
      try {
        setIsSubmissionLoading(true);
        
        const { data, error } = await supabase
          .from("ideas")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          toast.error("Submission not found");
          navigate("/profile");
          return;
        }
        
        // Check if user owns this submission
        if (data.user_id !== user.id) {
          toast.error("You don't have permission to edit this submission");
          navigate("/profile");
          return;
        }
        
        // Set form data
        setSubmissionType(data.idea_type as SubmissionType);
        setContentType(data.content_type as ContentType);
        
        setFormData({
          title: data.title || "",
          description: data.description || "",
          contactEmail: data.contact_email || "",
          contactPhone: data.contact_phone || "",
          tags: data.tags ? data.tags.join(", ") : "",
        });
        
        // Set questions if any
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions.map((q: string) => ({ 
            id: uuidv4(), 
            text: q 
          })));
        }
        
        // Set preview if media exists
        if (data.media_url) {
          setPreviewUrl(data.media_url);
          setFileType(data.type === "video" ? "video" : "image");
        } else if (data.thumbnail_url) {
          setPreviewUrl(data.thumbnail_url);
          setFileType("image");
        }
        
      } catch (error: any) {
        console.error("Error fetching submission:", error);
        toast.error("Failed to load submission");
        navigate("/profile");
      } finally {
        setIsSubmissionLoading(false);
      }
    };
    
    fetchSubmission();
  }, [id, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    
    if (!id || !user) {
      toast.error("Missing submission ID or user data");
      return;
    }

    setIsLoading(true);

    try {
      let mediaUrl = null;
      
      // Only upload file if one is selected
      if (selectedFile) {
        mediaUrl = await uploadFileToStorage(
          selectedFile, 
          fileType === 'image' ? 'images' : 'videos'
        );
      }
      
      // Convert tags string to array
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];
      
      // Filter out empty questions
      const filteredQuestions = questions
        .filter(q => q.text.trim() !== '')
        .map(q => q.text.trim());
      
      // Update submission record
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        idea_type: submissionType,
        content_type: contentType,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        tags: tagsArray,
        questions: filteredQuestions,
        updated_at: new Date().toISOString()
      };
      
      // Only update media URLs if new file was uploaded
      if (mediaUrl) {
        if (fileType === 'video') {
          updateData.media_url = mediaUrl;
          updateData.type = 'video';
        } else {
          if (contentType === 'card') {
            updateData.thumbnail_url = mediaUrl;
            updateData.type = 'image';
          } else {
            updateData.media_url = mediaUrl;
            updateData.type = 'video';
          }
        }
      }
      
      const { error } = await supabase
        .from('ideas')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Your submission has been updated successfully!");
      navigate("/profile");
      
    } catch (error: any) {
      console.error('Error updating submission:', error);
      toast.error(`Failed to update: ${error.message || "Please try again"}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmissionLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            Edit {submissionType === 'idea' ? 'Idea' : 'Problem'}
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400">
            <ArrowLeft size={18} className="mr-2" /> Back
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection - Read only in edit mode */}
          <div className="flex gap-4 mb-8 opacity-70">
            <Button
              type="button"
              variant={submissionType === 'idea' ? 'default' : 'outline'}
              className={submissionType === 'idea' ? 'bg-yellow-400 hover:bg-yellow-500 text-black cursor-not-allowed' : 'cursor-not-allowed'}
              disabled
            >
              Idea
            </Button>
            <Button
              type="button"
              variant={submissionType === 'problem' ? 'default' : 'outline'}
              className={submissionType === 'problem' ? 'bg-yellow-400 hover:bg-yellow-500 text-black cursor-not-allowed' : 'cursor-not-allowed'}
              disabled
            >
              Problem
            </Button>
          </div>

          {/* Content Type Selection - Read only in edit mode */}
          {submissionType === 'idea' && (
            <div className="mb-8 opacity-70">
              <Label className="block mb-2">Presentation Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-not-allowed border ${contentType === 'video' ? 'border-yellow-400 bg-black' : 'border-gray-700 bg-gray-900'}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Video className="h-10 w-10 mb-3 text-yellow-400" />
                    <h3 className="font-semibold">Video</h3>
                    <p className="text-xs text-gray-400 text-center mt-1">Video presentation</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-not-allowed border ${contentType === 'card' ? 'border-yellow-400 bg-black' : 'border-gray-700 bg-gray-900'}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <FileText className="h-10 w-10 mb-3 text-yellow-400" />
                    <h3 className="font-semibold">Idea Card</h3>
                    <p className="text-xs text-gray-400 text-center mt-1">Text with image</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* File Upload */}
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
                    type="button"
                  >
                    <X size={18} />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Submission Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Name your submission"
                className="bg-gray-800 border-gray-700 mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Explain in detail..."
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
                  value={formData.contactEmail}
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
                  value={formData.contactPhone || ""}
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
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="technology, green, education"
                className="bg-gray-800 border-gray-700 mt-1"
              />
            </div>

            {/* Questions Section */}
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
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-black"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Submission"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditSubmission;
