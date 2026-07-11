import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { UserProfile } from '../shared/types/app';

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const [{ data: users, error: usersError }, { data: packages, error: packagesError }] = await Promise.all([
        supabase.from('users').select('*, user_languages(language), user_interests(interest)'),
        supabase.from('packages').select('*')
      ]);

      if (usersError) throw usersError;
      if (packagesError) throw packagesError;

      return (users || []).map((u: any): UserProfile => {
        const pkg = (packages || []).find((p: any) => String(p.id) === String(u.call_package_id));
        return {
          id: u.id,
          name: u.name || 'Unknown',
          age: u.age || 20,
          avatar: u.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random&color=fff&size=256`,
          role: u.gender === 'female' ? 'girl' : 'boy',
          bio: u.bio || 'Hi, I am new here!',
          isOnline: u.last_seen_at ? (new Date().getTime() - new Date(u.last_seen_at).getTime() < 60000) : false,
          isPremium: false,
          isVerified: u.is_id_verified && u.is_active,
          rating: parseFloat(u.average_rating) || 0,
          totalCalls: u.total_ratings || 0,
          pricePerMinute: pkg ? parseFloat(pkg.coins || pkg.price) : 0,
          packageName: pkg ? pkg.name : undefined,
          languages: u.user_languages?.map((l: any) => l.language) || ['English', 'Hindi'],
          interests: u.user_interests?.map((i: any) => i.interest) || ['Music', 'Movies', 'Travel'],
          city: u.city || 'Unknown',
          lastSeen: u.last_seen_at || undefined
        };
      });
    }
  });
};
