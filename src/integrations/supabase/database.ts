
import { supabase } from "./client";

/**
 * Database helper functions for common operations
 */

// Like interactions
export const likeIdea = async (ideaId: string, userId: string) => {
  const { data, error } = await supabase
    .rpc('increment_likes', { idea_id: ideaId });
    
  if (error) throw error;
  
  return data;
};

export const unlikeIdea = async (ideaId: string, userId: string) => {
  const { data, error } = await supabase
    .rpc('decrement_likes', { idea_id: ideaId });
    
  if (error) throw error;
  
  return data;
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
  // First check if user already voted
  const { data: existingVote } = await supabase
    .from('idea_interactions')
    .select('*')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .in('interaction_type', ['vote_up', 'vote_down'])
    .single();
    
  // If vote exists and is different, remove it
  if (existingVote && existingVote.interaction_type !== `vote_${voteType}`) {
    await supabase
      .from('idea_interactions')
      .delete()
      .eq('id', existingVote.id);
  }
  
  // If no vote or different vote, add new vote
  if (!existingVote || existingVote.interaction_type !== `vote_${voteType}`) {
    const { error } = await supabase
      .from('idea_interactions')
      .insert({
        idea_id: ideaId,
        user_id: userId,
        interaction_type: `vote_${voteType}`
      });
      
    if (error) throw error;
  }
  
  return true;
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
  const { data, error } = await supabase
    .from('idea_interactions')
    .select('*')
    .eq('idea_id', ideaId)
    .eq('user_id', userId);
    
  if (error) throw error;
  
  return data;
};
