
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ideas } from "@/data/ideas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, ArrowLeft, MessageSquare, Heart } from "lucide-react";
import CommentSection from "@/components/CommentSection";
import { toast } from "@/components/ui/sonner";

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<any | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    // Get current user from localStorage
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }

    // Find idea by id
    const foundIdea = ideas.find((idea) => idea.id === id);
    if (foundIdea) {
      setIdea(foundIdea);
    } else {
      navigate("/");
      toast.error("Idea not found");
    }
  }, [id, navigate]);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleConnect = () => {
    if (!currentUser) {
      toast.error("Please login to connect with the creator");
      navigate("/login");
      return;
    }
    
    toast.success("Connection request sent to the creator!");
  };

  if (!idea) return null;

  // Get ratings safely with default values
  const practicality = idea.rating?.practicality || idea.ratings?.practicality || 0;
  const innovation = idea.rating?.innovation || idea.ratings?.innovation || 0;
  const impact = idea.rating?.impact || idea.ratings?.impact || 0;

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
                  src={idea.videoUrl} 
                  poster={idea.thumbnailUrl} 
                  controls 
                  className="w-full"
                />
              ) : (
                <img 
                  src={idea.thumbnailUrl || (idea.images && idea.images[0])} 
                  alt={idea.title} 
                  className="w-full object-cover"
                />
              )}
            </div>

            {/* Title and description */}
            <h1 className="text-2xl font-bold mb-2">{idea.title}</h1>
            <div className="flex items-center text-sm text-gray-400 mb-6">
              <span>Posted by @{idea.user.username}</span>
              <span className="mx-2">•</span>
              <span>{idea.timestamp}</span>
            </div>

            <div className="prose prose-sm prose-invert max-w-none">
              <p className="whitespace-pre-line">{idea.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {idea.tags.map((tag: string, index: number) => (
                <div key={index} className="bg-gray-800 text-sm px-3 py-1 rounded-full text-gray-300">
                  #{tag}
                </div>
              ))}
            </div>

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
                  View all feedbacks
                </Button>
              </div>

              {/* Display few comments */}
              <div className="space-y-4 mt-4">
                {idea.comments.slice(0, 2).map((comment: any) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-gray-800 rounded-lg">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
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
            </div>

            {showComments && (
              <CommentSection
                comments={idea.comments}
                onClose={() => setShowComments(false)}
                currentUser={currentUser}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Creator card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={idea.user.avatar}
                    alt={idea.user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">@{idea.user.username}</h3>
                    <p className="text-sm text-gray-400">Idea Creator</p>
                  </div>
                </div>

                <Button
                  onClick={handleConnect}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  Connect with Creator
                </Button>

                {/* Contact info - only shown if logged in */}
                {currentUser && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        <span>creator@example.com</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone size={14} className="mr-2 text-gray-400" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ratings */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Idea Ratings</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Practicality</span>
                      <span>{practicality}%</span>
                    </div>
                    <div className="rating-bar">
                      <div 
                        className="rating-bar-fill rating-practicality" 
                        style={{ width: `${practicality}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Innovation</span>
                      <span>{innovation}%</span>
                    </div>
                    <div className="rating-bar">
                      <div 
                        className="rating-bar-fill rating-innovation" 
                        style={{ width: `${innovation}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Potential Impact</span>
                      <span>{impact}%</span>
                    </div>
                    <div className="rating-bar">
                      <div 
                        className="rating-bar-fill rating-impact" 
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
                </div>
              </CardContent>
            </Card>

            {/* Similar ideas */}
            <div>
              <h3 className="font-semibold mb-3">Similar Ideas</h3>
              <div className="space-y-3">
                {ideas
                  .filter(i => i.id !== idea.id)
                  .slice(0, 3)
                  .map(similarIdea => (
                    <div 
                      key={similarIdea.id}
                      className="flex gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                      onClick={() => {
                        navigate(`/idea/${similarIdea.id}`);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <img 
                        src={similarIdea.thumbnailUrl || (similarIdea.images && similarIdea.images[0])} 
                        alt={similarIdea.title} 
                        className="w-14 h-14 rounded object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium line-clamp-1">{similarIdea.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          @{similarIdea.user.username} • {similarIdea.likes} likes
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
