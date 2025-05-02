
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import IdeaFeed from "@/components/IdeaFeed";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { IdeaProps } from "@/types/idea";
import { Loader2 } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ideas, setIdeas] = useState<IdeaProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUser(data.session.user);
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        
        // Fetch all ideas
        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('*, idea_ratings(*)')
          .order('created_at', { ascending: false });
          
        if (ideasError) throw ideasError;
        
        // For each idea, fetch comments
        const ideasWithComments = await Promise.all(
          ideasData.map(async (idea) => {
            const { data: commentsData } = await supabase
              .from('comments')
              .select('*')
              .eq('idea_id', idea.id);
              
            // Convert the database type value to one of our accepted types
            // Ensure type is one of: "video", "image", "text"
            let ideaType: "video" | "image" | "text" = "text"; // Default to text
            if (idea.type === "video") ideaType = "video";
            else if (idea.type === "image") ideaType = "image";
            
            // Transform the data to match our IdeaProps interface
            const transformedIdea: IdeaProps = {
              id: idea.id,
              title: idea.title,
              description: idea.description,
              type: ideaType,
              media: idea.media_url,
              thumbnailUrl: idea.thumbnail_url,
              user: {
                id: idea.user_id || 'anonymous',
                username: 'User', // In a real app, you'd fetch the username
                avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=' + (idea.user_id || 'anon'),
                // Add the missing properties required by the User type
                name: 'Anonymous User',
                followers: 0,
                following: 0,
                bio: ''
              },
              likes: idea.likes || 0,
              comments: commentsData?.map(comment => ({
                id: comment.id,
                text: comment.text,
                timestamp: new Date(comment.created_at).toLocaleString(),
                user: {
                  id: comment.user_id || 'anonymous',
                  username: 'User',
                  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=' + (comment.user_id || 'anon'),
                  // Add the missing properties required by the User type
                  name: 'Anonymous User',
                  followers: 0,
                  following: 0,
                  bio: ''
                },
                // Add the missing 'likes' property required by the Comment type
                likes: 0
              })) || [],
              shares: idea.shares || 0,
              timestamp: new Date(idea.created_at).toLocaleString(),
              tags: idea.tags || [],
              ratings: idea.idea_ratings[0] ? {
                practicality: idea.idea_ratings[0].practicality,
                innovation: idea.idea_ratings[0].innovation,
                impact: idea.idea_ratings[0].impact,
              } : undefined
            };
            
            return transformedIdea;
          })
        );
        
        setIdeas(ideasWithComments);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdeas();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-24 pb-2 px-0 sm:px-4 max-w-screen-md mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            <p className="mt-4 text-gray-400">Loading ideas...</p>
          </div>
        ) : ideas.length > 0 ? (
          <IdeaFeed ideas={ideas} className="idea-feed" />
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
            <h2 className="text-2xl font-bold mb-2">No ideas yet</h2>
            <p className="text-gray-400 mb-6">Be the first to share your innovative idea!</p>
            <button 
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded"
            >
              Upload Your Idea
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
