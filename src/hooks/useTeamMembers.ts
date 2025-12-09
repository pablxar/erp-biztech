import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member';
}

export function useTeamMembers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      // Get all users with roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      if (!rolesData || rolesData.length === 0) {
        return [];
      }
      
      // Get profiles for those users
      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Combine data
      return profilesData?.map(profile => {
        const roleEntry = rolesData.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: roleEntry?.role || 'member',
        } as TeamMember;
      }) || [];
    },
    enabled: !!user,
  });
}
