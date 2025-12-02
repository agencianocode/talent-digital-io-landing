import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth, isBusinessRole } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Phone, Linkedin, Globe, Calendar, Briefcase, Star, GraduationCap, Clock, MessageSquare, Send, Video, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TalentServices } from "@/components/talent/TalentServices";
import { useMessages } from "@/hooks/useMessages";
import VideoThumbnail from "@/components/VideoThumbnail";
import VideoPlayerModal from "@/components/VideoPlayerModal";

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

const TalentProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userRole } = useSupabaseAuth();
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // Mensajería existente basada en tabla messages
  const { getOrCreateConversation, sendMessage } = useMessages();

  useEffect(() => {
    if (id) {
      console.log('Fetching talent profile for user ID:', id);
      fetchTalentProfile();
    }
  }, [id]);

  const fetchTalentProfile = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching talent profile for ID:', id);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id || '')
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        throw profileError;
      }
      console.log('✅ Profile data:', profileData);
      setUserProfile(profileData);

      // Fetch talent profile
      console.log('🔍 Fetching talent profile for user_id:', id);
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', id || '')
        .single();

      if (talentError && talentError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is okay if user doesn't have a talent profile
        console.warn('❌ No talent profile found for user:', talentError);
      } else if (talentData) {
        console.log('✅ Talent profile data:', talentData);
        setTalentProfile(talentData);

        // Fetch education data - try both systems
        let educationData = null;
        
        // Try new system first (talent_education with user_id)
        const { data: newEducationData } = await supabase
          .from('talent_education' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('start_date', { ascending: false });

        if (newEducationData && newEducationData.length > 0) {
          educationData = newEducationData;
          console.log('✅ Education data found (new system):', educationData);
        } else {
          // Try old system (education with talent_profile_id)
          const { data: oldEducationData } = await supabase
            .from('education')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('graduation_year', { ascending: false });

          if (oldEducationData && oldEducationData.length > 0) {
            educationData = oldEducationData;
            console.log('✅ Education data found (old system):', educationData);
          } else {
            console.log('⚠️ No education data found for user:', id);
          }
        }
        
        setEducation(educationData || []);

        // Fetch work experience data - try both systems
        let workData = null;
        
        // Try new system first (talent_experiences with user_id)
        const { data: newWorkData } = await supabase
          .from('talent_experiences' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('start_date', { ascending: false });

        if (newWorkData && newWorkData.length > 0) {
          workData = newWorkData;
          console.log('✅ Work experience data found (new system):', workData);
        } else {
          // Try old system (work_experience with talent_profile_id)
          const { data: oldWorkData } = await supabase
            .from('work_experience')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('start_date', { ascending: false });

          if (oldWorkData && oldWorkData.length > 0) {
            workData = oldWorkData;
            console.log('✅ Work experience data found (old system):', workData);
          } else {
            console.log('⚠️ No work experience data found for user:', id);
          }
        }
        
        setWorkExperience(workData || []);

        // Fetch portfolios data
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('talent_portfolios' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('created_at', { ascending: false });

        if (portfolioError) {
          console.warn('❌ Error fetching portfolios:', portfolioError);
        } else if (portfolioData) {
          console.log('✅ Portfolio data found:', portfolioData);
          setPortfolios(portfolioData);
        } else {
          console.log('⚠️ No portfolio data found for user:', id);
        }

        // Fetch social links data
        const { data: socialData, error: socialError } = await supabase
          .from('talent_social_links' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('created_at', { ascending: false });

        if (socialError) {
          console.warn('❌ Error fetching social links:', socialError);
        } else if (socialData) {
          console.log('✅ Social links data found:', socialData);
          setSocialLinks(socialData);
        } else {
          console.log('⚠️ No social links data found for user:', id);
        }
      }

    } catch (error) {
      console.error('❌ Error fetching talent profile:', error);
      toast.error('Error al cargar el perfil del talento');
    } finally {
      console.log('📊 Final state:');
      console.log('  - Education:', education.length, 'items');
      console.log('  - Work Experience:', workExperience.length, 'items');
      console.log('  - Portfolios:', portfolios.length, 'items');
      console.log('  - Social Links:', socialLinks.length, 'items');
      console.log('  - User Profile:', userProfile ? '✅ Found' : '❌ Not found');
      console.log('  - Talent Profile:', talentProfile ? '✅ Found' : '❌ Not found');
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast.error('Por favor escribe un mensaje');
      return;
    }

    if (!id) {
      toast.error('Error: ID de usuario no disponible');
      return;
    }

    setIsSendingMessage(true);
    try {
      const conversationId = await getOrCreateConversation(id);
      await sendMessage(conversationId, contactMessage.trim());
      
      if (conversationId) {
        toast.success('Mensaje enviado exitosamente');
        setShowContactModal(false);
        setContactMessage("");
        navigate(`/business-dashboard/messages/${conversationId}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Perfil no encontrado</h1>
        <p className="text-muted-foreground mb-4">
          El perfil del talento que buscas no existe o no está disponible.
        </p>
        <Button onClick={handleBack}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={handleBack}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Volver</span>
          <span className="sm:hidden">←</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Perfil de Talento
          </h1>
          {isBusinessRole(userRole) && (
            <Button onClick={handleContact} className="w-full sm:w-auto">
              Contactar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                    <AvatarImage src={userProfile.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">
                      {userProfile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                <div>
                  <CardTitle className="text-xl sm:text-2xl">{userProfile.full_name}</CardTitle>
                  <p className="text-muted-foreground">
                    {userProfile.position || 'Talento Digital'}
                  </p>
                  {talentProfile?.specialty && (
                    <Badge variant="secondary" className="mt-2">
                      {talentProfile.specialty}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {talentProfile?.bio && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Biografía</h3>
                  <p className="text-muted-foreground">{talentProfile.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {userProfile.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                {talentProfile?.linkedin_url && (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={talentProfile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {talentProfile?.portfolio_url && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={talentProfile.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Portfolio
                    </a>
                  </div>
                )}
                {talentProfile?.years_experience && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{talentProfile.years_experience} años de experiencia</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {talentProfile?.skills && talentProfile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Habilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talentProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
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
                    <div key={work.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground">{work.position}</h4>
                          <p className="text-sm text-muted-foreground">{work.company}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {work.start_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(work.start_date), 'MMM yyyy', { locale: es })}
                              {(work.current || work.is_current) ? ' - Presente' : work.end_date ? ` - ${format(new Date(work.end_date), 'MMM yyyy', { locale: es })}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      {work.description && (
                        <p className="text-sm text-muted-foreground mt-2">{work.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          {(edu.field || edu.field_of_study) && (
                            <p className="text-xs text-muted-foreground">{edu.field || edu.field_of_study}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {(edu.start_date || edu.graduation_year) && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {edu.start_date ? 
                                `${format(new Date(edu.start_date), 'MMM yyyy', { locale: es })}${edu.current ? ' - Presente' : edu.end_date ? ` - ${format(new Date(edu.end_date), 'MMM yyyy', { locale: es })}` : ''}` :
                                `Graduado en ${edu.graduation_year}`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se ha agregado información de educación</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video de Presentación */}
          {userProfile?.video_presentation_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video de Presentación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-48 bg-muted rounded-lg relative group overflow-hidden cursor-pointer" onClick={() => setIsVideoModalOpen(true)}>
                  <VideoThumbnail url={userProfile.video_presentation_url} />
                  
                  {/* Hover overlay with play button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      onClick={() => setIsVideoModalOpen(true)} 
                      size="lg" 
                      className="gap-2 bg-white text-black hover:bg-gray-100"
                    >
                      <Video className="h-5 w-5" />
                      Reproducir Video
                    </Button>
                  </div>
                  
                  {/* Platform badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                      {userProfile.video_presentation_url.includes('loom.com') ? 'Loom' : 
                       userProfile.video_presentation_url.includes('youtube.com') || userProfile.video_presentation_url.includes('youtu.be') ? 'YouTube' :
                       userProfile.video_presentation_url.includes('vimeo.com') ? 'Vimeo' : 'Video'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolios */}
          {portfolios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Portfolios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolios.map((portfolio) => (
                    <div key={portfolio.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-1.5 bg-blue-50 rounded-md mt-0.5">
                            <Globe className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">{portfolio.title}</h4>
                              {portfolio.is_primary && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 border-yellow-200">
                                  <Star className="h-3 w-3 mr-1" />
                                  Principal
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {portfolio.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{portfolio.url}</p>
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      {portfolio.description && (
                        <div className="ml-7 mb-3">
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {portfolio.description}
                          </p>
                        </div>
                      )}

                      {/* Acción */}
                      <div className="ml-7">
                        <Button
                          onClick={() => window.open(portfolio.url, '_blank')}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Ver Portfolio
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Redes Sociales */}
          {socialLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Redes Sociales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-1.5 bg-white rounded-md shadow-sm">
                          {link.platform === 'linkedin' && <Linkedin className="h-4 w-4 text-blue-600" />}
                          {link.platform === 'twitter' && <Globe className="h-4 w-4 text-blue-400" />}
                          {link.platform === 'instagram' && <Globe className="h-4 w-4 text-pink-500" />}
                          {link.platform === 'github' && <Globe className="h-4 w-4 text-gray-800" />}
                          {link.platform === 'youtube' && <Video className="h-4 w-4 text-red-600" />}
                          {!['linkedin', 'twitter', 'instagram', 'github', 'youtube'].includes(link.platform) && <Globe className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 capitalize truncate">{link.platform}</h4>
                          <p className="text-xs text-gray-500 truncate">{link.url}</p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => window.open(link.url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        Visitar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Experience */}
          {talentProfile?.years_experience && (
            <Card>
              <CardHeader>
                <CardTitle>Experiencia General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{talentProfile.years_experience} años de experiencia</span>
                </div>
                {talentProfile.availability && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Disponibilidad: {talentProfile.availability}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Services Section */}
          {isBusinessRole(userRole) && (
            <TalentServices 
              userId={id || ''}
              talentName={userProfile?.full_name || 'Talento'}
              talentAvatar={userProfile?.avatar_url || undefined}
              onContact={handleContact}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rate Card */}
          {talentProfile?.hourly_rate_min && talentProfile?.hourly_rate_max && (
            <Card>
              <CardHeader>
                <CardTitle>Tarifa por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${talentProfile.hourly_rate_min} - ${talentProfile.hourly_rate_max}
                </div>
                <div className="text-sm text-muted-foreground">
                  {talentProfile.currency || 'USD'}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Since */}
          <Card>
            <CardHeader>
              <CardTitle>Miembro desde</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(userProfile.created_at), 'MMMM yyyy', { locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          {isBusinessRole(userRole) && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={handleContact}>
                  Contactar
                </Button>
                <Button variant="outline" className="w-full">
                  Ver CV
                </Button>
                <Button variant="outline" className="w-full">
                  Programar Entrevista
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contactar a {userProfile?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-message">Mensaje</Label>
              <Textarea
                id="contact-message"
                placeholder="Escribe tu mensaje aquí..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={isSendingMessage || !contactMessage.trim()}
                className="flex-1"
              >
                {isSendingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowContactModal(false)}
                disabled={isSendingMessage}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {userProfile?.video_presentation_url && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={userProfile.video_presentation_url}
          title="Video de Presentación"
        />
      )}
    </div>
  );
};

export default TalentProfilePage;