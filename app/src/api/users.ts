import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { UserProfile } from '../shared/types/app';

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const [{ data: users, error: usersError }, { data: packages, error: packagesError }] = await Promise.all([
        supabase.from('users').select('*'),
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
          avatar: u.profile_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          role: u.gender === 'female' ? 'girl' : 'boy',
          bio: 'New user',
          isOnline: u.is_online,
          isPremium: false,
          isVerified: u.is_active,
          rating: u.average_rating || 0,
          totalCalls: 0,
          pricePerMinute: pkg ? pkg.coins : (u.call_rate || 0),
          packageName: pkg ? pkg.name : undefined,
          languages: ['English'],
          interests: [],
          city: u.city || 'Unknown'
        };
      });
    }
  });
};
