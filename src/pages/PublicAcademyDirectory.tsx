import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, GraduationCap, Award, ExternalLink } from 'lucide-react';
import { UnifiedTalentCard } from '@/components/talent/UnifiedTalentCard';

interface Graduate {
  student_id: string;
  student_name: string | null;
  student_email: string;
  graduation_date: string | null;
  enrollment_date: string | null;
  program_name: string | null;
  certificate_url?: string | null;
  status?: string;
  user_id?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  title?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  skills?: string[];
  // Extended profile data for sorting
  video_presentation_url?: string | null;
  education_count?: number;
  experience_count?: number;
  social_links_count?: number;
  services_count?: number;
  // Additional fields for unified sorting (same as TalentDiscovery)
  last_activity?: string | null;
  is_complete?: boolean;
  is_verified?: boolean; // Always true for academy students
}

interface AcademyInfo {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  brand_color: string | null;
  secondary_color: string | null;
  academy_tagline?: string;
  website?: string;
  academy_slug?: string;
}

export default function PublicAcademyDirectory() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [academy, setAcademy] = useState<AcademyInfo | null>(null);
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [showLogo, setShowLogo] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [studentsFilter, setStudentsFilter] = useState<'all' | 'enrolled' | 'graduated'>('all');

  useEffect(() => {
    loadAcademyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadAcademyData = async () => {
    if (!slug) return;

    try {
      setLoading(true);

      // Check if slug is a UUID (ID) or an actual slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      // Load academy info (removed business_type filter to support both academy and company)
      let query = supabase
        .from('companies')
        .select('id, name, logo_url, description, brand_color, secondary_color, academy_tagline, website, directory_settings, public_directory_enabled, academy_slug');

      if (isUUID) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('academy_slug', slug);
      }

      const { data: academyData, error: academyError } = await query.single();

      if (academyError) throw academyError;

      if (!academyData) {
        navigate('/404');
        return;
      }

      if (!academyData.public_directory_enabled) {
        navigate('/404');
        return;
      }

      // Canonical redirect: if accessed via UUID but has slug, redirect to slug URL
      if (isUUID && academyData.academy_slug) {
        navigate(`/academy/${academyData.academy_slug}`, { replace: true });
        return;
      }

      setAcademy(academyData as AcademyInfo);
      const settings = typeof academyData.directory_settings === 'object' && academyData.directory_settings !== null
        ? academyData.directory_settings as { show_logo?: boolean; show_description?: boolean; students_filter?: string }
        : {};
      setShowLogo(settings.show_logo ?? true);
      setShowDescription(settings.show_description ?? true);
      
      const filter = (settings.students_filter || 'all') as 'all' | 'enrolled' | 'graduated';
      setStudentsFilter(filter);

      // Load students/graduates with their profiles
      const { data: graduatesData, error: graduatesError } = await supabase
        .rpc('get_public_academy_directory', {
          p_academy_id: academyData.id,
          p_status_filter: filter
        });

      if (graduatesError) throw graduatesError;

      // Helper: Check if name is a "real" name (not email-derived)
      const hasRealName = (name: string | null): boolean => {
        if (!name) return false;
        // Exclude if contains @ (is an email)
        if (name.includes('@')) return false;
        // Exclude if looks like email-derived name (only lowercase letters and numbers, no spaces)
        const trimmedName = name.trim();
        if (!trimmedName.includes(' ') && /^[a-z0-9]+$/i.test(trimmedName)) return false;
        return true;
      };

      // Filtrar solo estudiantes que:
      // 1. Están activos o graduados
      // 2. Han aceptado la invitación (user_id no null)
      // 3. Tienen nombre REAL (no email-derived)
      // 4. Tienen foto de perfil
      const visibleStudents = (graduatesData || []).filter((student: Graduate) => 
        (student.status === 'enrolled' || student.status === 'graduated') && 
        student.user_id !== null &&
        hasRealName(student.student_name) &&
        student.avatar_url !== null
      );

      // Count hidden students by reason for logging
      const pendingOrInactive = (graduatesData || []).filter((s: Graduate) => 
        s.status !== 'enrolled' && s.status !== 'graduated' || s.user_id === null
      ).length;
      const incompleteOnboarding = (graduatesData || []).filter((s: Graduate) => 
        (s.status === 'enrolled' || s.status === 'graduated') && 
        s.user_id !== null &&
        (!hasRealName(s.student_name) || s.avatar_url === null)
      ).length;

      console.log('📚 Total students from RPC:', graduatesData?.length || 0);
      console.log('✅ Visible students (complete profile):', visibleStudents.length);
      console.log('🚫 Hidden (pending/inactive):', pendingOrInactive);
      console.log('🚫 Hidden (incomplete onboarding - no real name or photo):', incompleteOnboarding);

      // Función de ordenamiento unificada (misma lógica que TalentDiscovery):
      // 1. Perfil 100% completo (is_complete)
      // 2. Última actividad (last_activity, más reciente primero)
      // 3. Verificado por academia (siempre true para estudiantes de academia)
      // 4. Tiene video (video_presentation_url)
      const sortByUnifiedCriteria = (students: Graduate[]): Graduate[] => {
        return [...students].sort((a, b) => {
          // 1. Perfil completo primero
          const aComplete = a.is_complete ? 1 : 0;
          const bComplete = b.is_complete ? 1 : 0;
          if (aComplete !== bComplete) return bComplete - aComplete;
          
          // 2. Última actividad (más reciente primero)
          const aLastActive = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          const bLastActive = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          if (aLastActive !== bLastActive) return bLastActive - aLastActive;
          
          // 3. Verificado por academia (todos los estudiantes de academia están verificados)
          // No aplica diferenciación aquí
          
          // 4. Tiene video
          const aHasVideo = a.video_presentation_url ? 1 : 0;
          const bHasVideo = b.video_presentation_url ? 1 : 0;
          return bHasVideo - aHasVideo;
        });
      };

      if (visibleStudents.length > 0) {
        const userIds = visibleStudents.map((s: Graduate) => s.user_id).filter(Boolean) as string[];
        
        if (userIds.length > 0) {
          // Fetch all extended profile data in parallel
          const [
            talentProfilesResult,
            profilesResult,
            educationResult,
            experienceResult,
            socialLinksResult,
            servicesResult
          ] = await Promise.all([
            supabase
              .from('talent_profiles')
              .select('user_id, skills, video_presentation_url')
              .in('user_id', userIds),
            supabase
              .from('profiles')
              .select('user_id, last_activity, profile_completeness')
              .in('user_id', userIds),
            supabase
              .from('talent_education')
              .select('user_id')
              .in('user_id', userIds),
            supabase
              .from('talent_experiences')
              .select('user_id')
              .in('user_id', userIds),
            supabase
              .from('talent_social_links')
              .select('user_id')
              .in('user_id', userIds),
            supabase
              .from('marketplace_services')
              .select('user_id')
              .in('user_id', userIds)
              .eq('status', 'active')
              .eq('is_available', true)
          ]);

          // Count records per user
          const educationCounts = new Map<string, number>();
          (educationResult.data || []).forEach((e) => {
            educationCounts.set(e.user_id, (educationCounts.get(e.user_id) || 0) + 1);
          });

          const experienceCounts = new Map<string, number>();
          (experienceResult.data || []).forEach((e) => {
            experienceCounts.set(e.user_id, (experienceCounts.get(e.user_id) || 0) + 1);
          });

          const socialLinksCounts = new Map<string, number>();
          (socialLinksResult.data || []).forEach((s) => {
            socialLinksCounts.set(s.user_id, (socialLinksCounts.get(s.user_id) || 0) + 1);
          });

          const servicesCounts = new Map<string, number>();
          (servicesResult.data || []).forEach((s) => {
            servicesCounts.set(s.user_id, (servicesCounts.get(s.user_id) || 0) + 1);
          });

          // Combine all data
          const studentsWithAllData = visibleStudents.map((student: Graduate) => {
            const talentProfile = (talentProfilesResult.data || []).find(tp => tp.user_id === student.user_id);
            const profileData = (profilesResult.data || []).find(p => p.user_id === student.user_id);
            return {
              ...student,
              skills: talentProfile?.skills || [],
              video_presentation_url: talentProfile?.video_presentation_url,
              education_count: educationCounts.get(student.user_id || '') || 0,
              experience_count: experienceCounts.get(student.user_id || '') || 0,
              social_links_count: socialLinksCounts.get(student.user_id || '') || 0,
              services_count: servicesCounts.get(student.user_id || '') || 0,
              // Additional fields for unified sorting
              last_activity: profileData?.last_activity || null,
              is_complete: (profileData?.profile_completeness ?? 0) === 100,
              is_verified: true // All academy students are verified
            };
          });
          
          setGraduates(sortByUnifiedCriteria(studentsWithAllData));
        } else {
          setGraduates(sortByUnifiedCriteria(visibleStudents));
        }
      } else {
        setGraduates(visibleStudents);
      }
    } catch (error) {
      console.error('Error loading academy data:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!academy) return null;

  // Default colors if not set
  const brandColor = academy.brand_color || '#1E3A8A';
  const secondaryColor = academy.secondary_color || '#3B82F6';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="py-16 px-4"
        style={{
          background: `linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center text-white gap-4">
            {showLogo && academy.logo_url && (
              <img 
                src={academy.logo_url} 
                alt={academy.name}
                className="h-24 w-24 object-contain rounded-lg bg-white/10 p-2"
              />
            )}
            <h1 className="text-4xl font-bold">{academy.name}</h1>
            {academy.academy_tagline && (
              <p className="text-xl text-white/90">{academy.academy_tagline}</p>
            )}
            {showDescription && academy.description && (
              <div 
                className="prose prose-sm prose-invert max-w-2xl text-white/80 [&_p]:text-white/80 [&_li]:text-white/80"
                dangerouslySetInnerHTML={{ __html: academy.description }}
              />
            )}
            {academy.website && (
              <Button 
                variant="secondary" 
                asChild
                className="mt-4"
              >
                <a href={academy.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visitar Sitio Web
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div className="container mx-auto max-w-7xl py-12 px-4">
        {studentsFilter === 'all' ? (
          // Mostrar 2 columnas: Activos a la izquierda, Graduados a la derecha
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Estudiantes Activos */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-6 w-6" style={{ color: brandColor }} />
                <h2 className="text-2xl font-bold">
                  Estudiantes Activos ({graduates.filter(g => g.status === 'enrolled').length})
                </h2>
              </div>
              {graduates.filter(g => g.status === 'enrolled').length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    No hay estudiantes activos
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {graduates.filter(g => g.status === 'enrolled').map((graduate) => (
                    <UnifiedTalentCard
                      key={graduate.student_id}
                      userId={graduate.user_id || ''}
                      fullName={graduate.student_name || 'Estudiante'}
                      title={graduate.title || 'Estudiante'}
                      avatarUrl={graduate.avatar_url}
                      city={graduate.city || undefined}
                      country={graduate.country || undefined}
                      bio={graduate.bio || undefined}
                      skills={graduate.skills}
                      userEmail={graduate.student_email}
                      lastActive={graduate.enrollment_date || undefined}
                      primaryAction={{
                        label: 'Ver Perfil',
                        onClick: () => graduate.user_id && window.open(`/profile/${graduate.user_id}`, '_blank')
                      }}
                      showBio={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Graduados */}
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-6 w-6" style={{ color: brandColor }} />
                <h2 className="text-2xl font-bold">
                  Graduados ({graduates.filter(g => g.status === 'graduated').length})
                </h2>
              </div>
              {graduates.filter(g => g.status === 'graduated').length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    No hay graduados aún
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {graduates.filter(g => g.status === 'graduated').map((graduate) => (
                    <UnifiedTalentCard
                      key={graduate.student_id}
                      userId={graduate.user_id || ''}
                      fullName={graduate.student_name || 'Graduado'}
                      title={graduate.title || 'Graduado'}
                      avatarUrl={graduate.avatar_url}
                      city={graduate.city || undefined}
                      country={graduate.country || undefined}
                bio={graduate.bio || undefined}
                skills={graduate.skills}
                userEmail={graduate.student_email}
                lastActive={graduate.graduation_date || undefined}
                      primaryAction={{
                        label: 'Ver Perfil',
                        onClick: () => graduate.user_id && window.open(`/profile/${graduate.user_id}`, '_blank')
                      }}
                      showBio={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Mostrar solo el filtro seleccionado
          <>
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap className="h-8 w-8" style={{ color: brandColor }} />
              <h2 className="text-3xl font-bold">
                {studentsFilter === 'enrolled' 
                  ? `Nuestros Estudiantes Activos (${graduates.length})`
                  : `Nuestros Graduados (${graduates.length})`
                }
              </h2>
            </div>

            {graduates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {studentsFilter === 'enrolled' 
                    ? 'Aún no hay estudiantes activos registrados.'
                    : 'Aún no hay graduados registrados en el directorio público.'
                  }
                </CardContent>
              </Card>
            ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {graduates.map((graduate) => (
              <UnifiedTalentCard
                key={graduate.student_id}
                userId={graduate.user_id || ''}
                fullName={graduate.student_name || 'Graduado'}
                title={graduate.title || (graduate.status === 'graduated' ? 'Graduado' : 'Estudiante')}
                avatarUrl={graduate.avatar_url}
                city={graduate.city || undefined}
                country={graduate.country || undefined}
                bio={graduate.bio || undefined}
                skills={graduate.skills}
                userEmail={graduate.student_email}
                lastActive={graduate.graduation_date || graduate.enrollment_date || undefined}
                primaryAction={{
                  label: 'Ver Perfil',
                  onClick: () => graduate.user_id && window.open(`/profile/${graduate.user_id}`, '_blank')
                }}
                showBio={true}
              />
            ))}
          </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t py-8 mt-12">
        <div className="container mx-auto max-w-6xl px-4 text-center text-muted-foreground">
          <p>
            Potenciado por{' '}
            <a href="/" className="text-primary hover:underline">
              TalentoDigital
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
