
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import IdeaFeed from "@/components/IdeaFeed";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { IdeaProps } from "@/types/idea";
import { Loader2, Lightbulb } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<IdeaProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if it's the user's first login
  useEffect(() => {
    if (user && !localStorage.getItem('hasSeenWelcome')) {
      setShowWelcome(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user]);

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
        
        // For each idea, fetch comments and user profiles
        const ideasWithDetails = await Promise.all(
          ideasData.map(async (idea) => {
            // Fetch comments for this idea
            const { data: commentsData } = await supabase
              .from('comments')
              .select('*')
              .eq('idea_id', idea.id);
            
            // Fetch profile of the idea creator
            const { data: creatorProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', idea.user_id)
              .single();
              
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
                username: creatorProfile?.username || 'User',
                avatar: creatorProfile?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (idea.user_id || 'anon'),
                name: creatorProfile?.full_name || 'Anonymous User',
                followers: 0,
                following: 0,
                bio: creatorProfile?.bio || ''
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
                  name: 'Anonymous User',
                  followers: 0,
                  following: 0,
                  bio: ''
                },
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
        
        setIdeas(ideasWithDetails);
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
      
      {showWelcome && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="h-20 w-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb size={48} className="text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to ReelIdeas!</h2>
            <p className="text-gray-300 mb-6">
              Thanks for joining our community of innovators and creators. Share your brilliant ideas with the world and discover inspiration from others.
            </p>
            <Button 
              onClick={() => setShowWelcome(false)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-2"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      )}
      
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
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded transition-colors"
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
