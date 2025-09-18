import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Play, ExternalLink, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface TalentData {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  title: string;
  bio: string;
  location: string;
  skills: string[];
  experience_level: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  video_presentation_url: string | null;
  work_experience: any[];
  education: any[];
  services: any[];
}

const BusinessTalentProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [talentData, setTalentData] = useState<TalentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTalentProfile();
    }
  }, [id]);

  const fetchTalentProfile = async () => {
    try {
      // For now, use mock data based on the image
      // TODO: Replace with real data fetching when database structure is ready
      setTalentData({
        id: id || '',
        user_id: '',
        full_name: 'Nombre Apellido',
        avatar_url: null,
        title: 'Closer de ventas',
        bio: 'Experiencia de +3 años en ventas de productos financieros, seguros, inversiones para clientes premium.',
        location: 'Ubicación / País',
        skills: ['Ventas Consultivas', 'B2B', 'Negocios Digitales'],
        experience_level: 'Senior (+4 años)',
        linkedin_url: null,
        portfolio_url: null,
        video_presentation_url: null,
        work_experience: [],
        education: [],
        services: []
      });
    } catch (error) {
      console.error('Error fetching talent profile:', error);
      toast.error('Error al cargar el perfil del talento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/business-dashboard/talent');
  };

  const handleSendMessage = () => {
    // TODO: Implement messaging functionality
    toast.info('Funcionalidad de mensajes próximamente');
  };

  const handleViewPortfolio = () => {
    if (talentData?.portfolio_url) {
      window.open(talentData.portfolio_url, '_blank');
    } else {
      toast.info('Portfolio no disponible');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!talentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil no encontrado</h2>
          <p className="text-gray-600 mb-4">El perfil que buscas no existe o no está disponible.</p>
          <Button onClick={handleBack}>Volver a búsqueda</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a búsqueda
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Profile Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {talentData.avatar_url ? (
                        <img 
                          src={talentData.avatar_url} 
                          alt={talentData.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-xl font-bold">
                            {talentData.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{talentData.full_name}</h1>
                      <Button 
                        className="bg-black hover:bg-gray-800 text-white"
                        onClick={handleSendMessage}
                      >
                        Enviar Mensaje
                      </Button>
                    </div>
                    
                    <p className="text-lg text-gray-700 mb-2">{talentData.title}</p>
                    <p className="text-sm text-gray-600 mb-3">{talentData.experience_level}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{talentData.location}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {talentData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="text-gray-700 leading-relaxed">
                      {talentData.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-white text-xs">▶</span>
                      </div>
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs">f</span>
                      </div>
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs">W</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Experiencia</h3>
                <div className="space-y-4">
                  {/* Experience items would go here */}
                  <p className="text-gray-600">Información de experiencia laboral próximamente.</p>
                </div>
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Educación</h3>
                <div className="space-y-4">
                  {/* Education items would go here */}
                  <p className="text-gray-600">Información educativa próximamente.</p>
                </div>
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Servicios Publicados</h3>
                <div className="space-y-4">
                  {/* Services would go here */}
                  <p className="text-gray-600">Servicios publicados próximamente.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Video and Portfolio */}
          <div className="space-y-6">
            {/* Video Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Video de Presentación</h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  {talentData.video_presentation_url ? (
                    <iframe 
                      src={talentData.video_presentation_url}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center">
                      <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Video no disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
                <p className="text-sm text-gray-600 mb-4">Ve el portfolio de trabajos</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewPortfolio}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Portfolio
                </Button>
              </CardContent>
            </Card>

            {/* Share Profile Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Compartir este perfil</h3>
                <p className="text-sm text-gray-600 mb-4">Copia el link para compartir el perfil público</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copiado al portapapeles');
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTalentProfile;
