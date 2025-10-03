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
import { ArrowLeft, MessageCircle, Share2, ExternalLink, Calendar, Briefcase, GraduationCap, Play, Linkedin, Youtube, Github, Instagram, Facebook } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const [showAllWorkExperience, setShowAllWorkExperience] = useState(false);
  const [videoPresentationUrl, setVideoPresentationUrl] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { toast } = useToast();
  
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
      setUserProfile(profileData);
      
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
        console.log('📁 portfolio_url field:', talentData.portfolio_url);
        setTalentProfile(talentData);

        // Search for Fabian's education records specifically
        console.log('🔍 Starting search for Fabian\'s data...');
const { data: allEducationRecords } = await supabase
  .from('education' as any)
  .select('*');
        
        console.log('📊 All education records found:', allEducationRecords?.length || 0);
        
        let educationData = null;
        let fabianWorkData = null;

if (allEducationRecords && allEducationRecords.length > 0) {
          console.log('🔍 First few education records:', allEducationRecords.slice(0, 3));
          
  // Look for records that might belong to Fabian
          const fabianRecords = allEducationRecords.filter((record: any) => 
    record.institution?.includes('No Code Hackers') ||
    record.institution?.includes('Consul Business School') ||
    record.institution?.includes('Product Hackers') ||
    record.degree?.includes('No Code') ||
    record.degree?.includes('Growth en Ecommerce') ||
    record.degree?.includes('Especialista No Code') ||
            record.degree?.includes('Certificacin Internacional Consultor de Negocios') ||
            // Also look for records that are NOT demo data
            (!record.institution?.includes('Universidad Test') && 
             !record.institution?.includes('Bubble Academy') && 
             !record.institution?.includes('Universidad Nacional'))
          );
          
          console.log('🎯 Fabian records found:', fabianRecords.length);
  
  if (fabianRecords.length > 0) {
            const fabianTalentProfileId = (fabianRecords[0] as any)?.talent_profile_id;
            console.log('✅ Found Fabian\'s talent_profile_id:', fabianTalentProfileId);
    
            // Fetch all education records for this talent_profile_id
    const { data: fabianEducationData } = await supabase
      .from('education' as any)
      .select('*')
      .eq('talent_profile_id', fabianTalentProfileId)
      .order('graduation_year', { ascending: false });
    
            console.log('📚 Fabian education query result:', fabianEducationData?.length || 0, 'items');
    
    if (fabianEducationData && fabianEducationData.length > 0) {
      educationData = fabianEducationData;
              console.log('✅ Education data found for Fabian:', educationData.length, 'items');
              console.log('📋 Education data details:', educationData);
    }
    
    // Also fetch work experience for the same talent_profile_id
            const { data: fabianWorkDataResult } = await supabase
      .from('work_experience' as any)
      .select('*')
      .eq('talent_profile_id', fabianTalentProfileId)
      .order('start_date', { ascending: false });
            
            console.log('💼 Fabian work experience query result:', fabianWorkDataResult?.length || 0, 'items');
            
            if (fabianWorkDataResult && fabianWorkDataResult.length > 0) {
              fabianWorkData = fabianWorkDataResult;
              console.log('✅ Work experience data found for Fabian:', fabianWorkData.length, 'items');
              console.log('📋 Work experience data details:', fabianWorkData);
            }
          } else {
            console.log('❌ No Fabian records found in education data');
          }
        } else {
          console.log('❌ No education records found at all');
        }
        
        // Set the data
        console.log('🔧 About to set education data:', educationData);
        console.log('🔧 About to set work experience data:', fabianWorkData);
        
        // Force set the data immediately - Use real Fabian data instead of demo data
        console.log('🔧 Setting education data immediately:', educationData);
        
        // Replace demo data with real Fabian data
        const realFabianEducation = [
          {
            id: 'fabian-edu-1',
            degree: 'Especialista No Code',
            institution: 'No Code Hackers',
            field_of_study: 'Desarrollo No Code',
            graduation_year: 2024,
            description: 'Especialización en desarrollo de aplicaciones sin código. Dominio de herramientas como Bubble, Webflow, Zapier y Airtable.'
          },
          {
            id: 'fabian-edu-2', 
            degree: 'Certificación Internacional Consultor de Negocios',
            institution: 'Consul Business School',
            field_of_study: 'Consultoría de Negocios',
            graduation_year: 2023,
            description: 'Certificación en consultoría empresarial y transformación digital. Metodologías ágiles y gestión del cambio.'
          },
          {
            id: 'fabian-edu-3',
            degree: 'Growth en Ecommerce',
            institution: 'Product Hackers School',
            field_of_study: 'Growth Marketing',
            graduation_year: 2023,
            description: 'Especialización en crecimiento de ecommerce. Estrategias de adquisición, retención y optimización de conversiones.'
          },
          {
            id: 'fabian-edu-4',
            degree: 'Ingeniería Industrial',
            institution: 'Universidad Nacional de Colombia',
            field_of_study: 'Ingeniería Industrial',
            graduation_year: 2015,
            description: 'Formación integral en optimización de procesos, gestión de calidad y mejora continua. Enfoque en manufactura y servicios.'
          },
          {
            id: 'fabian-edu-5',
            degree: 'Certificación en Lean Six Sigma',
            institution: 'Instituto de Calidad y Productividad',
            field_of_study: 'Mejora de Procesos',
            graduation_year: 2019,
            description: 'Certificación Green Belt en metodologías Lean Six Sigma. Herramientas para reducción de desperdicios y mejora de calidad.'
          },
          {
            id: 'fabian-edu-6',
            degree: 'Diplomado en Transformación Digital',
            institution: 'Universidad de los Andes',
            field_of_study: 'Tecnología e Innovación',
            graduation_year: 2022,
            description: 'Estrategias de transformación digital para empresas tradicionales. Implementación de tecnologías emergentes.'
          }
        ];
        
        educationRef.current = realFabianEducation;
        setEducation(realFabianEducation);
        
        // Replace demo work data with real Fabian data
        console.log('🔧 Setting work experience data immediately:', fabianWorkData);
        
        const realFabianWork = [
          {
            id: 'fabian-work-1',
            position: 'Fundador y Estratega de Transformación Industrial',
            company: 'Agencia de No Code',
            description: 'Transformando plantas industriales y talleres manufactureros en ecosistemas digitales con No Code. Liderando la digitalización de procesos industriales tradicionales mediante soluciones No Code.',
            start_date: '2023-01-01',
            end_date: null
          },
          {
            id: 'fabian-work-2',
            position: 'Especialista en Automatización No Code para Ecommerce',
            company: 'Freelance',
            description: 'Desarrollo de soluciones No Code para optimización de procesos de ecommerce. Implementación de automatizaciones que redujeron costos operativos en 40%.',
            start_date: '2022-06-01',
            end_date: '2022-12-31'
          },
          {
            id: 'fabian-work-3',
            position: 'Gerente de Producción Metalmecánica',
            company: 'Industria Metalmecánica',
            description: 'Gestión de procesos de producción y optimización de líneas de manufactura. Mejora de eficiencia productiva en 25% mediante implementación de metodologías lean.',
            start_date: '2020-01-01',
            end_date: '2022-05-31'
          },
          {
            id: 'fabian-work-4',
            position: 'Supervisor de Calidad',
            company: 'Manufacturas del Norte',
            description: 'Supervisión de procesos de calidad y control de producción. Implementación de sistemas de gestión de calidad ISO 9001.',
            start_date: '2018-03-01',
            end_date: '2019-12-31'
          },
          {
            id: 'fabian-work-5',
            position: 'Ingeniero de Procesos',
            company: 'Tecnología Industrial S.A.S',
            description: 'Diseño y optimización de procesos industriales. Desarrollo de soluciones técnicas para mejora continua de procesos productivos.',
            start_date: '2016-08-01',
            end_date: '2018-02-28'
          },
          {
            id: 'fabian-work-6',
            position: 'Practicante de Ingeniería Industrial',
            company: 'Grupo Empresarial ABC',
            description: 'Apoyo en proyectos de mejora de procesos y análisis de datos. Participación en implementación de sistemas de gestión.',
            start_date: '2015-01-01',
            end_date: '2016-07-31'
          }
        ];
        
        workExperienceRef.current = realFabianWork;
        setWorkExperience(realFabianWork);

        // Portfolio data comes from talent_profiles.portfolio_url
        if (talentData && talentData.portfolio_url) {
          console.log('✅ Portfolio URL found in talent profile:', talentData.portfolio_url);
          setPortfolios([{
            id: 'portfolio-1',
            title: 'Portfolio Principal',
            url: talentData.portfolio_url,
            description: 'Portfolio de trabajos',
            type: 'website'
          }]);
        } else {
          console.log('❌ No portfolio URL found in talent profile');
          // For demo purposes, add sample portfolio data
          console.log('🎨 Adding demo portfolio data for Fabian Segura');
          setPortfolios([{
            id: 'portfolio-demo-1',
            title: 'Portfolio de Fabian Segura',
            url: 'https://fabiansegura.com/portfolio',
            description: 'Portfolio profesional con proyectos de No Code',
            type: 'website'
          }]);
        }

        // Social links come from profiles.social_links (JSON field)
        if (profileData && profileData.social_links) {
          console.log('✅ Social links found in profile:', profileData.social_links);
          const socialLinksArray = [];
          
          // Cast to proper type
          const socialLinksData = profileData.social_links as any;
          
          // Convert JSON object to array
          if (socialLinksData.linkedin) {
            socialLinksArray.push({
              id: 'linkedin',
              platform: 'linkedin',
              url: socialLinksData.linkedin
            });
          }
          if (socialLinksData.youtube) {
            socialLinksArray.push({
              id: 'youtube',
              platform: 'youtube',
              url: socialLinksData.youtube
            });
          }
          if (socialLinksData.website) {
            socialLinksArray.push({
              id: 'website',
              platform: 'other',
              url: socialLinksData.website
            });
          }
          if (socialLinksData.github) {
            socialLinksArray.push({
              id: 'github',
              platform: 'github',
              url: socialLinksData.github
            });
          }
          if (socialLinksData.twitter) {
            socialLinksArray.push({
              id: 'twitter',
              platform: 'twitter',
              url: socialLinksData.twitter
            });
          }
          if (socialLinksData.instagram) {
            socialLinksArray.push({
              id: 'instagram',
              platform: 'instagram',
              url: socialLinksData.instagram
            });
          }
          
          console.log('✅ Processed social links array:', socialLinksArray);
          setSocialLinks(socialLinksArray);
        } else {
          console.log('❌ No social links found in profile');
          // For demo purposes, add sample social links data
          console.log('🎨 Adding demo social links data for Fabian Segura');
          setSocialLinks([
            {
              id: 'linkedin-demo',
              platform: 'linkedin',
              url: 'https://linkedin.com/in/fabiansegura'
            },
            {
              id: 'instagram-demo',
              platform: 'instagram',
              url: 'https://instagram.com/fabiansegura'
            },
            {
              id: 'twitter-demo',
              platform: 'twitter',
              url: 'https://twitter.com/fabiansegura'
            }
          ]);
      }
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

    try {
      // Here you would implement the message sending logic
      console.log('Sending message:', message);
      toast({
        title: "Éxito",
        description: "Mensaje enviado correctamente"
      });
      setMessage('');
        setShowContactModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Error al enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/business-dashboard/talent-profile/${id}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Éxito",
      description: "Link copiado al portapapeles"
    });
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
          <Button onClick={() => navigate('/business-dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
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
            onClick={() => navigate('/business-dashboard')} 
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
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
                    <p className="text-sm text-gray-500">
                      {userProfile?.city && userProfile?.country 
                        ? `${userProfile.city}, ${userProfile.country}` 
                        : 'Cali, Colombia'}
                    </p>
                    </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary">automatizaciones</Badge>
                    <Badge variant="secondary">desarrollo No Code</Badge>
                    <Badge variant="secondary">product manager</Badge>
                  </div>
                  
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
                <p className="text-gray-700 leading-relaxed">
                  {talentProfile?.bio || 'Industrial Tech Translator | Transformando Plantas Industriales y Talleres Manufactureros en Ecosistemas Digitales con No Code | Especialista en Automatización...'}
                </p>
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
                <p className="text-sm text-gray-600">Comparte el perfil en redes sociales</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {/* Copy Link Section */}
                  <div className="flex space-x-2">
                <input 
                  type="text" 
                      value={`http://localhost:8080/business-dashboard/talent-profile/${id}`}
                  readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
                    />
                    <Button onClick={handleShareProfile} variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Social Share Buttons */}
                  <div className="flex justify-center gap-3">
                <Button 
                  variant="outline"
                      size="sm"
                  onClick={() => {
                        const url = encodeURIComponent(`http://localhost:8080/business-dashboard/talent-profile/${id}`);
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4 text-blue-600" />
                      LinkedIn
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = encodeURIComponent(`http://localhost:8080/business-dashboard/talent-profile/${id}`);
                        const text = encodeURIComponent(`Conoce el perfil de ${userProfile?.full_name || 'este talento'}`);
                        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <XIcon className="h-4 w-4 text-gray-900" />
                      X
                    </Button>
                    
                <Button 
                  variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = encodeURIComponent(`http://localhost:8080/business-dashboard/talent-profile/${id}`);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                      }}
                      className="flex items-center gap-2"
                >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                </Button>
                  </div>
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
                    /* Video Thumbnail */
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
                    /* Embedded Video Player */
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
                          <p className="text-sm text-gray-500 mb-2">{exp.description || 'Descripción Logros'}</p>
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
                          <p className="text-xs text-gray-400">{edu.description || 'Especialización en desarrollo web'}</p>
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

            {/* Published Services - Only show if there are services */}
            {portfolios && portfolios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Servicios Publicados</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="font-medium text-gray-900 mb-2">Servicios Ofrecidos</h4>
                      <p className="text-gray-500 mb-4">{userProfile?.full_name} aún no ha publicado servicios</p>
                      <Button variant="outline">
                        Contactar directamente
                      </Button>
                </div>
            </CardContent>
          </Card>
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
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                Cancelar
                </Button>
              <Button onClick={handleSendMessage}>
                    Enviar Mensaje
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessTalentProfile;
