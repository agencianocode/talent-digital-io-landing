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
  Eye,
  Users,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Link as LinkIcon,
  CheckCircle2
} from "lucide-react";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ShareProfileModal } from "@/components/ShareProfileModal";
import VideoThumbnail from "@/components/VideoThumbnail";
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
  
  const { portfolios } = usePortfolio();
  const { experiences } = useExperience();
  const { education } = useEducation();
  const { socialLinks } = useSocialLinks();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [portfolios.length, experiences.length, education.length, socialLinks.length]);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey(prev => prev + 1);
    
    window.addEventListener('experienceUpdated', handleUpdate);
    window.addEventListener('educationUpdated', handleUpdate);
    window.addEventListener('portfolioUpdated', handleUpdate);
    window.addEventListener('socialLinksUpdated', handleUpdate);
    window.addEventListener('profileUpdated', handleUpdate);

    return () => {
      window.removeEventListener('experienceUpdated', handleUpdate);
      window.removeEventListener('educationUpdated', handleUpdate);
      window.removeEventListener('portfolioUpdated', handleUpdate);
      window.removeEventListener('socialLinksUpdated', handleUpdate);
      window.removeEventListener('profileUpdated', handleUpdate);
    };
  }, []);

  const fullName = userProfile?.full_name || user?.user_metadata?.full_name || 'Nombre Apellido';
  const role = profile?.title || user?.user_metadata?.title || 'Tu título profesional';
  const rawAvatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.profile_photo_url || null;
  const avatarUrl = rawAvatarUrl && !rawAvatarUrl.startsWith('blob:') ? rawAvatarUrl : null;
  const skills = profile?.skills || user?.user_metadata?.skills || [];
  const bio = profile?.bio || user?.user_metadata?.bio || 'Agrega una biografía para describir tu experiencia y habilidades...';
  const location = profile?.location || '';
  const phone = profile?.phone || '';
  const videoUrl = profile?.video_presentation_url || '';
  const hourlyRateMin = profile?.hourly_rate_min || 0;
  const hourlyRateMax = profile?.hourly_rate_max || 0;
  const currency = profile?.currency || 'USD';
  const availability = profile?.availability || '';

  const profileCompleteness = getProfileCompleteness();
  const publicUrl = generatePublicUrl();

  const handleCopyUrl = async () => {
    await copyToClipboard(publicUrl);
  };

  const nextSteps = [
    { label: 'Agregar experiencia', done: experiences.length > 0, icon: Briefcase },
    { label: 'Agregar educación', done: education.length > 0, icon: GraduationCap },
    { label: 'Agregar portfolio', done: portfolios.length > 0, icon: FolderOpen },
    { label: 'Agregar redes sociales', done: socialLinks.length > 0, icon: LinkIcon },
  ];

  const completedSteps = nextSteps.filter(s => s.done).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con progreso */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información profesional y muestra tu experiencia</p>
          </div>
          
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            size="lg"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Columna principal */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Hero Card con Cover + Avatar */}
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10" />
              <CardContent className="relative pt-0 pb-8">
                <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16 sm:-mt-20">
                  <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-3xl bg-muted">
                      {fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 mt-16 sm:mt-6">
                    <h2 className="text-3xl font-bold text-foreground mb-2">{fullName}</h2>
                    <p className="text-xl text-muted-foreground mb-4">{role}</p>

                    {/* Info chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {location && (
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {location}
                        </Badge>
                      )}
                      {phone && (
                        <Badge variant="secondary" className="gap-1">
                          <Phone className="h-3 w-3" />
                          {phone}
                        </Badge>
                      )}
                      {hourlyRateMin > 0 && hourlyRateMax > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${hourlyRateMin}-${hourlyRateMax} {currency}/hora
                        </Badge>
                      )}
                      {availability && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {availability}
                        </Badge>
                      )}
                    </div>

                    {/* Skills con colores */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill: string, index: number) => (
                          <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-foreground/80 leading-relaxed">{bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid de contenido 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Experiencia */}
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Experiencia</h3>
                    </div>
                    <Badge variant="secondary">{experiences.length}</Badge>
                  </div>
                  <ExperienceSection key={`experience-${refreshKey}`} />
                </CardContent>
              </Card>

              {/* Educación */}
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Educación</h3>
                    </div>
                    <Badge variant="secondary">{education.length}</Badge>
                  </div>
                  <EducationSection key={`education-${refreshKey}`} />
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Portfolio</h3>
                    </div>
                    <Badge variant="secondary">{portfolios.length}</Badge>
                  </div>
                  <PortfolioSection key={`portfolio-${refreshKey}`} />
                </CardContent>
              </Card>

              {/* Redes Sociales */}
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Redes Sociales</h3>
                    </div>
                    <Badge variant="secondary">{socialLinks.length}</Badge>
                  </div>
                  <SocialLinksSection key={`social-${refreshKey}`} />
                </CardContent>
              </Card>
            </div>

            {/* Video de Presentación - Compacto */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Video de Presentación</h3>
                    <Badge variant="outline" className="text-xs">Recomendado</Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
                
                {videoUrl ? (
                  <div className="w-full h-48 bg-muted rounded-lg relative group overflow-hidden">
                    {/* Video thumbnail */}
                    <VideoThumbnail url={videoUrl} />
                    
                    {/* Hover overlay with play button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button onClick={() => window.open(videoUrl, '_blank')} size="lg" className="gap-2 bg-white text-black hover:bg-gray-100">
                        <Video className="h-5 w-5" />
                        Reproducir Video
                      </Button>
                    </div>
                    
                    {/* Platform badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                        {videoUrl.includes('loom.com') ? 'Loom' : 
                         videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? 'YouTube' :
                         videoUrl.includes('vimeo.com') ? 'Vimeo' : 'Video'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary/30 hover:bg-muted/50 transition-all">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-foreground mb-1">Destaca con un video</h4>
                      <p className="text-sm text-muted-foreground mb-3 max-w-xs">
                        Un video personal ayuda a conectar mejor con los clientes
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Video
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4 space-y-4">
            
            {/* Completitud - Circular */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Completitud del Perfil</h3>
                
                {/* Circular progress */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - profileCompleteness / 100)}`}
                        className="text-primary transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">{profileCompleteness}%</span>
                    </div>
                  </div>
                </div>

                {/* Mini métricas */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{portfolios.length}</div>
                    <div className="text-xs text-muted-foreground">Portfolios</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{experiences.length}</div>
                    <div className="text-xs text-muted-foreground">Experiencias</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{education.length}</div>
                    <div className="text-xs text-muted-foreground">Educación</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{socialLinks.length}</div>
                    <div className="text-xs text-muted-foreground">Redes</div>
                  </div>
                </div>

                {/* Próximos pasos */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Próximos Pasos</h4>
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 ${step.done ? 'text-primary' : 'text-muted-foreground/30'}`} />
                      <span className={step.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Progress value={(completedSteps / nextSteps.length) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedSteps} de {nextSteps.length} completados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compartir */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Compartir Perfil</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={publicUrl} readOnly className="text-xs" />
                    <Button variant="outline" size="sm" onClick={handleCopyUrl} className="shrink-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button onClick={() => setIsShareModalOpen(true)} className="w-full gap-2">
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Impacto */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Impacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Vistas del perfil</span>
                    </div>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Contactos</span>
                    </div>
                    <span className="font-semibold">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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
