import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone,
  MessageCircle,
  UserCheck,
  UserX,
  ExternalLink,
  Play,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Linkedin
} from 'lucide-react';
import { 
  getApplicationById, 
  updateApplicationStatus, 
  updateApplicationRating,
  type MockApplication 
} from '@/components/applications/MockApplicationData';
import { mockOpportunityData } from '@/components/dashboard/MockOpportunityData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ApplicationDetail = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState<MockApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!applicationId) return;
    
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      const app = getApplicationById(applicationId);
      setApplication(app || null);
      setIsLoading(false);
    }, 300);
  }, [applicationId]);

  const handleStatusChange = async (newStatus: MockApplication['status']) => {
    if (!application) return;
    
    const updatedApp = updateApplicationStatus(application.id, newStatus);
    if (updatedApp) {
      setApplication(updatedApp);
      toast.success(`Estado actualizado a: ${getStatusLabel(newStatus)}`);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!application) return;
    
    const updatedApp = updateApplicationRating(application.id, rating);
    if (updatedApp) {
      setApplication(updatedApp);
      toast.success(`Calificación actualizada: ${rating} estrellas`);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Nueva',
      reviewed: 'Vista',
      contacted: 'Contactado',
      interviewed: 'Entrevistado',
      hired: 'Contratado',
      rejected: 'Rechazado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      reviewed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      contacted: 'bg-purple-100 text-purple-800 border-purple-200',
      interviewed: 'bg-orange-100 text-orange-800 border-orange-200',
      hired: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => handleRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  // Obtener información de la oportunidad
  const opportunity = application ? mockOpportunityData.opportunities.find(opp => opp.id === application.opportunity_id) : null;

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

  if (!application) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900">Postulación no encontrada</h3>
            <p className="text-gray-500 mt-2">La postulación solicitada no existe.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Postulación de {application.talent.full_name}
          </h1>
          <p className="text-gray-600">
            {opportunity?.title} • {opportunity?.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(application.status)}`}>
            {getStatusLabel(application.status)}
          </Badge>
          {application.rating > 0 && renderStars(application.rating)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Talent Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil del Candidato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={application.talent.profile_image} />
                  <AvatarFallback className="text-lg">
                    {application.talent.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {application.talent.full_name}
                    </h3>
                    <p className="text-lg text-gray-600">{application.talent.title}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{application.talent.experience_level}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{application.talent.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{application.talent.email}</span>
                    </div>
                    
                    {application.talent.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{application.talent.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Biografía</h4>
                    <p className="text-gray-600">{application.talent.bio}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {application.talent.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {application.talent.has_video && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Play className="h-4 w-4" />
                        <span className="text-sm">Video de presentación</span>
                      </div>
                    )}
                    {application.talent.has_portfolio && (
                      <div className="flex items-center gap-2 text-purple-600">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Portfolio disponible</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {application.talent.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.talent.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {application.talent.portfolio_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.talent.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Postulación</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cover-letter" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cover-letter">Carta de Presentación</TabsTrigger>
                  <TabsTrigger value="answers">Respuestas</TabsTrigger>
                  <TabsTrigger value="info">Información Adicional</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cover-letter" className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Carta de Presentación</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {application.cover_letter}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="answers" className="space-y-4">
                  {application.application_answers.map((answer, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 space-y-2">
                      <h4 className="font-medium text-gray-900">{answer.question}</h4>
                      <p className="text-gray-700">{answer.answer}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Expectativa Salarial</div>
                          <div className="text-gray-600">
                            {application.salary_expectation 
                              ? `$${application.salary_expectation}/mes`
                              : 'No especificado'
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Disponibilidad</div>
                          <div className="text-gray-600">{application.availability}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Fecha de Postulación</div>
                          <div className="text-gray-600">
                            {format(new Date(application.created_at), 'dd MMMM yyyy, HH:mm', { locale: es })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Última Actualización</div>
                          <div className="text-gray-600">
                            {format(new Date(application.updated_at), 'dd MMMM yyyy, HH:mm', { locale: es })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Calificación Interna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mb-2">
                  {renderStars(application.rating, true)}
                </div>
                <p className="text-sm text-gray-600">
                  {application.rating === 0 
                    ? 'Haz clic en las estrellas para calificar'
                    : `${application.rating} de 5 estrellas`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de la Postulación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(application.status)} text-sm`}>
                  {getStatusLabel(application.status)}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Cambiar Estado</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    size="sm" 
                    variant={application.status === 'reviewed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('reviewed')}
                    disabled={application.status === 'reviewed'}
                  >
                    Marcar como Vista
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant={application.status === 'contacted' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('contacted')}
                    disabled={application.status === 'contacted'}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant={application.status === 'interviewed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('interviewed')}
                    disabled={application.status === 'interviewed'}
                  >
                    Entrevistado
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange('hired')}
                  disabled={application.status === 'hired'}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Contratar
                </Button>
                
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={application.status === 'rejected'}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`mailto:${application.talent.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </a>
              </Button>
              
              {application.talent.phone && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={`tel:${application.talent.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </a>
                </Button>
              )}
              
              {application.talent.linkedin_url && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={application.talent.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    Ver LinkedIn
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
