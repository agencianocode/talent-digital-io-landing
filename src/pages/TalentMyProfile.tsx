import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  Plus, 
  Share2, 
  Edit, 
  MapPin, 
  Phone, 
  Video,
  DollarSign,
  Clock,
  TrendingUp
} from "lucide-react";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ShareProfileModal } from "@/components/ShareProfileModal";
import { PortfolioSection } from "@/components/PortfolioSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { EducationSection } from "@/components/EducationSection";
import { SocialLinksSection } from "@/components/SocialLinksSection";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileSharing } from "@/hooks/useProfileSharing";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useExperience } from "@/hooks/useExperience";
import { useEducation } from "@/hooks/useEducation";
import { useSocialLinks } from "@/hooks/useSocialLinks";

const TalentMyProfile = () => {
  const { user } = useSupabaseAuth();
  const { profile, userProfile, getProfileCompleteness } = useProfileData();
  const { generatePublicUrl, copyToClipboard } = useProfileSharing();
  
  // Hooks for getting real data counts
  const { portfolios } = usePortfolio();
  const { experiences } = useExperience();
  const { education } = useEducation();
  const { socialLinks } = useSocialLinks();
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Force refresh state to trigger re-renders
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when data changes
  useEffect(() => {
    console.log('🔄 TalentMyProfile - Data changed, forcing refresh', {
      portfolios: portfolios.length,
      experiences: experiences.length,
      education: education.length,
      socialLinks: socialLinks.length
    });
    setRefreshKey(prev => prev + 1);
  }, [portfolios.length, experiences.length, education.length, socialLinks.length]);

  // Listen for custom events from hooks
  useEffect(() => {
    const handleExperienceUpdate = (event: CustomEvent) => {
      console.log('📡 TalentMyProfile - Received experienceUpdated event:', event.detail);
      setRefreshKey(prev => prev + 1);
    };

    const handleEducationUpdate = (event: CustomEvent) => {
      console.log('📡 TalentMyProfile - Received educationUpdated event:', event.detail);
      setRefreshKey(prev => prev + 1);
    };

    const handlePortfolioUpdate = (event: CustomEvent) => {
      console.log('📡 TalentMyProfile - Received portfolioUpdated event:', event.detail);
      setRefreshKey(prev => prev + 1);
    };

    const handleSocialLinksUpdate = (event: CustomEvent) => {
      console.log('📡 TalentMyProfile - Received socialLinksUpdated event:', event.detail);
      setRefreshKey(prev => prev + 1);
    };

    // Add event listeners
    window.addEventListener('experienceUpdated', handleExperienceUpdate as EventListener);
    window.addEventListener('educationUpdated', handleEducationUpdate as EventListener);
    window.addEventListener('portfolioUpdated', handlePortfolioUpdate as EventListener);
    window.addEventListener('socialLinksUpdated', handleSocialLinksUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('experienceUpdated', handleExperienceUpdate as EventListener);
      window.removeEventListener('educationUpdated', handleEducationUpdate as EventListener);
      window.removeEventListener('portfolioUpdated', handlePortfolioUpdate as EventListener);
      window.removeEventListener('socialLinksUpdated', handleSocialLinksUpdate as EventListener);
    };
  }, []);

  // Manual refresh function

  // Get profile data
  const fullName = userProfile?.full_name || user?.user_metadata?.full_name || 'Nombre Apellido';
  const role = profile?.title || user?.user_metadata?.title || 'Tu título profesional';
  
  // Get avatar URL and filter out blob URLs (temporary URLs that cause issues)
  const rawAvatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.profile_photo_url || null;
  const avatarUrl = rawAvatarUrl && !rawAvatarUrl.startsWith('blob:') ? rawAvatarUrl : null;
  const skills = profile?.skills || user?.user_metadata?.skills || [];
  const bio = profile?.bio || user?.user_metadata?.bio || 'Agrega una biografía para describir tu experiencia y habilidades...';
  const location = profile?.location || 'Agregar ubicación';
  const phone = profile?.phone || '';
  const videoUrl = profile?.video_presentation_url || '';
  const hourlyRateMin = profile?.hourly_rate_min || 0;
  const hourlyRateMax = profile?.hourly_rate_max || 0;
  const currency = profile?.currency || 'USD';
  const availability = profile?.availability || '';

  // Debug logging
  console.log('🔍 TalentMyProfile - Profile data:', {
    userProfile: {
      full_name: userProfile?.full_name,
      avatar_url: userProfile?.avatar_url,
      phone: userProfile?.phone
    },
    profile: {
      title: profile?.title,
      location: profile?.location,
      country: profile?.country,
      city: profile?.city,
      bio: profile?.bio,
      skills: profile?.skills
    },
    userMetadata: {
      full_name: user?.user_metadata?.full_name,
      avatar_url: user?.user_metadata?.avatar_url,
      profile_photo_url: user?.user_metadata?.profile_photo_url,
      title: user?.user_metadata?.title,
      bio: user?.user_metadata?.bio,
      skills: user?.user_metadata?.skills
    },
    rawAvatarUrl: rawAvatarUrl,
    filteredAvatarUrl: avatarUrl,
    isBlobUrl: rawAvatarUrl?.startsWith('blob:')
  });

  const profileCompleteness = getProfileCompleteness();
  const publicUrl = generatePublicUrl();

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(publicUrl);
    if (success) {
      // Toast will be shown by the hook
    }
  };

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con progreso */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-['Inter'] mb-2">
              Mi Perfil
            </h1>
            <p className="text-gray-600">Gestiona tu información profesional y muestra tu experiencia</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Completitud del perfil</p>
              <div className="flex items-center gap-3">
                <Progress value={profileCompleteness} className="w-32" />
                <span className="text-lg font-semibold text-gray-900">{profileCompleteness}%</span>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-black hover:bg-gray-800 text-white font-['Inter'] px-6"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Columna principal - Información del perfil */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Card principal del perfil */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-start gap-8">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-3xl bg-gray-100">
                      {fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 font-['Inter'] mb-2">
                      {fullName}
                    </h2>
                    <p className="text-xl text-gray-600 font-['Inter'] mb-4">
                      {role}
                    </p>

                    {/* Información de contacto compacta */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {location && location !== 'Agregar ubicación' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{location}</span>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{phone}</span>
                        </div>
                      )}
                      {hourlyRateMin > 0 && hourlyRateMax > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            ${hourlyRateMin}-${hourlyRateMax} {currency}/hora
                          </span>
                        </div>
                      )}
                      {availability && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{availability}</span>
                        </div>
                      )}
                    </div>

                    {/* Habilidades */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {skills.length > 0 ? (
                          skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 font-['Inter']">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Agrega tus habilidades en el perfil</p>
                        )}
                      </div>
                    </div>

                    {/* Biografía */}
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed font-['Inter']">
                        {bio}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección de contenido profesional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Experiencia - Arriba a la izquierda */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiencia</h3>
                <ExperienceSection key={`experience-${refreshKey}`} />
              </div>

              {/* Educación - Arriba a la derecha */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Educación</h3>
                <EducationSection key={`education-${refreshKey}`} />
              </div>

              {/* Portfolio - Abajo a la izquierda */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolios</h3>
                <PortfolioSection key={`portfolio-${refreshKey}`} />
              </div>

              {/* Redes Sociales - Abajo a la derecha */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociales</h3>
                <SocialLinksSection key={`social-${refreshKey}`} />
              </div>
            </div>

            {/* Video de presentación */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Video de Presentación</h3>
                  <Button 
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
                
                {videoUrl ? (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => window.open(videoUrl, '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Ver Video
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-red-200">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                      <Video className="h-12 w-12 text-red-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Agrega un video de presentación
                    </h4>
                    <p className="text-sm text-gray-600 text-center mb-6 max-w-md px-4">
                      Un video personal te ayuda a destacar y conectar mejor con los clientes
                    </p>
                    <Button 
                      onClick={() => setIsEditModalOpen(true)}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar derecho */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Compartir perfil - Compacto */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Compartir Perfil</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="flex-1 text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopyUrl}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas del perfil - Compacto */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Estadísticas</h3>
                
                <div className="space-y-3">
                  {/* Completitud */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completitud</span>
                    <span className="text-sm font-semibold">{profileCompleteness}%</span>
                  </div>
                  <Progress value={profileCompleteness} className="h-2" />
                  
                  {/* Resumen rápido */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{portfolios.length}</div>
                      <div className="text-xs text-blue-600">Portfolios</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{experiences.length}</div>
                      <div className="text-xs text-green-600">Experiencias</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">{education.length}</div>
                      <div className="text-xs text-purple-600">Educación</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{socialLinks.length}</div>
                      <div className="text-xs text-orange-600">Redes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Servicios */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Servicios</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center py-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full w-fit mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                    Sin servicios
                  </h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Crea servicios para mostrar tus habilidades
                  </p>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Crear Servicio
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Consejos de mejora - Solo si el perfil está incompleto */}
            {profileCompleteness < 80 && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Mejora tu Perfil</h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-700">• Agrega al menos un portfolio</p>
                    <p className="text-sm text-yellow-700">• Completa tu experiencia laboral</p>
                    <p className="text-sm text-yellow-700">• Agrega tu formación académica</p>
                    <p className="text-sm text-yellow-700">• Conecta tus redes sociales</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                    Un perfil completo tiene 3x más probabilidades de ser contactado
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default TalentMyProfile;