import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IdeaProps } from "@/types/idea";
import CommentSectionWrapper from "@/components/CommentSectionWrapper";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import IdeaActions from "@/components/IdeaActions";
import ProfilePreview from "@/components/ProfilePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tag, Star, MessageSquare, AlertTriangle, ArrowLeft, Share2, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount } from "@/data/ideas";
import { toast } from "sonner";
import { hasUserLikedIdea, likeIdea, addComment, getComments, getIdeaDetail } from "@/integrations/supabase/database";
import { useIsMobile } from "@/hooks/use-mobile";
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

// Define the shape of what we get from Supabase
interface IdeaData {
  id: string;
  title: string;
  description: string;
  type: string;
  media_url: string | null;
  thumbnail_url: string | null;
  likes: number | null;
  shares: number | null;
  tags: string[] | null;
  questions: any[] | null;
  created_at: string | null;
  user_id: string | null;
  profiles?: {
    id: string | null;
    username: string | null;
    avatar_url: string | null;
    full_name: string | null;
  } | null;
}

// Define the possible question types to help TypeScript
interface StringQuestion {
  type: 'string';
  value: string;
}

interface ObjectQuestion {
  type: 'object';
  question?: string;
  text?: string;
  answer?: string;
  response?: string;
  [key: string]: any; // Allow for other properties
}

type QuestionType = StringQuestion | ObjectQuestion | string;

const IdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Fetch idea details using our improved database function
  const { data: idea, isLoading, error } = useQuery({
    queryKey: ['idea', id],
    queryFn: async () => {
      if (!id) throw new Error('Idea ID is required');
      
      try {
        // Use our improved function
        const data = await getIdeaDetail(id);
        
        if (!data) throw new Error('Idea not found');
        
        // Safely access profiles data with proper type checking
        const profileData = data.profiles && typeof data.profiles === 'object' ? data.profiles : null;
        
        // Transform the data to match IdeaProps
        const transformedIdea: IdeaProps = {
          id: data.id,
          title: data.title,
          description: data.description,
          type: data.type as "video" | "image" | "text",
          media: data.media_url || undefined,
          thumbnailUrl: data.thumbnail_url || undefined,
          likes: data.likes || 0,
          comments: [],
          shares: data.shares || 0,
          timestamp: data.created_at || new Date().toISOString(),
          createdAt: data.created_at || undefined,
          tags: data.tags || [],
          ratings: undefined, // This will be populated later if needed
          user: {
            id: profileData?.id || data.user_id || 'anonymous',
            username: profileData?.username || 'Anonymous',
            avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${data.user_id || id}`,
            name: profileData?.full_name || 'Anonymous User',
            followers: 0,
            following: 0,
            bio: ''
          },
          questions: data.questions || []
        };
        
        return transformedIdea;
      } catch (error) {
        console.error("Error fetching idea:", error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!id
  });
  
  // Check if user has liked this idea
  useEffect(() => {
    if (!user || !idea) return;
    
    const checkLikeStatus = async () => {
      try {
        const liked = await hasUserLikedIdea(idea.id, user.id);
        setIsLiked(liked);
        setLikesCount(idea.likes);
        setSharesCount(idea.shares);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    checkLikeStatus();
  }, [user, idea]);
  
  // Fetch comments
  useEffect(() => {
    if (!id) return;
    
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const commentsData = await getComments(id);
        
        // Transform comments to match the expected format
        const formattedComments = commentsData.map((comment: any) => {
          // Safely access profiles data
          const profileData = comment.profiles && typeof comment.profiles === 'object' ? comment.profiles : null;
          
          return {
            id: comment.id,
            text: comment.text,
            timestamp: new Date(comment.created_at).toLocaleString(),
            user: {
              id: profileData?.id || comment.user_id || "anonymous",
              username: profileData?.username || "Anonymous",
              avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_id || "anonymous"}`,
              name: profileData?.full_name || "Anonymous User",
              followers: 0,
              following: 0,
              bio: ""
            },
            likes: 0
          };
        });
        
        setComments(formattedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };
    
    fetchComments();
  }, [id]);
  
  const handleLike = async () => {
    if (!user || !idea) {
      toast.error('You need to be logged in to like ideas');
      return;
    }
    
    try {
      const newLikeStatus = await likeIdea(idea.id, user.id);
      setIsLiked(newLikeStatus);
      setLikesCount(prev => newLikeStatus ? prev + 1 : prev - 1);
      
      if (newLikeStatus) {
        toast.success('Idea liked!');
      }
    } catch (error) {
      console.error('Error liking idea:', error);
      toast.error('Failed to like idea');
    }
  };
  
  const handleShare = async () => {
    if (!idea) return;
    
    try {
      // Copy link to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/idea/${idea.id}`);
      toast.success('Link copied to clipboard!');
      
      // Increment share count
      setSharesCount(prev => prev + 1);
      
      // Update in database
      await supabase.rpc('increment_shares', { idea_id: idea.id });
    } catch (error) {
      console.error('Error sharing idea:', error);
      toast.error('Failed to share');
    }
  };
  
  const handleCommentSubmit = async (text: string) => {
    if (!user || !id) {
      toast.error('You need to be logged in to comment');
      return Promise.reject(new Error('User not logged in'));
    }
    
    try {
      await addComment(id, user.id, text);
      
      // Refresh comments
      const commentsData = await getComments(id);
      const formattedComments = commentsData.map((comment: any) => {
        // Safely access profiles data
        const profileData = comment.profiles && typeof comment.profiles === 'object' ? comment.profiles : null;
        
        return {
          id: comment.id,
          text: comment.text,
          timestamp: new Date(comment.created_at).toLocaleString(),
          user: {
            id: profileData?.id || comment.user_id || "anonymous",
            username: profileData?.username || "Anonymous",
            avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_id || "anonymous"}`,
            name: profileData?.full_name || "Anonymous User",
            followers: 0,
            following: 0,
            bio: ""
          },
          likes: 0
        };
      });
      
      setComments(formattedComments);
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding comment:', error);
      return Promise.reject(error);
    }
  };
  
  const handleDeleteIdea = async () => {
    if (!user || !idea) return;
    
    try {
      // Check if user is the owner
      if (user.id !== idea.user.id) {
        toast.error('You can only delete your own ideas');
        return;
      }
      
      // Delete the idea
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', idea.id);
        
      if (error) throw error;
      
      toast.success('Idea deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    );
  }
  
  if (error || !idea) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex flex-col items-center justify-center h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Idea not found</h1>
          <p className="text-gray-400 mb-6">The idea you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }
  
  // Check if this is a problem-based submission
  const hasProblem = idea.questions && idea.questions.length > 0;
  
  // Comments modal
  const commentSection = showComments && (
    <CommentSectionWrapper
      ideaId={id || ""}
      comments={comments}
      onClose={() => setShowComments(false)}
      currentUser={user ? {
        id: user.id,
        username: user.email?.split('@')[0] || 'User',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
        name: user.email?.split('@')[0] || 'User',
        followers: 0,
        following: 0,
        bio: ''
      } : null}
      onCommentSubmit={handleCommentSubmit}
      fetchComments={async () => {
        if (!id) return;
        try {
          setLoadingComments(true);
          const commentsData = await getComments(id);
          const formattedComments = commentsData.map((comment: any) => {
            // Safely access profiles data
            const profileData = comment.profiles && typeof comment.profiles === 'object' ? comment.profiles : null;
            
            return {
              id: comment.id,
              text: comment.text,
              timestamp: new Date(comment.created_at).toLocaleString(),
              user: {
                id: profileData?.id || comment.user_id || "anonymous",
                username: profileData?.username || "Anonymous",
                avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_id || "anonymous"}`,
                name: profileData?.full_name || "Anonymous User",
                followers: 0,
                following: 0,
                bio: ""
              },
              likes: 0
            };
          });
          
          setComments(formattedComments);
        } catch (error) {
          console.error('Error fetching comments:', error);
        } finally {
          setLoadingComments(false);
        }
      }}
    />
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-16 pb-16">
        {/* Back button for mobile */}
        {isMobile && (
          <div className="fixed top-16 left-0 z-30 p-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-black/50 backdrop-blur-sm rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </Button>
          </div>
        )}
        
        {/* Main content */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Desktop header with back button */}
          {!isMobile && (
            <div className="py-4">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            </div>
          )}
          
          {/* Idea content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Media column */}
            <div className="md:col-span-2">
              {idea.type === "video" ? (
                <div className="aspect-[9/16] md:aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <VideoPlayer
                    videoUrl={idea.media || ""}
                    inView={true}
                    className="w-full h-full object-contain"
                    preload="auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  {idea.thumbnailUrl ? (
                    <img 
                      src={idea.thumbnailUrl} 
                      alt={idea.title} 
                      className="w-full h-64 md:h-96 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${idea.id}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 md:h-96 bg-gray-800 flex items-center justify-center">
                      <Star size={64} className="text-gray-700" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Info column */}
            <div className="md:col-span-1">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  {/* User info */}
                  <div className="mb-4">
                    <ProfilePreview user={idea.user} />
                  </div>
                  
                  <Separator className="my-4 bg-gray-800" />
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4">
                      <Button 
                        variant={isLiked ? "default" : "outline"} 
                        size="sm"
                        className={cn(
                          "flex items-center gap-2",
                          isLiked && "bg-yellow-400 text-black hover:bg-yellow-500"
                        )}
                        onClick={handleLike}
                      >
                        <Star size={16} className={isLiked ? "fill-black" : ""} />
                        {formatCount(likesCount)}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setShowComments(true)}
                      >
                        <MessageSquare size={16} />
                        {formatCount(comments.length)}
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleShare}
                    >
                      <Share2 size={16} />
                    </Button>
                  </div>
                  
                  {/* Owner actions */}
                  {user && user.id === idea.user.id && (
                    <div className="flex gap-2 mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 flex-1"
                        onClick={() => navigate(`/edit/${idea.id}`)}
                      >
                        <Edit size={16} />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="flex items-center gap-2 flex-1"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </div>
                  )}
                  
                  {/* Problem indicator */}
                  {hasProblem && (
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-yellow-400 mb-1">
                        <AlertTriangle size={16} />
                        <span className="font-medium">Problem Statement</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        This is a problem that needs solutions. Share your ideas to solve it!
                      </p>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {idea.tags.map((tag) => (
                          <Badge 
                            key={tag}
                            variant="outline"
                            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700"
                          >
                            <Tag size={12} />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Created date */}
                  <div className="text-xs text-gray-400">
                    Posted {new Date(idea.createdAt || idea.timestamp).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Idea details */}
          <div className="mt-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-gray-900 border-b border-gray-800 rounded-none w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                {hasProblem && (
                  <TabsTrigger value="problem">Problem Details</TabsTrigger>
                )}
                <TabsTrigger value="discussion">
                  Discussion ({comments.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="pt-4">
                <h1 className="text-2xl font-bold mb-2">{idea.title}</h1>
                <p className="text-gray-300 whitespace-pre-wrap">{idea.description}</p>
              </TabsContent>
              
              {hasProblem && (
                <TabsContent value="problem" className="pt-4">
                  <h2 className="text-xl font-bold mb-4">Problem Statement</h2>
                  <div className="space-y-4">
                    {idea.questions && idea.questions.map((question, index) => {
                      // Handle different question formats
                      let questionText = "";
                      let answerText = "";
                      
                      if (typeof question === 'string') {
                        questionText = question;
                        answerText = "";
                      } else if (typeof question === 'object' && question !== null) {
                        const q = question as Record<string, any>;
                        questionText = q.question || q.text || JSON.stringify(q);
                        answerText = q.answer || q.response || "";
                      }
                      
                      return (
                        <div key={index} className="bg-gray-900 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{questionText}</h3>
                          {answerText && <p className="text-gray-300">{answerText}</p>}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="discussion" className="pt-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Discussion</h2>
                  {loadingComments ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.username}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=anon`;
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comment.user.username}</span>
                              <span className="text-xs text-gray-400">{comment.timestamp}</span>
                            </div>
                            <p className="text-gray-300">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                      
                      {comments.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowComments(true)}
                        >
                          View all {comments.length} comments
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquare size={32} className="mx-auto mb-2 text-gray-600" />
                      <p className="text-gray-400">No comments yet</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setShowComments(true)}
                      >
                        Be the first to comment
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {commentSection}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your idea
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteIdea}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IdeaDetail;
