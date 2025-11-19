import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Play, 
  Linkedin, 
  Youtube, 
  Github, 
  Instagram, 
  Facebook,
  MapPin,
  Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PublicContactModal } from '@/components/PublicContactModal';
import { usePublicContact } from '@/hooks/usePublicContact';
import { useAcademyAffiliations } from '@/hooks/useAcademyAffiliations';
import { AcademyCertificationBadge } from '@/components/academy/AcademyCertificationBadge';
import VideoThumbnail from '@/components/VideoThumbnail';
import { TalentServices } from '@/components/talent/TalentServices';
import { ShareProfileModal } from '@/components/ShareProfileModal';
import { toast } from 'sonner';

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

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
  city?: string | null;
  country?: string | null;
  created_at: string;
  updated_at: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  field?: string;
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
  
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const [showAllWorkExperience, setShowAllWorkExperience] = useState(false);
  const [videoPresentationUrl, setVideoPresentationUrl] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const educationRef = useRef<Education[]>([]);
  const workExperienceRef = useRef<WorkExperience[]>([]);
  
  const { 
    isContactModalOpen, 
    setIsContactModalOpen, 
    contactType, 
    handleContact 
  } = usePublicContact();
  
  const { affiliations } = useAcademyAffiliations(
    userEmail || undefined
  );

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
      
      // Get user email for academy affiliations
      if (talentId) {
        const { data: emailData } = await supabase
          .rpc('get_user_emails_by_ids', { user_ids: [talentId] });
        
        if (emailData && emailData.length > 0 && emailData[0]) {
          console.log('📧 User email obtained:', emailData[0].email);
          setUserEmail(emailData[0].email || null);
        }
      }
      
      // Set video presentation URL if available
      if (profileData.video_presentation_url) {
        console.log('🎥 Video presentation URL found:', profileData.video_presentation_url);
        setVideoPresentationUrl(profileData.video_presentation_url);
      } else {
        setVideoPresentationUrl(null);
      }

      // Fetch talent profile
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

        // Fetch education data
        let educationData = null;
        
        const { data: newEducationData, error: newEducationError } = await supabase
          .from('talent_education' as any)
          .select('*')
          .eq('user_id', talentId || '')
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });
        
        if (newEducationError) {
          console.log('  - talent_education error:', newEducationError.message);
        }

        if (newEducationData && newEducationData.length > 0) {
          educationData = newEducationData;
          console.log('✅ Education data found:', educationData);
        } else {
          const { data: oldEducationData, error: oldEducationError } = await supabase
            .from('education')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('graduation_year', { ascending: false });
          
          if (oldEducationError) {
            console.log('  - education error:', oldEducationError.message);
          }

          if (oldEducationData && oldEducationData.length > 0) {
            educationData = oldEducationData;
            console.log('✅ Education data found (old system):', educationData);
          }
        }
        
        educationRef.current = (educationData as Education[]) || [];
        setEducation((educationData as Education[]) || []);

        // Fetch work experience data
        let workData = null;
        
        const { data: newWorkData, error: newWorkError } = await supabase
          .from('talent_experiences' as any)
          .select('*')
          .eq('user_id', talentId || '')
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });
        
        if (newWorkError) {
          console.log('  - talent_experiences error:', newWorkError.message);
        }

        if (newWorkData && newWorkData.length > 0) {
          workData = newWorkData;
          console.log('✅ Work experience data found:', workData);
        } else {
          const { data: oldWorkData, error: oldWorkError } = await supabase
            .from('work_experience')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('start_date', { ascending: false });
          
          if (oldWorkError) {
            console.log('  - work_experience error:', oldWorkError.message);
          }

          if (oldWorkData && oldWorkData.length > 0) {
            workData = oldWorkData;
            console.log('✅ Work experience data found (old system):', workData);
          }
        }
        
        workExperienceRef.current = (workData as WorkExperience[]) || [];
        setWorkExperience((workData as WorkExperience[]) || []);

        // Fetch portfolios data
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('talent_portfolios' as any)
          .select('*')
          .eq('user_id', talentId || '')
          .order('is_primary', { ascending: false });

        if (portfolioError) {
          console.warn('❌ Error fetching portfolios:', portfolioError.message);
        } else if (portfolioData) {
          console.log('✅ Portfolio data found:', portfolioData);
          setPortfolios(portfolioData as unknown as Portfolio[]);
        }

        // Fetch social links data
        const { data: socialData, error: socialError } = await supabase
          .from('talent_social_links' as any)
          .select('*')
          .eq('user_id', talentId || '');

        if (socialError) {
          console.warn('❌ Error fetching social links:', socialError.message);
        } else if (socialData) {
          console.log('✅ Social links data found:', socialData);
          setSocialLinks(socialData as unknown as SocialLink[]);
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

  // Function to convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } else if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    return url;
  };

  const handleVideoClick = () => {
    setIsVideoPlaying(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-600" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-600" />;
      case 'github':
        return <Github className="h-5 w-5 text-gray-800" />;
      case 'twitter':
      case 'x':
        return <XIcon className="h-5 w-5 text-gray-900" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      default:
        return <ExternalLink className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil del talento...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h2>
          <p className="text-gray-600 mb-6">El perfil del talento que buscas no existe o no está disponible.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Perfil de Talento</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile.avatar_url || undefined} alt={userProfile.full_name || ''} />
                    <AvatarFallback className="text-2xl">
                      {userProfile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{userProfile.full_name}</h2>
                    
                    <p className="text-gray-600">{talentProfile?.title || userProfile.position || 'Talento Digital'}</p>
                    
                    {/* Location - Show only if available */}
                    {(userProfile.city || userProfile.country) && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {userProfile.city && userProfile.country 
                          ? `${userProfile.city}, ${userProfile.country}` 
                          : userProfile.city || userProfile.country}
                      </p>
                    )}
                    
                    {/* Academy Badges */}
                    {affiliations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {affiliations.map((affiliation, index) => (
                          <AcademyCertificationBadge
                            key={`${affiliation.academy_id}-${index}`}
                            certification={{
                              academy_id: affiliation.academy_id,
                              academy_name: affiliation.academy_name,
                              certification_date: affiliation.graduation_date || '',
                              program: affiliation.program_name || '',
                              badge_color: affiliation.brand_color || '#3b82f6',
                            }}
                            size="sm"
                            showProgram={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Skills */}
                  {talentProfile?.skills && talentProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {talentProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Experience - Show only if available */}
                  {talentProfile?.years_experience && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>
                        {talentProfile.years_experience >= 4 ? 'Senior' : 'Junior'} • {talentProfile.years_experience} años
                      </span>
                    </div>
                  )}
                  
                  <Button onClick={handleSendMessage} className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>

                  {/* Social Links */}
                  {socialLinks && socialLinks.length > 0 && (
                    <div className="flex justify-center gap-4 mt-4">
                      {socialLinks.map((link, index) => (
                        <button
                          key={index}
                          onClick={() => window.open(link.url, '_blank')}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          title={link.platform}
                        >
                          {getPlatformIcon(link.platform)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {talentProfile?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>Biografía</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {talentProfile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Portfolio - Only show if there are portfolios */}
            {portfolios && portfolios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <p className="text-sm text-gray-600">Ve el portfolio de trabajos</p>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => portfolios[0]?.url && window.open(portfolios[0].url, '_blank')}
                  >
                    Ver Portfolio
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Share Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Compartir este perfil</CardTitle>
                <p className="text-sm text-gray-600">Comparte el perfil en redes sociales o genera un QR</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowShareModal(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Opciones para compartir
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
          </div>

          {/* Right Column - Experience & Education */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Presentation */}
            {videoPresentationUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-red-500 rounded flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-sm"></div>
                    </div>
                    Video de Presentación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isVideoPlaying ? (
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden group cursor-pointer"
                         onClick={handleVideoClick}>
                      <VideoThumbnail url={videoPresentationUrl} />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all duration-200">
                        <div className="h-12 w-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-200">
                          <Play className="h-6 w-6 text-gray-800 ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black rounded-lg aspect-video overflow-hidden">
                      <iframe
                        src={getEmbedUrl(videoPresentationUrl)}
                        title="Video de Presentación"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(workExperience.length > 0 ? workExperience : workExperienceRef.current)
                    .slice(0, showAllWorkExperience ? undefined : 3)
                    .map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">{exp.position || 'Puesto'}</h4>
                        <p className="text-gray-600">{exp.company || 'Empresa'}</p>
                        {exp.description && (
                          <p className="text-sm text-gray-500 mb-2 whitespace-pre-line">{exp.description}</p>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {exp.start_date ? 
                            `${format(new Date(exp.start_date), 'MMM yyyy', { locale: es })}${(exp.current || exp.is_current) ? ' - Presente' : exp.end_date ? ` - ${format(new Date(exp.end_date), 'MMM yyyy', { locale: es })}` : ''}` :
                            'Fecha no disponible'
                          }
                        </div>
                        {exp.location && (
                          <p className="text-sm text-gray-500 mt-1">{exp.location}</p>
                        )}
                      </div>
                    ))}
                  
                  {/* Show More/Less Button */}
                  {(workExperience.length > 0 ? workExperience : workExperienceRef.current).length > 3 && (
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAllWorkExperience(!showAllWorkExperience)}
                        className="w-full"
                      >
                        {showAllWorkExperience ? 
                          `Ver menos (mostrando ${(workExperience.length > 0 ? workExperience : workExperienceRef.current).length} de ${(workExperience.length > 0 ? workExperience : workExperienceRef.current).length})` :
                          `Ver todas las experiencias (${(workExperience.length > 0 ? workExperience : workExperienceRef.current).length - 3} más)`
                        }
                      </Button>
                    </div>
                  )}

                  {/* Show message if no experience */}
                  {workExperience.length === 0 && workExperienceRef.current.length === 0 && (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se ha agregado información de experiencia laboral</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(education.length > 0 ? education : educationRef.current)
                    .slice(0, showAllEducation ? undefined : 3)
                    .map((edu, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900">{edu.degree || 'Título'}</h4>
                        <p className="text-gray-600">{edu.institution || 'Institución'}</p>
                        {(edu.field_of_study || edu.field) && (
                          <p className="text-sm text-gray-500 mb-2">{edu.field_of_study || edu.field}</p>
                        )}
                        {edu.description && (
                          <p className="text-sm text-gray-500 whitespace-pre-line">{edu.description}</p>
                        )}
                        {edu.graduation_year && (
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            Graduado en {edu.graduation_year}
                          </div>
                        )}
                        {edu.start_date && !edu.graduation_year && (
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(edu.start_date), 'MMM yyyy', { locale: es })}
                            {edu.current ? ' - Presente' : edu.end_date ? ` - ${format(new Date(edu.end_date), 'MMM yyyy', { locale: es })}` : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  
                  {/* Show More/Less Button */}
                  {(education.length > 0 ? education : educationRef.current).length > 3 && (
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAllEducation(!showAllEducation)}
                        className="w-full"
                      >
                        {showAllEducation ? 
                          `Ver menos (mostrando ${(education.length > 0 ? education : educationRef.current).length} de ${(education.length > 0 ? education : educationRef.current).length})` :
                          `Ver toda la educación (${(education.length > 0 ? education : educationRef.current).length - 3} más)`
                        }
                      </Button>
                    </div>
                  )}

                  {/* Show message if no education */}
                  {education.length === 0 && educationRef.current.length === 0 && (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se ha agregado información de educación</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Published Services */}
            {talentId && userProfile && (
              <TalentServices
                userId={talentId}
                talentName={userProfile.full_name || 'Talento'}
                talentAvatar={userProfile.avatar_url || undefined}
                onContact={handleContactTalent}
              />
            )}
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

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default PublicTalentProfile;
