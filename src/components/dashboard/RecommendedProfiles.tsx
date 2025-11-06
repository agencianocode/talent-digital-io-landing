import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { Users, MapPin, Clock } from 'lucide-react';
import { TalentCardAcademyBadge } from '@/components/talent/TalentCardAcademyBadge';

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
  email: string;
}

const RecommendedProfiles: React.FC = () => {
  const { activeCompany } = useCompany();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendedProfiles = async () => {
      try {
        setLoading(true);

        // Get active opportunities for this company to find relevant skills
        const { data: activeOpportunities } = await supabase
          .from('opportunities')
          .select('skills, category, experience_levels')
          .eq('company_id', activeCompany?.id || '')
          .eq('status', 'active');

        // Extract relevant skills and criteria
        const relevantSkills = new Set<string>();
        const relevantExperienceLevels = new Set<string>();
        
        (activeOpportunities || []).forEach(opp => {
          if (opp.skills) {
            opp.skills.forEach((skill: string) => relevantSkills.add(skill.toLowerCase()));
          }
          if (opp.experience_levels) {
            opp.experience_levels.forEach((level: string) => relevantExperienceLevels.add(level));
          }
        });

        // Get all talent profiles
        const { data: talentProfiles, error } = await supabase
          .from('talent_profiles')
          .select('user_id, title, bio, skills, experience_level, availability')
          .limit(50);

        if (error) {
          console.error('Error fetching talent profiles:', error);
          setProfiles([]);
          setLoading(false);
          return;
        }

        // Get user profiles data (without completeness filter)
        const userIds = (talentProfiles || []).map(tp => tp.user_id);
        
        if (userIds.length === 0) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, city, country, profile_completeness')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles data:', profilesError);
          setProfiles([]);
          setLoading(false);
          return;
        }

        // Obtener emails de auth.users usando RPC
        const { data: userEmails, error: emailsError } = await supabase
          .rpc('get_user_emails_by_ids', { user_ids: userIds });

        if (emailsError) {
          console.error('Error fetching user emails:', emailsError);
        }

        // Crear un mapa de user_id a email
        const emailMap: Record<string, string> = {};
        if (userEmails) {
          userEmails.forEach((item: any) => {
            emailMap[item.user_id] = item.email;
          });
        }

        // Score and sort profiles
        const scoredProfiles = (talentProfiles || [])
          .map(profile => {
            const profileData = (profilesData || []).find(p => p.user_id === profile.user_id);
            if (!profileData) return null;
            
            let relevanceScore = 0;
            
            // Skills matching
            if (profile.skills && relevantSkills.size > 0) {
              const matchingSkills = profile.skills.filter((skill: string) => 
                relevantSkills.has(skill.toLowerCase())
              );
              relevanceScore += matchingSkills.length * 15;
            }
            
            // Experience level matching
            if (profile.experience_level && relevantExperienceLevels.has(profile.experience_level)) {
              relevanceScore += 20;
            }
            
            // Profile completeness
            relevanceScore += (profileData.profile_completeness || 0) / 5;
            
            // Content quality
            if (profile.title && profile.title.length > 10) relevanceScore += 8;
            if (profile.bio && profile.bio.length > 50) relevanceScore += 7;
            if (profile.skills && profile.skills.length >= 3) relevanceScore += 5;
            
            return {
              id: profile.user_id,
              full_name: profileData.full_name || 'Candidato',
              avatar_url: profileData.avatar_url || '',
              title: profile.title || 'Profesional',
              bio: profile.bio || '',
              skills: profile.skills || [],
              experience_level: profile.experience_level || 'Sin especificar',
              location: [profileData.city, profileData.country].filter(Boolean).join(', ') || 'Sin ubicación',
              profile_completeness: profileData.profile_completeness || 0,
              email: emailMap[profile.user_id] || '',
              relevanceScore
            };
          })
          .filter(Boolean)
          .sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0))
          .slice(0, 6) as (RecommendedProfile & { relevanceScore: number })[];

        const formattedProfiles = scoredProfiles.map(({ relevanceScore, ...profile }) => profile);
        setProfiles(formattedProfiles);
      } catch (error) {
        console.error('Error in loadRecommendedProfiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendedProfiles();
  }, [activeCompany]);

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Perfiles Recomendados
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Candidatos destacados para tus oportunidades activas
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/business-dashboard/talent-discovery', '_self')}
          >
            Buscar Talento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {profiles.length > 0 ? (
          <div className="relative">
            {/* Contenedor horizontal con scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex-shrink-0 w-72 border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white flex flex-col h-[420px] cursor-pointer"
                  onClick={() => navigate(`/business-dashboard/talent-profile/${profile.id}`)}
                >
                  {/* Contenido que crece */}
                  <div className="flex-1 flex flex-col">
                    {/* Avatar y Badge de Academia */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                        <AvatarFallback className="text-lg">
                          {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Badge de Academia */}
                      {profile.email && (
                        <div className="flex-1 min-w-0">
                          <TalentCardAcademyBadge 
                            userId={profile.id} 
                            userEmail={profile.email}
                            size="sm"
                            compact={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Nombre y Título */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-base mb-1 truncate">{profile.full_name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {profile.title}
                      </p>
                    </div>

                    {/* Ubicación y Experiencia */}
                    <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{profile.experience_level}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-3 min-h-[2rem]">
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

                    {/* Bio (opcional) - Crece para llenar espacio */}
                    <div className="flex-1 mb-3">
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botón - Siempre al final */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/business-dashboard/talent-profile/${profile.id}`, '_blank');
                    }}
                  >
                    Ver Perfil
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay perfiles recomendados disponibles</p>
            <p className="text-xs">
              {!activeCompany?.id 
                ? 'Configura tu empresa para ver recomendaciones'
                : 'Los candidatos aparecerán aquí cuando completen sus perfiles'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedProfiles;