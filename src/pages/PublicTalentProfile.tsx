import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  Mail,
  MessageCircle,
  ExternalLink,
  Play,
  FileText,
  Clock,
  Linkedin,
  Users,
  Languages,
  GraduationCap,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PublicContactModal } from '@/components/PublicContactModal';
import { usePublicContact } from '@/hooks/usePublicContact';

// Interfaces para datos reales
interface TalentProfile {
  id: string;
  user_id: string;
  title: string | null;
  specialty: string | null;
  bio: string | null;
  skills: string[] | null;
  years_experience: number | null;
  availability: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  position?: string | null;
  linkedin?: string | null;
  video_presentation_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  field?: string; // Alternative field name
  start_date?: string;
  end_date?: string;
  graduation_year?: number;
  description?: string;
  current?: boolean;
}

interface WorkExperience {
  id: string;
  position: string;
  company: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  is_current?: boolean;
  description?: string;
  location?: string;
}

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  url: string;
  type?: string;
  image_url?: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  username?: string;
}

const PublicTalentProfile = () => {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  
  // Estados para datos reales
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    isContactModalOpen, 
    setIsContactModalOpen, 
    contactType, 
    handleContact 
  } = usePublicContact();
  
  useEffect(() => {
    if (talentId) {
      fetchTalentProfile();
    }
  }, [talentId]);

  const fetchTalentProfile = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching public talent profile for ID:', talentId);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', talentId || '')
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        throw profileError;
      }
      console.log('✅ Profile data:', profileData);
      setUserProfile(profileData);

      // Fetch talent profile
      console.log('🔍 Fetching talent profile for user_id:', talentId);
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', talentId || '')
        .single();

      if (talentError && talentError.code !== 'PGRST116') {
        console.warn('❌ No talent profile found for user:', talentError);
      } else if (talentData) {
        console.log('✅ Talent profile data:', talentData);
        setTalentProfile(talentData);

        // Fetch education data - try both systems
        let educationData = null;
        
        // Try new system first (talent_education with user_id)
        const { data: newEducationData, error: newEducationError } = await supabase
          .from('talent_education' as any)
          .select('*')
          .eq('user_id', talentId || '')
          .order('start_date', { ascending: false });
        
        if (newEducationError) {
          console.log('  - talent_education error (table may not exist):', newEducationError.message);
        }

        if (newEducationData && newEducationData.length > 0) {
          educationData = newEducationData;
          console.log('✅ Education data found (new system):', educationData);
        } else {
          // Try old system (education with talent_profile_id)
          const { data: oldEducationData, error: oldEducationError } = await supabase
            .from('education')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('graduation_year', { ascending: false });
          
          if (oldEducationError) {
            console.log('  - education error (table may not exist):', oldEducationError.message);
          }

          if (oldEducationData && oldEducationData.length > 0) {
            educationData = oldEducationData;
            console.log('✅ Education data found (old system):', educationData);
          } else {
            console.log('⚠️ No education data found for user:', talentId);
          }
        }
        
        setEducation((educationData as Education[]) || []);

        // Fetch work experience data - try both systems
        let workData = null;
        
        // Try new system first (talent_experiences with user_id)
        const { data: newWorkData, error: newWorkError } = await supabase
          .from('talent_experiences' as any)
          .select('*')
          .eq('user_id', talentId || '')
          .order('start_date', { ascending: false });
        
        if (newWorkError) {
          console.log('  - talent_experiences error (table may not exist):', newWorkError.message);
        }

        if (newWorkData && newWorkData.length > 0) {
          workData = newWorkData;
          console.log('✅ Work experience data found (new system):', workData);
        } else {
          // Try old system (work_experience with talent_profile_id)
          const { data: oldWorkData, error: oldWorkError } = await supabase
            .from('work_experience')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('start_date', { ascending: false });
          
          if (oldWorkError) {
            console.log('  - work_experience error (table may not exist):', oldWorkError.message);
          }

          if (oldWorkData && oldWorkData.length > 0) {
            workData = oldWorkData;
            console.log('✅ Work experience data found (old system):', workData);
          } else {
            console.log('⚠️ No work experience data found for user:', talentId);
          }
        }
        
        setWorkExperience((workData as WorkExperience[]) || []);

        // Fetch portfolios data
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('talent_portfolios' as any)
          .select('*')
          .eq('user_id', talentId || '')
          .order('created_at', { ascending: false });

        if (portfolioError) {
          console.warn('❌ Error fetching portfolios (table may not exist):', portfolioError.message);
        } else if (portfolioData) {
          console.log('✅ Portfolio data found:', portfolioData);
          setPortfolios(portfolioData as unknown as Portfolio[]);
        } else {
          console.log('⚠️ No portfolio data found for user:', talentId);
        }

        // Fetch social links data
        const { data: socialData, error: socialError } = await supabase
          .from('talent_social_links' as any)
          .select('*')
          .eq('user_id', talentId || '')
          .order('created_at', { ascending: false });

        if (socialError) {
          console.warn('❌ Error fetching social links (table may not exist):', socialError.message);
        } else if (socialData) {
          console.log('✅ Social links data found:', socialData);
          setSocialLinks(socialData as unknown as SocialLink[]);
        } else {
          console.log('⚠️ No social links data found for user:', talentId);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching talent profile:', error);
      toast.error('Error al cargar el perfil del talento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactTalent = () => {
    if (talentId) {
      handleContact(talentId, 'proposal');
    }
  };

  const handleSendMessage = () => {
    if (talentId) {
      handleContact(talentId, 'message');
    }
  };


  const getAvailabilityColor = (availability: string | null) => {
    if (!availability) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (availability.toLowerCase()) {
      case 'inmediata': 
      case 'immediate': 
      case 'available': 
        return 'bg-green-100 text-green-800 border-green-200';
      case '2 semanas': 
      case '2 weeks': 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case '1 mes': 
      case '1 month': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '2-3 meses': 
      case '2-3 months': 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900">Perfil no encontrado</h3>
            <p className="text-gray-500 mt-2">El perfil solicitado no existe.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image - Optional, can be added later */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="-mt-20 relative z-10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32">
                      <AvatarImage src={userProfile.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {userProfile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Verification badge can be added later based on user verification status */}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">
                            {userProfile.full_name}
                          </h1>
                          <p className="text-xl text-gray-600">{talentProfile?.title || userProfile.position || 'Talento Digital'}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {/* Featured and Premium badges can be added later based on user status */}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>Ubicación / País</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>
                            {talentProfile?.years_experience ? 
                              `${talentProfile.years_experience >= 4 ? 'Senior' : 'Junior'} • ${talentProfile.years_experience} años` : 
                              'Experiencia'
                            }
                          </span>
                        </div>
                        {talentProfile?.hourly_rate_min && talentProfile?.hourly_rate_max && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              ${talentProfile.hourly_rate_min}-${talentProfile.hourly_rate_max} {talentProfile.currency}/hora
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Availability */}
                      {talentProfile?.availability && (
                        <div className="flex items-center gap-6 mt-4">
                          <Badge className={`${getAvailabilityColor(talentProfile.availability)}`}>
                            {talentProfile.availability}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {talentProfile?.bio && (
                      <p className="text-gray-700 leading-relaxed">
                        {talentProfile.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {talentProfile?.skills && talentProfile.skills.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Especialidades</h4>
                        <div className="flex flex-wrap gap-2">
                          {talentProfile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="experience">Experiencia</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Professional Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información Profesional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Especialidad</h4>
                        <div className="space-y-1">
                          <Badge variant="outline">{talentProfile?.specialty || 'General'}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tarifa por Hora</h4>
                        {talentProfile?.hourly_rate_min && talentProfile?.hourly_rate_max ? (
                          <p className="text-gray-700">
                            {talentProfile.currency} ${talentProfile.hourly_rate_min.toLocaleString()} - ${talentProfile.hourly_rate_max.toLocaleString()}/hora
                          </p>
                        ) : (
                          <p className="text-gray-500">A convenir</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                {/* Education */}
                {education.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Educación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {education.map((edu) => (
                          <div key={edu.id} className="border-l-4 border-blue-200 pl-4">
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            <p className="text-gray-600">{edu.institution}</p>
                            {(edu.field_of_study || edu.field) && (
                              <p className="text-sm text-gray-500">{edu.field_of_study || edu.field}</p>
                            )}
                            {(edu.start_date || edu.graduation_year) && (
                              <p className="text-sm text-gray-500">
                                {edu.start_date ? 
                                  `${format(new Date(edu.start_date), 'MMM yyyy', { locale: es })}${edu.current ? ' - Presente' : edu.end_date ? ` - ${format(new Date(edu.end_date), 'MMM yyyy', { locale: es })}` : ''}` :
                                  `Graduado en ${edu.graduation_year}`
                                }
                              </p>
                            )}
                            {edu.description && (
                              <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Work Experience */}
                {workExperience.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Experiencia Laboral
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {workExperience.map((work) => (
                          <div key={work.id} className="border-l-4 border-green-200 pl-4">
                            <h4 className="font-medium text-gray-900">{work.position}</h4>
                            <p className="text-gray-600">{work.company}</p>
                            {work.start_date && (
                              <p className="text-sm text-gray-500">
                                {format(new Date(work.start_date), 'MMM yyyy', { locale: es })}
                                {(work.current || work.is_current) ? ' - Presente' : work.end_date ? ` - ${format(new Date(work.end_date), 'MMM yyyy', { locale: es })}` : ''}
                              </p>
                            )}
                            {work.location && (
                              <p className="text-sm text-gray-500">{work.location}</p>
                            )}
                            {work.description && (
                              <p className="text-sm text-gray-700 mt-2">{work.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Show message if no experience data */}
                {education.length === 0 && workExperience.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se ha agregado información de educación o experiencia</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Portfolio & Trabajos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolios.length > 0 || talentProfile?.portfolio_url ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">
                            {portfolios.length} proyectos en portfolio
                          </span>
                          {talentProfile?.portfolio_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={talentProfile.portfolio_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Portfolio Completo
                              </a>
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolios.map((portfolio) => (
                            <div key={portfolio.id} className="bg-gray-100 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2">{portfolio.title}</h4>
                              {portfolio.description && (
                                <p className="text-sm text-gray-600 mb-3">{portfolio.description}</p>
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <a href={portfolio.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Ver Proyecto
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Este talento aún no ha compartido su portfolio público.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Video Presentation */}
                {userProfile?.video_presentation_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Video de Presentación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center relative group overflow-hidden">
                        <div className="text-center">
                          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Video de presentación disponible</p>
                        </div>
                        <Button 
                          onClick={() => window.open(userProfile.video_presentation_url!, '_blank')} 
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Play className="h-8 w-8 text-white mr-2" />
                          Reproducir Video
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Servicios publicados próximamente
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Contactar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleContactTalent} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Propuesta
                </Button>
                
                <Button onClick={handleSendMessage} variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Actividad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Miembro desde:</span>
                  <span className="font-medium">
                    {format(new Date(userProfile.created_at), 'MMM yyyy', { locale: es })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(userProfile.updated_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* External Links */}
            <Card>
              <CardHeader>
                <CardTitle>Enlaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {talentProfile?.linkedin_url && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={talentProfile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                
                {talentProfile?.portfolio_url && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={talentProfile.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
                
                {socialLinks.map((link) => (
                  <Button key={link.id} variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {link.platform}
                    </a>
                  </Button>
                ))}
                
                {(!talentProfile?.linkedin_url && !talentProfile?.portfolio_url && socialLinks.length === 0) && (
                  <p className="text-gray-500 text-center py-4 text-sm">
                    No hay enlaces disponibles
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Español</span>
                    <Badge variant="secondary">Nativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inglés</span>
                    <Badge variant="secondary">Intermedio</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Certificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Certificaciones próximamente</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Talents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Talentos Similares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 text-center py-4">
                  Otros profesionales similares
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Más Talentos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Public Contact Modal */}
      <PublicContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        talentUserId={talentId || ''}
        talentName={userProfile?.full_name || 'este talento'}
        contactType={contactType}
      />
    </div>
  );
};

export default PublicTalentProfile;
