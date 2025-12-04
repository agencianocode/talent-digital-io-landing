import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, GraduationCap, MapPin, Award, ExternalLink, Eye, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TalentCardAcademyBadge } from '@/components/talent/TalentCardAcademyBadge';

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

      setGraduates(graduatesData || []);
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
              <p className="text-white/80 max-w-2xl">{academy.description}</p>
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
      <div className="container mx-auto max-w-6xl py-12 px-4">
        {studentsFilter === 'all' ? (
          // Mostrar 2 columnas: Activos a la izquierda, Graduados a la derecha
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Estudiantes Activos */}
            <div>
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
                <div className="grid grid-cols-1 gap-6">
                  {graduates.filter(g => g.status === 'enrolled').map((graduate) => (
                    <Card 
                      key={graduate.student_id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => graduate.user_id && navigate(`/business-dashboard/talent-profile/${graduate.user_id}`)}
                    >
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={graduate.avatar_url || undefined} />
                              <AvatarFallback>
                                {graduate.student_name?.split(' ').map(n => n[0]).join('') || 'E'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                  {graduate.student_name || 'Estudiante'}
                                </h3>
                                <p className="text-gray-600 text-sm">{graduate.title || 'Estudiante'}</p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs whitespace-nowrap">
                                    Perfil incompleto
                                  </Badge>
                                </div>
                                
                                {/* Academy affiliation badge */}
                                {graduate.student_email && (
                                  <TalentCardAcademyBadge 
                                    userId={graduate.user_id || ''}
                                    userEmail={graduate.student_email}
                                    compact={true}
                                  />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                              <MapPin className="h-3 w-3" />
                              <span>{[graduate.city, graduate.country].filter(Boolean).join(', ') || 'Ubicación no especificada'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {graduate.bio && (
                          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                            {graduate.bio}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => graduate.user_id && navigate(`/business-dashboard/talent-profile/${graduate.user_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => graduate.user_id && navigate(`/business-dashboard/messages?user=${graduate.user_id}`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contactar
                          </Button>
                        </div>

                        {/* Activity indicator */}
                        {graduate.enrollment_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                            <Clock className="h-3 w-3" />
                            Activo {formatDistanceToNow(new Date(graduate.enrollment_date), { addSuffix: true, locale: es })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Graduados */}
            <div>
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
                <div className="grid grid-cols-1 gap-6">
                  {graduates.filter(g => g.status === 'graduated').map((graduate) => (
                    <Card 
                      key={graduate.student_id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => graduate.user_id && navigate(`/business-dashboard/talent-profile/${graduate.user_id}`)}
                    >
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={graduate.avatar_url || undefined} />
                              <AvatarFallback>
                                {graduate.student_name?.split(' ').map(n => n[0]).join('') || 'G'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                  {graduate.student_name || 'Graduado'}
                                </h3>
                                <p className="text-gray-600 text-sm">{graduate.title || 'Graduado'}</p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs whitespace-nowrap">
                                    Perfil incompleto
                                  </Badge>
                                </div>
                                
                                {/* Academy affiliation badge */}
                                {graduate.student_email && (
                                  <TalentCardAcademyBadge 
                                    userId={graduate.user_id || ''}
                                    userEmail={graduate.student_email}
                                    compact={true}
                                  />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                              <MapPin className="h-3 w-3" />
                              <span>{[graduate.city, graduate.country].filter(Boolean).join(', ') || 'Ubicación no especificada'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {graduate.bio && (
                          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                            {graduate.bio}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => graduate.user_id && navigate(`/business-dashboard/talent-profile/${graduate.user_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => graduate.user_id && navigate(`/business-dashboard/messages?user=${graduate.user_id}`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contactar
                          </Button>
                        </div>

                        {/* Activity indicator */}
                        {graduate.graduation_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                            <Clock className="h-3 w-3" />
                            Activo {formatDistanceToNow(new Date(graduate.graduation_date), { addSuffix: true, locale: es })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
              <Card 
                key={graduate.student_id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
                onClick={() => graduate.user_id && navigate(`/business-dashboard/talent-profile/${graduate.user_id}`)}
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={graduate.avatar_url || undefined} />
                        <AvatarFallback>
                          {graduate.student_name?.split(' ').map(n => n[0]).join('') || 'G'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                            {graduate.student_name || 'Graduado'}
                          </h3>
                          <p className="text-gray-600 text-sm">{graduate.title || (graduate.status === 'graduated' ? 'Graduado' : 'Estudiante')}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs whitespace-nowrap">
                              Perfil incompleto
                            </Badge>
                          </div>
                          
                          {/* Academy affiliation badge */}
                          {graduate.student_email && (
                            <TalentCardAcademyBadge 
                              userId={graduate.user_id || ''}
                              userEmail={graduate.student_email}
                              compact={true}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                        <MapPin className="h-3 w-3" />
                        <span>{[graduate.city, graduate.country].filter(Boolean).join(', ') || 'Ubicación no especificada'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {graduate.bio && (
                    <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                      {graduate.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => graduate.user_id && navigate(`/business-dashboard/talent-profile/${graduate.user_id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => graduate.user_id && navigate(`/business-dashboard/messages?user=${graduate.user_id}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                  </div>

                  {/* Activity indicator */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                    <Clock className="h-3 w-3" />
                    Activo {formatDistanceToNow(new Date(graduate.graduation_date || graduate.enrollment_date || new Date()), { addSuffix: true, locale: es })}
                  </div>
                </CardContent>
              </Card>
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
