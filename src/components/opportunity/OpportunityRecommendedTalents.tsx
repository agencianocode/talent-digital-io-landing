import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, MessageSquare, Users } from 'lucide-react';

interface RecommendedTalent {
  id: string;
  full_name: string;
  avatar_url: string | null;
  title: string;
  skills: string[];
  experience_level: string | null;
  location: string;
  score: number;
}

interface OpportunityRecommendedTalentsProps {
  opportunityId: string;
}

export default function OpportunityRecommendedTalents({ opportunityId }: OpportunityRecommendedTalentsProps) {
  const navigate = useNavigate();
  const [talents, setTalents] = useState<RecommendedTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [opportunitySkills, setOpportunitySkills] = useState<string[]>([]);
  const [opportunityCategory, setOpportunityCategory] = useState<string>('');

  useEffect(() => {
    const fetchRecommendedTalents = async () => {
      try {
        setLoading(true);

        // Fetch opportunity details
        const { data: opportunity, error: oppError } = await supabase
          .from('opportunities')
          .select('skills, experience_levels, category')
          .eq('id', opportunityId)
          .single();

        if (oppError) throw oppError;

        const skills = opportunity?.skills || [];
        const experienceLevels = opportunity?.experience_levels || [];
        const category = opportunity?.category || '';

        setOpportunitySkills(skills);
        setOpportunityCategory(category);

        // Fetch talent profiles
        const { data: talentProfiles, error: profileError } = await supabase
          .from('talent_profiles')
          .select(`
            user_id,
            title,
            bio,
            skills,
            experience_level,
            availability,
            city,
            country,
            location
          `)
          .limit(100);

        if (profileError) throw profileError;

        if (!talentProfiles || talentProfiles.length === 0) {
          setTalents([]);
          setLoading(false);
          return;
        }

        // Get user IDs
        const userIds = talentProfiles.map(tp => tp.user_id);

        // Fetch user profiles
        const { data: userProfiles, error: userError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, city, country, profile_completeness')
          .in('user_id', userIds);

        if (userError) throw userError;

        // Normalize opportunity skills for comparison
        const normalizedOppSkills = skills.map(s => s.toLowerCase().trim());
        
        // Also extract keywords from opportunity title/category for broader matching
        const categoryKeywords = category.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);
        
        // Score and rank talents - ONLY include those with actual relevance
        const scoredTalents = talentProfiles
          .map(talent => {
            const userProfile = userProfiles?.find(up => up.user_id === talent.user_id);
            if (!userProfile) return null;

            let score = 0;
            let hasRelevance = false;

            // Count matching skills (exact or partial match)
            let matchingSkillsCount = 0;
            if (talent.skills && normalizedOppSkills.length > 0) {
              const talentSkillsNormalized = talent.skills.map((s: string) => s.toLowerCase().trim());
              
              for (const talentSkill of talentSkillsNormalized) {
                for (const oppSkill of normalizedOppSkills) {
                  // Exact match or partial match (one contains the other)
                  if (talentSkill === oppSkill || 
                      talentSkill.includes(oppSkill) || 
                      oppSkill.includes(talentSkill)) {
                    matchingSkillsCount++;
                    hasRelevance = true;
                    break;
                  }
                }
              }
              score += matchingSkillsCount * 20;
            }

            // Check if talent title matches opportunity category/keywords
            if (talent.title) {
              const titleLower = talent.title.toLowerCase();
              for (const keyword of categoryKeywords) {
                if (titleLower.includes(keyword)) {
                  score += 15;
                  hasRelevance = true;
                }
              }
              // Also check against category directly
              const firstWord = titleLower.split(' ')[0] || '';
              if (titleLower.includes(category.toLowerCase()) || 
                  (firstWord && category.toLowerCase().includes(firstWord))) {
                score += 25;
                hasRelevance = true;
              }
            }

            // +10 if experience level matches
            if (talent.experience_level && experienceLevels.includes(talent.experience_level)) {
              score += 10;
              hasRelevance = true;
            }

            // Only include talents with actual relevance to the opportunity
            if (!hasRelevance) return null;

            // Bonus for profile quality (but only if already relevant)
            if (userProfile.profile_completeness) {
              score += userProfile.profile_completeness / 10;
            }
            if (talent.title && talent.title.length > 10) score += 3;
            if (talent.bio && talent.bio.length > 50) score += 3;
            if (talent.skills && talent.skills.length >= 3) score += 2;

            return {
              id: talent.user_id,
              full_name: userProfile.full_name || 'Sin nombre',
              avatar_url: userProfile.avatar_url || null,
              title: talent.title || 'Sin título',
              skills: talent.skills || [],
              experience_level: talent.experience_level || null,
              location: talent.city && talent.country
                ? `${talent.city}, ${talent.country}`
                : talent.location || userProfile.city || 'Ubicación no especificada',
              score
            };
          })
          .filter(talent => talent !== null)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6) as RecommendedTalent[];

        setTalents(scoredTalents);
      } catch (error) {
        console.error('Error fetching recommended talents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedTalents();
  }, [opportunityId]);

  const handleInvite = (userId: string) => {
    // Navegar directamente al chat con parámetro user
    // La página de mensajes manejará la creación/apertura de la conversación
    navigate(`/business-dashboard/messages?user=${userId}`);
  };

  const handleViewAll = () => {
    const query = opportunitySkills.join(' ');
    navigate(`/business-dashboard/talent-discovery?q=${encodeURIComponent(query)}&category=${encodeURIComponent(opportunityCategory)}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Talentos que podrían interesarte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (talents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Talentos que podrían interesarte
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {talents.map(talent => (
            <div
              key={talent.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={talent.avatar_url || undefined} alt={talent.full_name} />
                  <AvatarFallback>
                    {talent.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{talent.full_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{talent.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{talent.location}</span>
              </div>

              {talent.experience_level && (
                <Badge variant="secondary" className="text-xs">
                  {talent.experience_level}
                </Badge>
              )}

              {talent.skills && talent.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {talent.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {talent.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{talent.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`/business-dashboard/talent-profile/${talent.id}`, '_blank')}
                >
                  Ver Perfil
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleInvite(talent.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Invitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
