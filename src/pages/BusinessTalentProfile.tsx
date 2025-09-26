import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, ExternalLink, Phone, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TalentData {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  position: string | null;
  city: string | null;
  country: string | null;
  linkedin: string | null;
  phone: string | null;
  video_presentation_url: string | null;
  profile_completeness: number | null;
  created_at: string;
  updated_at: string;
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
      console.log('Fetching talent profile for user ID:', id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id || '')
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('Profile data:', profileData);
      setTalentData(profileData);
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

  const handleViewLinkedIn = () => {
    if (talentData?.linkedin) {
      window.open(talentData.linkedin, '_blank');
    } else {
      toast.info('LinkedIn no disponible');
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

  const hasVideo = !!talentData.video_presentation_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a búsqueda
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-4">
        <div className={`grid grid-cols-1 gap-4 ${hasVideo ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          {/* Left Column - Profile + Portfolio */}
          <div className={`space-y-4 ${hasVideo ? 'lg:col-span-2' : ''}`}>
            {/* Profile Header Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    {talentData.avatar_url ? (
                      <img 
                        src={talentData.avatar_url} 
                        alt={talentData.full_name || "Usuario"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-lg font-bold">
                          {talentData.full_name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h1 className="text-lg font-bold text-gray-900">{talentData.full_name || "Usuario sin nombre"}</h1>
                    <Button 
                      className="bg-black hover:bg-gray-800 text-white px-3 py-1 text-sm"
                      onClick={handleSendMessage}
                    >
                      Enviar Mensaje
                    </Button>
                  </div>
                  
                  {talentData.position && (
                    <p className="text-sm text-gray-700 mb-1">{talentData.position}</p>
                  )}
                  {talentData.profile_completeness && (
                    <p className="text-xs text-gray-600 mb-2">Perfil {talentData.profile_completeness}% completo</p>
                  )}
                  
                  {(talentData.city || talentData.country) && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{[talentData.city, talentData.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {talentData.phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{talentData.phone}</span>
                      </div>
                    )}
                    {talentData.linkedin && (
                      <a 
                        href={talentData.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>

                  {/* Profile Description */}
                  <p className="text-gray-700 leading-relaxed text-xs mb-3">
                    Información profesional del talento.
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-black rounded flex items-center justify-center cursor-pointer hover:bg-gray-800">
                      <span className="text-white text-xs">▶</span>
                    </div>
                    <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-700">
                      <span className="text-white text-xs font-bold">f</span>
                    </div>
                    <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center cursor-pointer hover:bg-green-600">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LinkedIn Card - Only show if LinkedIn exists */}
            {talentData.linkedin && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold mb-2 text-gray-900">LinkedIn</h3>
                <p className="text-xs text-gray-600 mb-3">Ver perfil profesional</p>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={handleViewLinkedIn}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver LinkedIn
                </Button>
              </div>
            )}

            {/* Share Profile Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2 text-gray-900">Compartir este perfil</h3>
              <p className="text-xs text-gray-600 mb-3">Copia el link para compartir el perfil público</p>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copiado al portapapeles');
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Link
              </Button>
            </div>
          </div>

          {/* Right Column - Video, Experience, Education, Services */}
          {hasVideo && (
            <div className="space-y-4">
              {/* Video Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold mb-3 text-gray-900">Video de Presentación</h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <iframe 
                    src={talentData.video_presentation_url || ''}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Experience Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold mb-2 text-gray-900">Experiencia</h3>
                <p className="text-xs text-gray-600">Información de experiencia laboral próximamente.</p>
              </div>

              {/* Education Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold mb-2 text-gray-900">Educación</h3>
                <p className="text-xs text-gray-600">Información educativa próximamente.</p>
              </div>

              {/* Services Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold mb-2 text-gray-900">Servicios Publicados</h3>
                <p className="text-xs text-gray-600">Servicios publicados próximamente.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessTalentProfile;