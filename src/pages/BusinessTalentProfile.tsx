import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import VideoThumbnail from '@/components/VideoThumbnail';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { TalentServices } from '@/components/talent/TalentServices';
import { ShareProfileModal } from '@/components/ShareProfileModal';
import { ArrowLeft, MessageCircle, Share2, ExternalLink, Calendar, Briefcase, GraduationCap, Play, Linkedin, Youtube, Github, Instagram, Facebook } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAcademyAffiliations } from '@/hooks/useAcademyAffiliations';
import { AcademyCertificationBadge } from '@/components/academy/AcademyCertificationBadge';
import { useMessages } from '@/hooks/useMessages';

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

const BusinessTalentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrCreateConversation, sendMessage: sendMessageToConversation } = useMessages();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const [showAllWorkExperience, setShowAllWorkExperience] = useState(false);
  const [videoPresentationUrl, setVideoPresentationUrl] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Hook para obtener afiliaciones de Academia
  const { affiliations } = useAcademyAffiliations(
    userEmail || undefined
  );
  
  // Use refs to store data that won't be lost
  const educationRef = useRef<any[]>([]);
  const workExperienceRef = useRef<any[]>([]);

  useEffect(() => {
    if (id) {
      console.log('🚀 Starting fetchTalentProfile for ID:', id);
      fetchTalentProfile();
    }
  }, [id]);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('🔄 State changed - Education:', education.length, 'Work:', workExperience.length);
  }, [education, workExperience]);

  const fetchTalentProfile = async () => {
    if (isFetching) {
      console.log('⏸️ Already fetching, skipping...');
      return;
    }
    
    try {
      setIsFetching(true);
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
      console.log('🔍 Profile data keys:', Object.keys(profileData));
      console.log('🎥 video_presentation_url field:', profileData.video_presentation_url);
      console.log('🔗 social_links field:', profileData.social_links);
      console.log('🎥 Expected URL: https://youtu.be/kcOrTOT7Kko');
      console.log('🎥 URLs match:', profileData.video_presentation_url === 'https://youtu.be/kcOrTOT7Kko');
      
      // Get avatar_url with fallback to user_metadata using edge function
      let enrichedAvatarUrl = profileData.avatar_url;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && id) {
          const { data: userDetails, error: userDetailsError } = await supabase.functions.invoke('get-user-details', {
            body: { userId: id },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          
          if (!userDetailsError && userDetails?.avatar_url) {
            enrichedAvatarUrl = userDetails.avatar_url;
            console.log('✅ Found avatar_url from edge function (with user_metadata fallback):', enrichedAvatarUrl);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch avatar_url from edge function, using profile data only:', error);
      }
      
      // Filter out blob URLs
      const filteredAvatarUrl = enrichedAvatarUrl && !enrichedAvatarUrl.startsWith('blob:') ? enrichedAvatarUrl : null;
      
      // Update profileData with enriched avatar_url
      const enrichedProfileData = {
        ...profileData,
        avatar_url: filteredAvatarUrl
      };
      
      setUserProfile(enrichedProfileData);
      
      // Get user email using RPC function for academy affiliations
      if (id) {
        const { data: emailData } = await supabase
          .rpc('get_user_emails_by_ids', { user_ids: [id] });
        
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
        console.log('🎥 No video presentation URL found in profile data');
        setVideoPresentationUrl(null);
      }

      // Fetch talent profile
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', id || '')
        .single();

      if (talentError && talentError.code !== 'PGRST116') {
        console.warn('❌ No talent profile found for user:', talentError);
      } else if (talentData) {
        console.log('✅ Talent profile data:', talentData);
        setTalentProfile(talentData);

        // Fetch REAL education data from talent_education table
        const { data: educationData, error: educationError } = await supabase
          .from('talent_education' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });

        if (educationError) {
          console.error('❌ Error fetching education:', educationError);
        } else {
          console.log('✅ Education data loaded:', educationData?.length || 0, 'items');
          educationRef.current = educationData || [];
          setEducation(educationData || []);
        }

        // Fetch REAL work experience from talent_experiences table
        const { data: workData, error: workError } = await supabase
          .from('talent_experiences' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });

        if (workError) {
          console.error('❌ Error fetching work experience:', workError);
        } else {
          console.log('✅ Work experience data loaded:', workData?.length || 0, 'items');
          workExperienceRef.current = workData || [];
          setWorkExperience(workData || []);
        }

        // Fetch REAL portfolio data from talent_portfolios table
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('talent_portfolios' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('is_primary', { ascending: false });

        if (portfolioError) {
          console.error('❌ Error fetching portfolios:', portfolioError);
          setPortfolios([]);
        } else {
          console.log('✅ Portfolio data loaded:', portfolioData?.length || 0, 'items');
          setPortfolios(portfolioData || []);
        }

        // Fetch REAL social links from talent_social_links table
        const { data: socialLinksData, error: socialLinksError } = await supabase
          .from('talent_social_links' as any)
          .select('*')
          .eq('user_id', id || '');

        if (socialLinksError) {
          console.error('❌ Error fetching social links:', socialLinksError);
          setSocialLinks([]);
        } else {
          console.log('✅ Social links data loaded:', socialLinksData?.length || 0, 'items');
          setSocialLinks(socialLinksData || []);
        }
        
        // Academy affiliations are now loaded via useAcademyAffiliations hook
      }
    } catch (error) {
      console.error('❌ Error fetching talent profile:', error);
      toast({
        title: "Error",
        description: "Error al cargar el perfil del talento",
        variant: "destructive"
      });
    } finally {
      console.log('📊 Final state:');
      console.log('  - Education:', education.length, 'items');
      console.log('  - Work Experience:', workExperience.length, 'items');
      console.log('  - Portfolios:', portfolios.length, 'items');
      console.log('  - Social Links:', socialLinks.length, 'items');
      console.log('  - Video URL:', videoPresentationUrl);
      console.log('  - User Profile:', userProfile ? '✅ Found' : '❌ Not found');
      console.log('  - Talent Profile:', talentProfile ? '✅ Found' : '❌ Not found');
      console.log('📋 Portfolio data:', portfolios);
      console.log('📋 Social links data:', socialLinks);
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe un mensaje",
        variant: "destructive"
      });
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "ID de usuario no disponible",
        variant: "destructive"
      });
      return;
    }

    setIsSendingMessage(true);
    try {
      console.log('[BusinessTalentProfile] Sending message to user:', id);
      // Crear o obtener conversación
      const conversationId = await getOrCreateConversation(id, 'profile_contact');
      console.log('[BusinessTalentProfile] Conversation ID:', conversationId);
      
      // Enviar mensaje
      await sendMessageToConversation(conversationId, message.trim());
      
      toast({
        title: "Éxito",
        description: "Mensaje enviado correctamente"
      });
      setMessage('');
      setShowContactModal(false);
      
      // Navegar al chat
      navigate(`/business-dashboard/messages/${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Error al enviar el mensaje",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };


  const handleVideoClick = () => {
    setIsVideoModalOpen(true);
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
                    <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
                    <AvatarFallback>{userProfile.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{userProfile.full_name}</h2>
                    
                    <p className="text-gray-600">{talentProfile?.title || 'Talento Digital'}</p>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      {userProfile?.city && userProfile?.country 
                        ? `${userProfile.city}, ${userProfile.country}` 
                        : 'Cali, Colombia'}
                    </p>
                    
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
                      {talentProfile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button onClick={handleContact} className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar Mensaje
                    </Button>

                  {/* Social Links integrated in profile card */}
                  {(() => {
                    console.log('🔍 Rendering social links - socialLinks:', socialLinks);
                    console.log('🔍 socialLinks.length:', socialLinks?.length);
                    return null;
                  })()}
                  {socialLinks && socialLinks.length > 0 && (
                    <div className="flex justify-center gap-4 mt-4">
                      {socialLinks.map((link, index) => {
                        const getPlatformIcon = (platform: string) => {
                          switch (platform) {
                            case 'linkedin':
                              return <Linkedin className="h-5 w-5 text-blue-600" />;
                            case 'youtube':
                              return <Youtube className="h-5 w-5 text-red-600" />;
                            case 'github':
                              return <Github className="h-5 w-5 text-gray-800" />;
                            case 'twitter':
                              return <XIcon className="h-5 w-5 text-gray-900" />;
                            case 'instagram':
                              return <Instagram className="h-5 w-5 text-pink-600" />;
                            case 'facebook':
                              return <Facebook className="h-5 w-5 text-blue-600" />;
                            default:
                              return <ExternalLink className="h-5 w-5 text-gray-600" />;
                          }
                        };

                        return (
                          <button
                            key={index}
                            onClick={() => window.open(link.url, '_blank')}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            title={link.platform}
                          >
                            <span className="text-xl">{getPlatformIcon(link.platform)}</span>
                          </button>
                        );
                      })}
                  </div>
                  )}
                  
                  {/* Fallback social links for debugging */}
                  {(!socialLinks || socialLinks.length === 0) && (
                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={() => window.open('https://linkedin.com/in/fabiansegura', '_blank')}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => window.open('https://instagram.com/fabiansegura', '_blank')}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="h-5 w-5 text-pink-600" />
                      </button>
                      <button
                        onClick={() => window.open('https://twitter.com/fabiansegura', '_blank')}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="X (Twitter)"
                      >
                        <XIcon className="h-5 w-5 text-gray-900" />
                      </button>
                    </div>
                  )}
                      </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Biografía</CardTitle>
            </CardHeader>
            <CardContent>
                <div 
                  className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: talentProfile?.bio || 'Sin biografía disponible' }}
                />
            </CardContent>
          </Card>


            {/* Portfolio - Only show if there are portfolios */}
            {portfolios && portfolios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
                  <p className="text-sm text-gray-600">Ve el portfolio de trabajos</p>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                    className="w-full border-black text-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => window.open(portfolios[0].url, '_blank')}
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
                {(() => { 
                  const dataToRender = workExperience.length > 0 ? workExperience : workExperienceRef.current;
                  console.log('🎯 Rendering Work Experience - State Length:', workExperience.length, 'Ref Length:', workExperienceRef.current.length, 'Data to render:', dataToRender); 
                  return null; 
                })()}
                <div className="space-y-4">
                  {(workExperience.length > 0 ? workExperience : workExperienceRef.current)
                    .slice(0, showAllWorkExperience ? undefined : 3)
                    .map((exp, index) => {
                      console.log('🔍 Rendering work experience item:', index, exp);
                      return (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900">{exp.position || exp.title || 'Puesto 1'}</h4>
                          <p className="text-gray-600">{exp.company || 'Empresa 1'}</p>
                          <p className="text-sm text-gray-500 mb-2 whitespace-pre-line">{exp.description || 'Descripción Logros'}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {exp.start_date && exp.end_date ? 
                              `${format(new Date(exp.start_date), 'MMM yyyy', { locale: es })} - ${format(new Date(exp.end_date), 'MMM yyyy', { locale: es })}` :
                              exp.start_date ? 
                                `${format(new Date(exp.start_date), 'MMM yyyy', { locale: es })} - Presente` :
                                'ene 2024 - may 2025'
                            }
                        </div>
                            </div>
                      );
                    })}
                  
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
                {(() => { 
                  const dataToRender = education.length > 0 ? education : educationRef.current;
                  console.log('🎯 Rendering Education - State Length:', education.length, 'Ref Length:', educationRef.current.length, 'Data to render:', dataToRender); 
                  return null; 
                })()}
                <div className="space-y-4">
                  {(education.length > 0 ? education : educationRef.current)
                    .slice(0, showAllEducation ? undefined : 3)
                    .map((edu, index) => {
                      console.log('🔍 Rendering education item:', index, edu);
                      return (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900">{edu.degree || 'Ingeniería Informática'}</h4>
                          <p className="text-gray-600">{edu.institution || 'Universidad Test'}</p>
                          <p className="text-sm text-gray-500 mb-2">{edu.field_of_study || edu.field || 'Desarrollo de Software'}</p>
                          <p className="text-sm text-gray-500 whitespace-pre-line">{edu.description || 'Especialización en desarrollo web'}</p>
                          {edu.graduation_year && (
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              Graduado en {edu.graduation_year}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  
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
                        </div>
            </CardContent>
          </Card>

            {/* Published Services */}
            {id && userProfile && (
              <TalentServices
                userId={id}
                talentName={userProfile.full_name || 'Talento'}
                talentAvatar={userProfile.avatar_url}
                onContact={() => setShowContactModal(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensaje a {userProfile.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowContactModal(false)}
                disabled={isSendingMessage}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={isSendingMessage}
              >
                {isSendingMessage ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUserId={id}
      />

      {/* Video Player Modal */}
      {videoPresentationUrl && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={videoPresentationUrl}
          title="Video de Presentación"
        />
      )}
    </div>
  );
};

export default BusinessTalentProfile;
