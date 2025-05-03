
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, ArrowLeft, MessageSquare, Heart, Share2, Edit, Trash2 } from "lucide-react";
import CommentSection from "@/components/CommentSection";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/providers/AuthProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idea, setIdea] = useState<any | null>(null);
  const [creator, setCreator] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [similarIdeas, setSimilarIdeas] = useState<any[]>([]);

  useEffect(() => {
    const fetchIdeaDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch idea details
        const { data: ideaData, error: ideaError } = await supabase
          .from("ideas")
          .select("*, idea_ratings(*)")
          .eq("id", id)
          .single();
          
        if (ideaError) throw ideaError;
        
        if (!ideaData) {
          toast.error("Idea not found");
          navigate("/");
          return;
        }

        // Set idea data
        setIdea(ideaData);
        
        // Check if user owns this idea
        if (user && ideaData.user_id === user.id) {
          setIsOwner(true);
        }
        
        // Fetch creator profile
        if (ideaData.user_id) {
          const { data: creatorData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", ideaData.user_id)
            .single();
            
          setCreator(creatorData);
        }
        
        // Fetch comments
        const { data: commentsData } = await supabase
          .from("comments")
          .select("*, profiles(*)")
          .eq("idea_id", id)
          .order("created_at", { ascending: false });
          
        if (commentsData) {
          const formattedComments = commentsData.map((comment: any) => ({
            id: comment.id,
            text: comment.text,
            timestamp: new Date(comment.created_at).toLocaleString(),
            user: {
              id: comment.profiles?.id || "anonymous",
              username: comment.profiles?.username || "Anonymous",
              avatar: comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_id || "anon"}`,
              name: comment.profiles?.full_name || "Anonymous User",
            },
            likes: 0
          }));
          
          ideaData.comments = formattedComments;
        } else {
          ideaData.comments = [];
        }
        
        // Fetch similar ideas based on tags
        if (ideaData.tags && ideaData.tags.length > 0) {
          let { data: similarData } = await supabase
            .from("ideas")
            .select("id, title, thumbnail_url, media_url, user_id, likes, profiles:profiles(username, avatar_url)")
            .neq("id", id)
            .limit(3);
            
          if (similarData) {
            setSimilarIdeas(similarData);
          }
        }
        
      } catch (error: any) {
        console.error("Error fetching idea:", error);
        toast.error("Failed to load idea");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIdeaDetails();
  }, [id, user, navigate]);

  const handleLike = () => {
    setLiked(!liked);
    // In a real app, you'd update the likes count in the database
  };

  const handleConnect = () => {
    if (!user) {
      toast.error("Please login to connect with the creator");
      navigate("/login");
      return;
    }
    
    toast.success("Connection request sent to the creator!");
  };

  const handleDeleteIdea = async () => {
    if (!id || !user) return;
    
    try {
      const { error } = await supabase
        .from("ideas")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      toast.success("Your submission has been deleted");
      navigate("/profile");
    } catch (error: any) {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete submission");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!idea) return null;

  // Get ratings safely with default values
  const ratings = idea.idea_ratings && idea.idea_ratings[0] ? idea.idea_ratings[0] : null;
  const practicality = ratings?.practicality || 0;
  const innovation = ratings?.innovation || 0;
  const impact = ratings?.impact || 0;

  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Media */}
            <div className="rounded-lg overflow-hidden bg-gray-900 mb-4">
              {idea.type === "video" ? (
                <video 
                  src={idea.media_url} 
                  poster={idea.thumbnail_url} 
                  controls 
                  className="w-full"
                />
              ) : (
                <img 
                  src={idea.thumbnail_url || idea.media_url} 
                  alt={idea.title} 
                  className="w-full object-cover max-h-80"
                />
              )}
            </div>

            {/* Title and description */}
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold">{idea.title}</h1>
              {isOwner && (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/edit/${idea.id}`)}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <span className="capitalize px-2 py-0.5 bg-gray-800 rounded-full text-xs mr-2">
                {idea.idea_type}
              </span>
              <span>{new Date(idea.created_at).toLocaleDateString()}</span>
            </div>

            <div className="prose prose-sm prose-invert max-w-none mb-6">
              <p className="whitespace-pre-line">{idea.description}</p>
            </div>

            {/* Tags */}
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 mb-6">
                {idea.tags.map((tag: string, index: number) => (
                  <div key={index} className="bg-gray-800 text-sm px-3 py-1 rounded-full text-gray-300">
                    #{tag}
                  </div>
                ))}
              </div>
            )}

            {/* Questions section */}
            {idea.questions && idea.questions.length > 0 && (
              <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Questions</h2>
                <div className="space-y-3">
                  {idea.questions.map((question: string, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments section */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Feedback</h2>
                <Button 
                  variant="outline"
                  onClick={() => setShowComments(true)}
                  className="text-sm"
                >
                  <MessageSquare size={16} className="mr-2" />
                  {idea.comments && idea.comments.length > 0
                    ? `View all (${idea.comments.length})`
                    : "Add feedback"}
                </Button>
              </div>

              {/* Display few comments */}
              {idea.comments && idea.comments.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {idea.comments.slice(0, 2).map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-gray-800 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
                        <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">@{comment.user.username}</span>
                          <span className="text-xs text-gray-400">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center">
                  <p className="text-gray-400">No feedback yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {showComments && idea.comments && (
              <CommentSection
                comments={idea.comments}
                onClose={() => setShowComments(false)}
                currentUser={user ? {
                  id: user.id,
                  username: user.email?.split('@')[0] || 'User',
                  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
                  name: user.email?.split('@')[0] || 'User',
                } : null}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Creator card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={creator?.avatar_url} alt={creator?.username || "Creator"} />
                    <AvatarFallback>{(creator?.username || "C")[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">@{creator?.username || "Creator"}</h3>
                    <p className="text-sm text-gray-400">{creator?.full_name || ""}</p>
                  </div>
                </div>

                <Button
                  onClick={handleConnect}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  Connect with Creator
                </Button>

                {/* Contact info - only shown if logged in */}
                {user && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      {idea.contact_email && (
                        <div className="flex items-center text-sm">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          <span>{idea.contact_email}</span>
                        </div>
                      )}
                      {idea.contact_phone && (
                        <div className="flex items-center text-sm">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          <span>{idea.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ratings */}
            {ratings && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Idea Ratings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Practicality</span>
                        <span>{practicality}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${practicality}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Innovation</span>
                        <span>{innovation}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${innovation}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Potential Impact</span>
                        <span>{impact}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400" 
                          style={{ width: `${impact}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${liked ? "bg-gray-700" : ""}`}
                      onClick={handleLike}
                    >
                      <Heart size={16} className={`mr-2 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                      {liked ? "Liked" : "Like"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowComments(true)}
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Comment
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied to clipboard");
                      }}
                    >
                      <Share2 size={16} className="mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Similar ideas */}
            {similarIdeas.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Similar Ideas</h3>
                <div className="space-y-3">
                  {similarIdeas.map(similarIdea => (
                    <div 
                      key={similarIdea.id}
                      className="flex gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                      onClick={() => {
                        navigate(`/idea/${similarIdea.id}`);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <div className="w-14 h-14 rounded overflow-hidden bg-gray-700">
                        <img 
                          src={similarIdea.thumbnail_url || similarIdea.media_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${similarIdea.id}`} 
                          alt={similarIdea.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${similarIdea.id}`;
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium line-clamp-1">{similarIdea.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          @{similarIdea.profiles?.username || "user"} • {similarIdea.likes || 0} likes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this submission. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIdea} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IdeaDetail;
