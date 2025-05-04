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
  const { data, error } = await supabase
    .from('comments')
    .insert({
      idea_id: ideaId,
      user_id: userId,
      text: text
    })
    .select('*, profiles(*)');
    
  if (error) throw error;
  
  return data;
};

export const getComments = async (ideaId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(*)')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data;
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

// Search functions
export const searchIdeas = async (query: string, limit: number = 10) => {
  try {
    if (!query.trim()) return [];
    
    const searchTerm = `%${query}%`;
    
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
    const formattedResults = data.map((idea: any) => ({
      id: idea.id,
      title: idea.title,
      type: idea.type,
      description: idea.description,
      thumbnail: idea.thumbnail_url,
      user: idea.profiles ? {
        username: idea.profiles.username || "Anonymous",
        avatar: idea.profiles.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${idea.id}`,
        id: idea.profiles.id
      } : undefined
    }));
    
    return formattedResults;
  } catch (error) {
    console.error("Error in searchIdeas:", error);
    return [];
  }
};

// Search for tags
export const searchTags = async (query: string, limit: number = 5) => {
  try {
    if (!query.trim()) return [];
    
    // This uses containment operator for array elements
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
  } catch (error) {
    console.error("Error in searchTags:", error);
    return [];
  }
};
