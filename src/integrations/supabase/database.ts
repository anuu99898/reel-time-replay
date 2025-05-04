
import { supabase } from "./client";

/**
 * Database helper functions for common operations
 */

// Like interactions
export const likeIdea = async (ideaId: string, userId: string) => {
  try {
    // First check if user already liked this idea
    const { data: existingLike } = await supabase
      .from('idea_interactions')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .eq('interaction_type', 'like')
      .maybeSingle();
    
    // If already liked, remove like
    if (existingLike) {
      // Delete the interaction
      await supabase
        .from('idea_interactions')
        .delete()
        .eq('id', existingLike.id);
      
      // Decrement the likes count
      await supabase
        .rpc('decrement_likes', { idea_id: ideaId });
        
      return false; // Return false to indicate the idea is now unliked
    } else {
      // Add new like
      await supabase
        .from('idea_interactions')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          interaction_type: 'like'
        });
      
      // Increment the likes count  
      await supabase
        .rpc('increment_likes', { idea_id: ideaId });
        
      return true; // Return true to indicate the idea is now liked
    }
  } catch (error) {
    console.error('Error in likeIdea:', error);
    throw error;
  }
};

// Comment functions
export const addComment = async (ideaId: string, userId: string, text: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: userId,
        text: text
      });
      
    if (error) throw error;
    
    // Get the newly created comment with profile info
    if (data) {
      const { data: commentData, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id, username, avatar_url, full_name
          )
        `)
        .eq('id', data[0]?.id)
        .single();
        
      if (fetchError) throw fetchError;
      return commentData;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addComment:', error);
    throw error;
  }
};

export const getComments = async (ideaId: string) => {
  try {
    // First attempt with detailed profile info join
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id, username, avatar_url, full_name
          )
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (joinError) {
      console.warn('Could not join profiles, falling back to basic query:', joinError);
      
      // Fallback to just comments if the join fails
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // For each comment, try to fetch the profile separately
      const commentsWithProfiles = await Promise.all((data || []).map(async (comment) => {
        try {
          if (comment.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', comment.user_id)
              .single();
              
            return {
              ...comment,
              profiles: profileData || {
                id: comment.user_id,
                username: "User",
                avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_id}`,
                full_name: "Anonymous"
              }
            };
          }
          return comment;
        } catch (profileError) {
          console.error('Error fetching profile for comment:', profileError);
          return comment;
        }
      }));
      
      return commentsWithProfiles;
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Vote functions
export const voteOnIdea = async (ideaId: string, userId: string, voteType: 'up' | 'down') => {
  try {
    // First check if user already voted
    const { data: existingVote } = await supabase
      .from('idea_interactions')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .in('interaction_type', ['vote_up', 'vote_down'])
      .maybeSingle();
      
    // If vote exists and is same type, remove it (toggle off)
    if (existingVote && existingVote.interaction_type === `vote_${voteType}`) {
      await supabase
        .from('idea_interactions')
        .delete()
        .eq('id', existingVote.id);
        
      return null; // Return null to indicate no vote
    }
    
    // If vote exists but different type, remove it first
    if (existingVote && existingVote.interaction_type !== `vote_${voteType}`) {
      await supabase
        .from('idea_interactions')
        .delete()
        .eq('id', existingVote.id);
    }
    
    // Add new vote
    await supabase
      .from('idea_interactions')
      .insert({
        idea_id: ideaId,
        user_id: userId,
        interaction_type: `vote_${voteType}`
      });
      
    return voteType; // Return the vote type
  } catch (error) {
    console.error('Error in voteOnIdea:', error);
    throw error;
  }
};

// Share functions
export const incrementShares = async (ideaId: string) => {
  const { data, error } = await supabase
    .rpc('increment_shares', { idea_id: ideaId });
    
  if (error) throw error;
  
  return data;
};

// Idea interactions check
export const getIdeaInteractions = async (ideaId: string, userId: string) => {
  try {
    // Use manual query instead of RPC since the RPC function might not be available
    const { data, error } = await supabase
      .from('idea_interactions')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error in getIdeaInteractions:', error);
    throw error;
  }
};

// Check user's specific interaction with an idea
export const checkUserInteraction = async (ideaId: string, userId: string, interactionType: string) => {
  try {
    const { data, error } = await supabase
      .from('idea_interactions')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .eq('interaction_type', interactionType)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data; // Convert to boolean
  } catch (error) {
    console.error(`Error checking ${interactionType}:`, error);
    return false;
  }
};

// Higher-level convenience functions
export const hasUserLikedIdea = async (ideaId: string, userId: string) => {
  return await checkUserInteraction(ideaId, userId, 'like');
};

export const getUserVoteOnIdea = async (ideaId: string, userId: string) => {
  try {
    const { data: upVote } = await supabase
      .from('idea_interactions')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .eq('interaction_type', 'vote_up')
      .maybeSingle();
      
    if (upVote) return 'up';
    
    const { data: downVote } = await supabase
      .from('idea_interactions')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .eq('interaction_type', 'vote_down')
      .maybeSingle();
      
    if (downVote) return 'down';
    
    return null;
  } catch (error) {
    console.error('Error in getUserVoteOnIdea:', error);
    return null;
  }
};

// Idea detail fetching with proper error handling
export const getIdeaDetail = async (ideaId: string) => {
  try {
    // First try with profiles join
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          profiles:user_id (
            id, username, avatar_url, full_name
          )
        `)
        .eq('id', ideaId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (joinError) {
      console.warn('Could not join profiles, falling back to basic idea query:', joinError);
      
      // Fallback to just idea if the join fails
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single();
        
      if (error) throw error;
      
      // Try to fetch the profile separately
      if (data && data.user_id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user_id)
            .single();
            
          return {
            ...data,
            profiles: profileData || {
              id: data.user_id,
              username: "Anonymous",
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${data.user_id}`,
              full_name: "Anonymous User"
            }
          };
        } catch (profileError) {
          console.error('Error fetching profile for idea:', profileError);
        }
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error fetching idea detail:', error);
    throw error;
  }
};

// Search functions
export const searchIdeas = async (query: string, limit: number = 10) => {
  try {
    if (!query.trim()) return [];
    
    const searchTerm = `%${query}%`;
    
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          id, 
          title, 
          description, 
          type, 
          media_url,
          thumbnail_url, 
          tags,
          profiles:user_id (
            id, 
            username, 
            avatar_url, 
            full_name
          )
        `)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(limit);
        
      if (error) throw error;
      
      // Transform the data to match the expected format
      const formattedResults = data.map((idea) => ({
        id: idea.id,
        title: idea.title,
        type: idea.type,
        description: idea.description,
        thumbnail: idea.thumbnail_url,
        user: idea.profiles ? {
          username: idea.profiles.username || "Anonymous",
          avatar: idea.profiles.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${idea.id}`,
          id: idea.profiles.id
        } : {
          username: "Anonymous",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${idea.id}`,
          id: ""
        }
      }));
      
      return formattedResults;
    } catch (joinError) {
      console.warn('Error with joined query:', joinError);
      
      // Fallback without the join if it fails
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          id, 
          title, 
          description, 
          type, 
          media_url,
          thumbnail_url, 
          tags,
          user_id
        `)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(limit);
        
      if (error) throw error;
      
      // Transform the data to match the expected format
      const formattedResults = data.map((idea) => ({
        id: idea.id,
        title: idea.title,
        type: idea.type || "video",
        description: idea.description,
        thumbnail: idea.thumbnail_url,
        user: {
          username: "Anonymous",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${idea.user_id || idea.id}`,
          id: idea.user_id || ""
        }
      }));
      
      return formattedResults;
    }
  } catch (error) {
    console.error("Error in searchIdeas:", error);
    return [];
  }
};

// Search for tags
export const searchTags = async (query: string, limit: number = 5) => {
  try {
    if (!query.trim()) return [];
    
    // Try containment operator approach first
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("tags")
        .filter("tags", "cs", `{${query}}`)
        .limit(limit);
        
      if (error) throw error;
      
      // Extract and flatten tags
      const allTags = data.flatMap((idea: any) => idea.tags || []);
      
      // Filter tags that match the query
      const matchingTags = allTags.filter((tag: string) => 
        tag.toLowerCase().includes(query.toLowerCase())
      );
      
      // Remove duplicates
      return [...new Set(matchingTags)];
    } catch (filterError) {
      console.warn('Error with filter query:', filterError);
      
      // Fallback to a simpler approach
      const { data, error } = await supabase
        .from("ideas")
        .select("tags")
        .limit(50);
        
      if (error) throw error;
      
      // Extract and flatten all tags
      const allTags = data.flatMap((idea: any) => idea.tags || []);
      
      // Filter tags that match the query
      const matchingTags = allTags.filter((tag: string) => 
        tag.toLowerCase().includes(query.toLowerCase())
      );
      
      // Remove duplicates and limit results
      return [...new Set(matchingTags)].slice(0, limit);
    }
  } catch (error) {
    console.error("Error in searchTags:", error);
    return [];
  }
};
