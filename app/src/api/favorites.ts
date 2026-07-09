const SUPABASE_URL = 'https://whypwqhdfxtjjenkhkwt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ';

export const favoritesApi = {
  getFavorites: async (userId: string | number) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/favorites?select=*,target_user:users!favorites_target_user_id_fkey(*)&user_id=eq.${userId}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    return response.json();
  },
  
  checkIsFavorite: async (userId: string | number, targetUserId: string | number) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/favorites?user_id=eq.${userId}&target_user_id=eq.${targetUserId}&select=id`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    return Array.isArray(data) && data.length > 0;
  },

  addFavorite: async (userId: string | number, targetUserId: string | number) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/favorites`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        target_user_id: targetUserId
      })
    });
    return response.json();
  },

  removeFavorite: async (userId: string | number, targetUserId: string | number) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/favorites?user_id=eq.${userId}&target_user_id=eq.${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    return response.ok;
  }
};
