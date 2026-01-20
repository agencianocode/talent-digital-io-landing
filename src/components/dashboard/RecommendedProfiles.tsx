import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { Users, MapPin, Clock, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { TalentCardAcademyBadge } from '@/components/talent/TalentCardAcademyBadge';
import { stripHtml } from '@/lib/utils';

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
  video_presentation_url: string | null;
  updated_at: string;
  last_activity: string | null;
  is_verified: boolean;
}

const RecommendedProfiles: React.FC = () => {
  const { activeCompany } = useCompany();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Funciones de scroll suave
  const scrollLeft = () => {
    const cardWidth = 288;
    const gap = 16;
    scrollContainerRef.current?.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
  };

  const scrollRight = () => {
    const cardWidth = 288;
    const gap = 16;
    scrollContainerRef.current?.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;
    if (!hasOverflow) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    setShowLeftArrow(container.scrollLeft > 10);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setTimeout(checkScrollButtons, 100);

    container.addEventListener('scroll', checkScrollButtons);
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [profiles]);

  useEffect(() => {
    const loadRecommendedProfiles = async () => {
      try {
        setLoading(true);

        if (!activeCompany?.id) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        // Step 1: Get opportunities by priority (active > draft > closed)
        let targetCategories: string[] = [];

        // Try active opportunities first
        const { data: activeOpps } = await supabase
          .from('opportunities')
          .select('category')
          .eq('company_id', activeCompany.id)
          .eq('status', 'active');

        if (activeOpps && activeOpps.length > 0) {
          targetCategories = [...new Set(activeOpps.map(o => o.category).filter(Boolean))];
        } else {
          // Try draft opportunities
          const { data: draftOpps } = await supabase
            .from('opportunities')
            .select('category')
            .eq('company_id', activeCompany.id)
            .eq('status', 'draft');

          if (draftOpps && draftOpps.length > 0) {
            targetCategories = [...new Set(draftOpps.map(o => o.category).filter(Boolean))];
          } else {
            // Try closed opportunities
            const { data: closedOpps } = await supabase
              .from('opportunities')
              .select('category')
              .eq('company_id', activeCompany.id)
              .eq('status', 'closed');

            if (closedOpps && closedOpps.length > 0) {
              targetCategories = [...new Set(closedOpps.map(o => o.category).filter(Boolean))];
            }
          }
        }

        // Step 2: Get verified students (academy students enrolled or graduated)
        const { data: academyStudents } = await supabase
          .from('academy_students')
          .select('student_email')
          .in('status', ['enrolled', 'graduated']);

        const verifiedEmails = new Set((academyStudents || []).map(s => s.student_email.toLowerCase()));

        if (verifiedEmails.size === 0) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        // Step 3: Get all talent profiles with their profile data
        // We'll join profiles and filter by verified emails later
        const { data: talentProfiles } = await supabase
          .from('talent_profiles')
          .select('user_id, title, bio, skills, experience_level, video_presentation_url, primary_category_id');

        if (!talentProfiles || talentProfiles.length === 0) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        const talentUserIds = talentProfiles.map(tp => tp.user_id);

        // Step 4: Get profile data and match with verified emails using RPC
        const { data: userEmailsData } = await supabase
          .rpc('get_user_emails_by_ids', { user_ids: talentUserIds }) as {
            data: Array<{ user_id: string; email: string; avatar_url: string | null }> | null;
            error: any;
          };

        // Create map of user_id to email
        const userIdToEmail: Record<string, string> = {};
        (userEmailsData || []).forEach(item => {
          userIdToEmail[item.user_id] = item.email.toLowerCase();
        });

        // Filter to only verified users
        const verifiedTalentProfiles = talentProfiles.filter(tp => {
          const email = userIdToEmail[tp.user_id];
          return email && verifiedEmails.has(email);
        });

        if (verifiedTalentProfiles.length === 0) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        const verifiedUserIds = verifiedTalentProfiles.map(tp => tp.user_id);

        // Step 5: Get profile data
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, city, country, profile_completeness, last_activity, updated_at')
          .in('user_id', verifiedUserIds);

        // Step 6: Get categories to filter by opportunity categories
        let categoryIds: string[] = [];
        if (targetCategories.length > 0) {
          const { data: categories } = await supabase
            .from('professional_categories')
            .select('id, name');

          if (categories) {
            // Map category names to IDs (categories might be stored by name in opportunities)
            categoryIds = categories
              .filter(c => targetCategories.includes(c.name))
              .map(c => c.id);
          }
        }

        // Step 7: Build profiles with all data
        const enrichedProfiles = verifiedTalentProfiles
          .map(tp => {
            const profileData = (profilesData || []).find(p => p.user_id === tp.user_id);
            if (!profileData) return null;

            // Check if user has completed onboarding (real name + avatar)
            const hasRealName = profileData.full_name && 
              !profileData.full_name.includes('@') && 
              profileData.full_name.length > 2;
            const hasAvatar = !!profileData.avatar_url;
            
            if (!hasRealName || !hasAvatar) return null;

            const finalAvatarUrl = profileData.avatar_url && !profileData.avatar_url.startsWith('blob:') 
              ? profileData.avatar_url 
              : '';

            return {
              id: tp.user_id,
              full_name: profileData.full_name || 'Candidato',
              avatar_url: finalAvatarUrl,
              title: tp.title || 'Profesional',
              bio: tp.bio || '',
              skills: tp.skills || [],
              experience_level: tp.experience_level || 'Sin especificar',
              location: [profileData.city, profileData.country].filter(Boolean).join(', ') || 'Sin ubicación',
              profile_completeness: profileData.profile_completeness || 0,
              email: userIdToEmail[tp.user_id] || '',
              video_presentation_url: tp.video_presentation_url,
              updated_at: profileData.updated_at,
              last_activity: profileData.last_activity,
              is_verified: true,
              primary_category_id: tp.primary_category_id
            };
          })
          .filter(Boolean) as (RecommendedProfile & { primary_category_id: string | null })[];

        // Step 8: Filter by category if applicable
        let filteredProfiles = enrichedProfiles;
        if (categoryIds.length > 0) {
          const categoryFiltered = enrichedProfiles.filter(p => 
            p.primary_category_id && categoryIds.includes(p.primary_category_id)
          );
          // Only use category filter if we have results, otherwise show all verified
          if (categoryFiltered.length > 0) {
            filteredProfiles = categoryFiltered;
          }
        }

        // Step 9: Apply default sorting (same as TalentDiscovery)
        // 1st: Profile 100% complete (=100)
        // 2nd: Last activity (latest first)
        // 3rd: Verified (all are verified here)
        // 4th: Has video
        const sortedProfiles = filteredProfiles.sort((a, b) => {
          // 1. Profile complete first (usando cálculo unificado de 10 campos = 100%)
          const aComplete = (a.profile_completeness || 0) === 100 ? 1 : 0;
          const bComplete = (b.profile_completeness || 0) === 100 ? 1 : 0;
          if (aComplete !== bComplete) return bComplete - aComplete;

          // 2. Last activity (most recent first) - usar last_activity
          const aDate = new Date(a.last_activity || a.updated_at || 0).getTime();
          const bDate = new Date(b.last_activity || b.updated_at || 0).getTime();
          if (aDate !== bDate) return bDate - aDate;

          // 3. Has video first
          const aVideo = a.video_presentation_url ? 1 : 0;
          const bVideo = b.video_presentation_url ? 1 : 0;
          return bVideo - aVideo;
        });

        // Step 10: Take first 12 profiles
        const finalProfiles = sortedProfiles.slice(0, 12).map(({ primary_category_id, ...profile }) => profile);
        setProfiles(finalProfiles);

      } catch (error) {
        console.error('Error in loadRecommendedProfiles:', error);
        setProfiles([]);
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
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Perfiles Recomendados
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Candidatos verificados por academias
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-[10px] sm:text-sm px-1.5 sm:px-3 py-1 sm:py-2 h-auto whitespace-nowrap shrink-0"
            onClick={() => window.open('/business-dashboard/talent-discovery', '_self')}
          >
            <span className="hidden sm:inline">Buscar Talento</span>
            <span className="sm:hidden">Buscar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-hidden">
        {profiles.length > 0 ? (
          <div className="relative">
            {showLeftArrow && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 shadow-xl bg-white hover:bg-gray-50 rounded-full border-2 h-7 w-7"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            )}

            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style>{`
                .overflow-x-auto::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex-shrink-0 w-72 border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white flex flex-col h-[420px] cursor-pointer snap-start"
                  onClick={() => navigate(`/business-dashboard/talent-profile/${profile.id}`)}
                >
                  <div className="flex-1 flex flex-col">
                    {/* Avatar y Badge de Academia */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                        <AvatarFallback className="text-lg">
                          {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {profile.email && (
                        <div className="flex-1 min-w-0">
                          <TalentCardAcademyBadge 
                            userId={profile.id} 
                            userEmail={profile.email}
                            size="sm"
                            compact={true}
                          />
                        </div>
                      )}
                    </div>

                    {/* Nombre y Título con icono de video */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base truncate">{profile.full_name}</h4>
                        {profile.video_presentation_url && (
                          <span title="Tiene video de presentación">
                            <Video className="h-4 w-4 text-primary stroke-[2.5] flex-shrink-0" />
                          </span>
                        )}
                      </div>
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

                    {/* Bio */}
                    <div className="flex-1 mb-3">
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {stripHtml(profile.bio)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botón */}
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

            {showRightArrow && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 shadow-xl bg-white hover:bg-gray-50 rounded-full border-2 h-7 w-7"
                onClick={scrollRight}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay perfiles recomendados disponibles</p>
            <p className="text-xs">
              {!activeCompany?.id 
                ? 'Configura tu empresa para ver recomendaciones'
                : 'Los candidatos verificados por academias aparecerán aquí'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedProfiles;
