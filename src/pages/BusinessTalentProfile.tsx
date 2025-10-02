import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Briefcase, GraduationCap, Clock, MessageSquare, Send, Video } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TalentServices } from '@/components/talent/TalentServices';
import { useMessages } from '@/hooks/useMessages';
import VideoThumbnail from '@/components/VideoThumbnail';

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

const BusinessTalentProfile = () => {
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
  
  // Use the real messaging hook
  const { sendMessage, getOrCreateConversation } = useMessages();

  useEffect(() => {
    if (id) {
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
        
        console.log('🔍 Searching for education data...');
        console.log('  - User ID:', id);
        console.log('  - Talent Profile ID:', talentData.id);
        
        // Try new system first (talent_education with user_id)
        console.log('🔍 Trying talent_education table with user_id:', id);
        const { data: newEducationData, error: _newEducationError } = await supabase
          .from('talent_education' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('start_date', { ascending: false });

        console.log('  - talent_education result:', newEducationData?.length || 0, 'items');
        if (newEducationData && newEducationData.length > 0) {
          educationData = newEducationData;
          console.log('✅ Education data found (new system):', educationData);
        } else {
          // Try old system (education with talent_profile_id)
          console.log('🔍 Trying education table with talent_profile_id:', talentData.id);
          const { data: oldEducationData, error: _oldEducationError } = await supabase
            .from('education')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('graduation_year', { ascending: false });

          console.log('  - education result:', oldEducationData?.length || 0, 'items');
          if (oldEducationData && oldEducationData.length > 0) {
            educationData = oldEducationData;
            console.log('✅ Education data found (old system):', educationData);
          } else {
            console.log('⚠️ No education data found for user:', id);
            
            // Let's check what education data exists for this user in any table
            console.log('🔍 Checking all education tables...');
            const { data: allEducationData } = await supabase
              .from('education' as any)
              .select('*')
              .or(`talent_profile_id.eq.${talentData.id},user_id.eq.${id}`);
            console.log('  - All education data found:', allEducationData?.length || 0, 'items', allEducationData);
          }
        }
        
        setEducation(educationData || []);

        // Fetch work experience data - try both systems
        let workData = null;
        
        console.log('🔍 Searching for work experience data...');
        console.log('  - User ID:', id);
        console.log('  - Talent Profile ID:', talentData.id);
        
        // Try new system first (talent_experiences with user_id)
        console.log('🔍 Trying talent_experiences table with user_id:', id);
        const { data: newWorkData, error: _newWorkError } = await supabase
          .from('talent_experiences' as any)
          .select('*')
          .eq('user_id', id || '')
          .order('start_date', { ascending: false });

        console.log('  - talent_experiences result:', newWorkData?.length || 0, 'items');
        if (newWorkData && newWorkData.length > 0) {
          workData = newWorkData;
          console.log('✅ Work experience data found (new system):', workData);
        } else {
          // Try old system (work_experience with talent_profile_id)
          console.log('🔍 Trying work_experience table with talent_profile_id:', talentData.id);
          const { data: oldWorkData, error: _oldWorkError } = await supabase
            .from('work_experience')
            .select('*')
            .eq('talent_profile_id', talentData.id)
            .order('start_date', { ascending: false });

          console.log('  - work_experience result:', oldWorkData?.length || 0, 'items');
          if (oldWorkData && oldWorkData.length > 0) {
            workData = oldWorkData;
            console.log('✅ Work experience data found (old system):', workData);
          } else {
            console.log('⚠️ No work experience data found for user:', id);
            
            // Let's check what work experience data exists for this user in any table
            console.log('🔍 Checking all work experience tables...');
            const { data: allWorkData } = await supabase
              .from('work_experience' as any)
              .select('*')
              .or(`talent_profile_id.eq.${talentData.id},user_id.eq.${id}`);
            console.log('  - All work experience data found:', allWorkData?.length || 0, 'items', allWorkData);
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
      console.log('  - Education:', education.length, 'items', education);
      console.log('  - Work Experience:', workExperience.length, 'items', workExperience);
      console.log('  - Portfolios:', portfolios.length, 'items', portfolios);
      console.log('  - Social Links:', socialLinks.length, 'items', socialLinks);
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
      // Get or create conversation
      const conversationId = await getOrCreateConversation(id);
      
      // Send message
      const result = await sendMessage({
        conversation_id: conversationId,
        recipient_id: id,
        message_type: 'text',
        content: contactMessage.trim(),
      });
      
      if (result) {
        toast.success('Mensaje enviado exitosamente');
        setShowContactModal(false);
        setContactMessage("");
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
                  </div>
                </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Profile Header Card - Main Profile Info */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={userProfile.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {userProfile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">{userProfile.full_name}</CardTitle>
                      <p className="text-muted-foreground font-medium">
                        {userProfile.position || 'Talento Digital'}
                      </p>
                      {talentProfile?.years_experience && (
                        <p className="text-sm text-muted-foreground">
                          {talentProfile.years_experience >= 4 ? 'Senior' : 'Junior'} (+{talentProfile.years_experience} años)
                        </p>
                      )}
                    </div>
                    {isBusinessRole(userRole) && (
                      <Button onClick={handleContact} className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto">
                      Enviar Mensaje
                    </Button>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className="text-sm text-muted-foreground mb-3">
                    Ubicación / País
                  </div>
                  
                  {/* Skills/Tags */}
                  {talentProfile?.skills && talentProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {talentProfile.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                      </div>
                  </div>
            </CardHeader>
            <CardContent>
              {/* Bio/Summary */}
              {talentProfile?.bio && (
                <div className="mb-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {talentProfile.bio.length > 150 
                      ? `${talentProfile.bio.substring(0, 150)}...` 
                      : talentProfile.bio
                    }
                  </p>
                </div>
              )}
              
              {/* Social Media Links - Like in the image */}
                  <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center cursor-pointer hover:bg-red-700">
                      <span className="text-white text-xs">▶</span>
                    </div>
                    <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-700">
                      <span className="text-white text-xs font-bold">f</span>
                    </div>
                    <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center cursor-pointer hover:bg-green-600">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                  </div>
            </CardContent>
          </Card>

          {/* Portfolio Card - Like in the image */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <p className="text-sm text-muted-foreground">Ve el portfolio de trabajos</p>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  if (talentProfile?.portfolio_url) {
                    window.open(talentProfile.portfolio_url, '_blank');
                  } else if (portfolios.length > 0) {
                    window.open(portfolios[0].url, '_blank');
                  } else {
                    toast.info('No hay portfolio disponible');
                  }
                }}
              >
                Ver Portfolio →
              </Button>
            </CardContent>
          </Card>

          {/* Share Profile Card - Like in the image */}
          <Card>
            <CardHeader>
              <CardTitle>Compartir este perfil</CardTitle>
              <p className="text-sm text-muted-foreground">Copia el link para compartir el perfil público</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copiado al portapapeles');
                  }}
                >
                  Link
                </Button>
              </div>
            </CardContent>
          </Card>
              </div>

        {/* Right Column - Professional Sections */}
        <div className="space-y-6">
          {/* Video de Presentación */}
          {userProfile?.video_presentation_url && (
            <Card>
              <CardHeader>
                <CardTitle>Video de Presentación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-48 bg-gray-100 rounded-lg relative group overflow-hidden">
                  <VideoThumbnail url={userProfile.video_presentation_url} />
                  
                  {/* Hover overlay with play button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      onClick={() => window.open(userProfile.video_presentation_url!, '_blank')} 
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

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Experiencia</CardTitle>
            </CardHeader>
            <CardContent>
              {console.log('🎯 Rendering Work Experience - Length:', workExperience.length, 'Data:', workExperience)}
              {workExperience.length > 0 ? (
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
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se ha agregado información de experiencia</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Educación</CardTitle>
            </CardHeader>
            <CardContent>
              {console.log('🎯 Rendering Education - Length:', education.length, 'Data:', education)}
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

          {/* Servicios Publicados - Like in the image */}
          <Card>
            <CardHeader>
              <CardTitle>Servicios Publicados</CardTitle>
            </CardHeader>
            <CardContent>
              {isBusinessRole(userRole) ? (
                <TalentServices 
                  userId={id || ''}
                  talentName={userProfile?.full_name || 'Talento'}
                  talentAvatar={userProfile?.avatar_url || undefined}
                  onContact={handleContact}
                />
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Servicios publicados próximamente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar a {userProfile?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                onClick={() => setShowContactModal(false)}
                >
                Cancelar
                </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={isSendingMessage || !contactMessage.trim()}
              >
                {isSendingMessage ? (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessTalentProfile;