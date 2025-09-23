import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Briefcase, 
  Mail,
  MessageCircle,
  ExternalLink,
  Play,
  FileText,
  Clock,
  CheckCircle,
  Award,
  Globe,
  Github,
  Linkedin,
  Users,
  TrendingUp,
  Languages,
  GraduationCap,
  Shield
} from 'lucide-react';
import { 
  getTalentById,
  type MockTalent 
} from '@/components/talent/MockTalentData';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const PublicTalentProfile = () => {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  
  const [talent, setTalent] = useState<MockTalent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (!talentId) return;
    
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      const talentData = getTalentById(talentId);
      setTalent(talentData || null);
      setIsLoading(false);
    }, 300);
  }, [talentId]);

  const handleContactTalent = () => {
    if (!talent) return;
    toast.success(`Solicitud de contacto enviada a ${talent.full_name}`);
  };

  const handleSendMessage = () => {
    if (!talent) return;
    toast.success(`Mensaje enviado a ${talent.full_name}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Inmediata': return 'bg-green-100 text-green-800 border-green-200';
      case '2 semanas': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '1 mes': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '2-3 meses': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (!talent) {
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
      {/* Cover Image */}
      {talent.cover_image && (
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <img 
            src={talent.cover_image} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Back Button */}
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className={talent.cover_image ? '-mt-20 relative z-10' : 'mt-8'}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32">
                      <AvatarImage src={talent.profile_image} />
                      <AvatarFallback className="text-2xl">
                        {talent.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {talent.is_verified && (
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">
                            {talent.full_name}
                          </h1>
                          <p className="text-xl text-gray-600">{talent.title}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {talent.is_featured && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Award className="h-3 w-3 mr-1" />
                              Destacado
                            </Badge>
                          )}
                          {talent.is_premium && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{talent.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{talent.experience_level} • {talent.years_experience} años</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <span>{talent.remote_preference}</span>
                        </div>
                      </div>
                      
                      {/* Rating & Stats */}
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          {renderStars(talent.rating)}
                          <span className="font-medium">{talent.rating}</span>
                          <span className="text-gray-500">({talent.reviews_count} reviews)</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {talent.response_rate}% tasa de respuesta
                        </div>
                        <Badge className={`${getAvailabilityColor(talent.availability)}`}>
                          {talent.availability}
                        </Badge>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-700 leading-relaxed">
                      {talent.bio}
                    </p>

                    {/* Skills */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Especialidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {talent.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
                        <h4 className="font-medium text-gray-900 mb-2">Categorías</h4>
                        <div className="space-y-1">
                          <Badge variant="outline">{talent.category}</Badge>
                          {talent.secondary_category && (
                            <Badge variant="outline" className="ml-2">{talent.secondary_category}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Expectativa Salarial</h4>
                        {talent.salary_expectation_min && talent.salary_expectation_max ? (
                          <p className="text-gray-700">
                            {talent.salary_currency} ${talent.salary_expectation_min.toLocaleString()} - ${talent.salary_expectation_max.toLocaleString()}/mes
                          </p>
                        ) : (
                          <p className="text-gray-500">A convenir</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Idiomas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {talent.languages.map((language, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{language}</span>
                            <Badge variant="secondary">Fluido</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Certificaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {talent.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                {/* Education */}
                {talent.education && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Educación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {talent.education.map((edu, index) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-4">
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            <p className="text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Professional Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trayectoria Profesional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-200 pl-4">
                        <h4 className="font-medium text-gray-900">
                          {talent.title}
                        </h4>
                        <p className="text-gray-600">Freelancer / Consultor</p>
                        <p className="text-sm text-gray-500">
                          {talent.years_experience} años de experiencia
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Especialización en {talent.category.toLowerCase()} con enfoque en {talent.secondary_category?.toLowerCase() || 'desarrollo profesional'}.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                    {talent.has_portfolio ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">
                            {talent.portfolio_pieces} proyectos en portfolio
                          </span>
                          {talent.portfolio_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={talent.portfolio_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Portfolio Completo
                              </a>
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[...Array(Math.min(4, talent.portfolio_pieces))].map((_, index) => (
                            <div key={index} className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                              <span className="text-gray-500">Proyecto {index + 1}</span>
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
                {talent.has_video && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Video de Presentación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Video de presentación disponible</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                {talent.services && talent.services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {talent.services.map((service, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-700">{service.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                Desde {talent.salary_currency} ${service.price_from.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Entrega: {service.delivery_time}
                              </p>
                            </div>
                            
                            <Button size="sm">
                              Contratar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">
                        Este talento no ha publicado servicios específicos aún.
                      </p>
                    </CardContent>
                  </Card>
                )}
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
                  <span className="text-gray-600">Último acceso:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(talent.last_active), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Miembro desde:</span>
                  <span className="font-medium">
                    {format(new Date(talent.joined_date), 'MMM yyyy', { locale: es })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de respuesta:</span>
                  <span className="font-medium">{talent.response_rate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* External Links */}
            <Card>
              <CardHeader>
                <CardTitle>Enlaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {talent.linkedin_url && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={talent.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                
                {talent.github_url && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={talent.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                
                {talent.portfolio_url && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={talent.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
                
                {talent.behance_url && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={talent.behance_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Behance
                    </a>
                  </Button>
                )}
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
                  Otros profesionales en {talent.category}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Más Talentos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTalentProfile;
