import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Users, Star, MapPin, Clock } from 'lucide-react';

interface RecommendedProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  title: string;
  bio: string;
  skills: string[];
  experience_level: string;
  location: string;
  profile_completeness: number;
}

const RecommendedProfiles: React.FC = () => {
  const { company } = useSupabaseAuth();
  const [profiles, setProfiles] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendedProfiles = async () => {
      if (!company?.id) return;

      try {
        setLoading(true);
        
        // First, get active opportunities for this company to find relevant skills and requirements
        const { data: activeOpportunities } = await supabase
          .from('opportunities')
          .select('skills, category, experience_levels, contract_type')
          .eq('company_id', company.id)
          .eq('status', 'active');

        // Extract skills, categories, and experience levels from active opportunities
        const relevantSkills = new Set<string>();
        const relevantCategories = new Set<string>();
        const relevantExperienceLevels = new Set<string>();
        const relevantContractTypes = new Set<string>();
        
        (activeOpportunities || []).forEach(opp => {
          if (opp.skills) {
            opp.skills.forEach((skill: string) => relevantSkills.add(skill.toLowerCase()));
          }
          if (opp.category) {
            relevantCategories.add(opp.category);
          }
          if (opp.experience_levels) {
            opp.experience_levels.forEach((level: string) => relevantExperienceLevels.add(level));
          }
          if (opp.contract_type) {
            relevantContractTypes.add(opp.contract_type);
          }
        });

        // Get talent profiles with enhanced matching
        const { data: talentProfiles, error } = await supabase
          .from('talent_profiles')
          .select(`
            id,
            title,
            bio,
            skills,
            experience_level,
            user_id,
            primary_category_id,
            availability
          `)
          .limit(30); // Get more profiles for better matching

        if (error) {
          console.error('Error fetching talent profiles:', error);
          return;
        }

        // Get profiles data with lower completeness threshold and broader search
        const userIds = (talentProfiles || []).map(tp => tp.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, city, country, profile_completeness')
          .in('user_id', userIds)
          .gte('profile_completeness', 40); // Further lowered threshold for better recommendations

        if (profilesError) {
          console.error('Error fetching profiles data:', profilesError);
          return;
        }

        // Enhanced scoring algorithm based on multiple factors
        const scoredProfiles = (talentProfiles || [])
          .map(profile => {
            const profileData = (profilesData || []).find(p => p.user_id === profile.user_id);
            if (!profileData) return null;
            
            // Calculate comprehensive relevance score
            let relevanceScore = 0;
            
            // Skills matching (40% weight)
            if (profile.skills && relevantSkills.size > 0) {
              const matchingSkills = profile.skills.filter((skill: string) => 
                relevantSkills.has(skill.toLowerCase())
              );
              relevanceScore += matchingSkills.length * 15;
              
              // Bonus for high skill match percentage
              const skillMatchPercentage = matchingSkills.length / profile.skills.length;
              if (skillMatchPercentage > 0.5) relevanceScore += 10;
            }
            
            // Experience level matching (25% weight)
            if (profile.experience_level && relevantExperienceLevels.has(profile.experience_level)) {
              relevanceScore += 20;
            }
            
            // Profile completeness (20% weight)
            relevanceScore += (profileData.profile_completeness || 0) / 5;
            
            // Content quality bonuses (15% weight)
            if (profile.title && profile.title.length > 10) relevanceScore += 8;
            if (profile.bio && profile.bio.length > 100) relevanceScore += 7;
            if (profile.skills && profile.skills.length >= 5) relevanceScore += 5;
            
            // Availability bonus
            if (profile.availability && profile.availability !== 'not_available') {
              relevanceScore += 5;
            }
            
            // Location preference (if user has location)
            if (profileData.city && profileData.country) {
              relevanceScore += 3;
            }
            
            return {
              id: profile.id,
              full_name: profileData.full_name || 'Candidato',
              avatar_url: profileData.avatar_url || '',
              title: profile.title || 'Profesional',
              bio: profile.bio || 'Sin descripción disponible',
              skills: profile.skills || [],
              experience_level: profile.experience_level || 'No especificado',
              location: profileData.city && profileData.country 
                ? `${profileData.city}, ${profileData.country}`
                : 'Ubicación no especificada',
              profile_completeness: profileData.profile_completeness || 0,
              relevanceScore
            };
          })
          .filter(Boolean)
          .sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0))
          .slice(0, 6) as (RecommendedProfile & { relevanceScore: number })[];

        // If we have fewer than 3 profiles, get some random ones as fallback
        if (scoredProfiles.length < 3) {
          const fallbackProfiles = (talentProfiles || [])
            .filter(tp => !scoredProfiles.find(sp => sp.id === tp.id))
            .map(profile => {
              const profileData = (profilesData || []).find(p => p.user_id === profile.user_id);
              if (!profileData) return null;
              
              return {
                id: profile.id,
                full_name: profileData.full_name || 'Candidato',
                avatar_url: profileData.avatar_url || '',
                title: profile.title || 'Profesional',
                bio: profile.bio || 'Sin descripción disponible',
                skills: profile.skills || [],
                experience_level: profile.experience_level || 'No especificado',
                location: profileData.city && profileData.country 
                  ? `${profileData.city}, ${profileData.country}`
                  : 'Ubicación no especificada',
                profile_completeness: profileData.profile_completeness || 0,
                relevanceScore: 0
              };
            })
            .filter(Boolean)
            .slice(0, 6 - scoredProfiles.length) as (RecommendedProfile & { relevanceScore: number })[];
            
          scoredProfiles.push(...fallbackProfiles);
        }
        
        const formattedProfiles = scoredProfiles.map(({ relevanceScore, ...profile }) => profile);

        setProfiles(formattedProfiles);
      } catch (error) {
        console.error('Error in loadRecommendedProfiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendedProfiles();
  }, [company]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Perfiles Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Perfiles Recomendados
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Candidatos destacados para tus oportunidades activas
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <div key={profile.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback>
                      {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{profile.full_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {profile.profile_completeness}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{profile.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{profile.location}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{profile.experience_level}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="ml-2 flex-shrink-0">
                  Ver Perfil
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay perfiles recomendados disponibles</p>
              <p className="text-xs">
                {!company?.id 
                  ? 'Configura tu empresa para ver recomendaciones'
                  : 'Los candidatos aparecerán aquí cuando completen sus perfiles'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedProfiles;