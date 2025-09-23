import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  MapPin, 
  Briefcase, 
  Mail,
  Eye,
  MessageCircle,
  UserCheck,
  UserX,
  ExternalLink,
  Play,
  FileText,
  Filter
} from 'lucide-react';
import { 
  getApplicationsByOpportunity, 
  getApplicationStats, 
  updateApplicationStatus, 
  updateApplicationRating,
  type MockApplication 
} from '@/components/applications/MockApplicationData';
import { mockOpportunityData } from '@/components/dashboard/MockOpportunityData';
import { toast } from 'sonner';

const OpportunityApplicants = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<MockApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtener información de la oportunidad
  const opportunity = mockOpportunityData.opportunities.find(opp => opp.id === opportunityId);
  
  useEffect(() => {
    if (!opportunityId) return;
    
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      const apps = getApplicationsByOpportunity(opportunityId);
      setApplications(apps);
      setFilteredApplications(apps);
      setIsLoading(false);
    }, 500);
  }, [opportunityId]);

  useEffect(() => {
    let filtered = applications;
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.talent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Filtrar por calificación
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(app => app.rating >= rating);
    }
    
    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, ratingFilter]);

  const handleStatusChange = async (applicationId: string, newStatus: MockApplication['status']) => {
    const updatedApp = updateApplicationStatus(applicationId, newStatus);
    if (updatedApp) {
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? updatedApp : app
      ));
      toast.success(`Estado actualizado a: ${getStatusLabel(newStatus)}`);
    }
  };

  const handleRatingChange = async (applicationId: string, rating: number) => {
    const updatedApp = updateApplicationRating(applicationId, rating);
    if (updatedApp) {
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? updatedApp : app
      ));
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

  const stats = opportunityId ? getApplicationStats(opportunityId) : null;

  const renderStars = (rating: number, applicationId?: string, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && applicationId ? () => handleRatingChange(applicationId, star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (!opportunity) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900">Oportunidad no encontrada</h3>
            <p className="text-gray-500 mt-2">La oportunidad solicitada no existe.</p>
            <Button onClick={() => navigate('/business-dashboard/opportunities')} className="mt-4">
              Volver a Oportunidades
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
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
          onClick={() => navigate('/business-dashboard/opportunities')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Postulantes: {opportunity.title}
          </h1>
          <p className="text-gray-600">
            {opportunity.category} • {stats?.total || 0} postulaciones recibidas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Nuevas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-900">{stats.reviewed}</div>
              <div className="text-sm text-purple-600">Vistas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-900">{stats.contacted}</div>
              <div className="text-sm text-orange-600">Contactados</div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-900">{stats.interviewed}</div>
              <div className="text-sm text-indigo-600">Entrevistados</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-900">{stats.hired}</div>
              <div className="text-sm text-green-600">Contratados</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
              <div className="text-sm text-red-600">Rechazados</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, título o skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Nuevas ({stats?.pending || 0})</SelectItem>
                <SelectItem value="reviewed">Vistas ({stats?.reviewed || 0})</SelectItem>
                <SelectItem value="contacted">Contactados ({stats?.contacted || 0})</SelectItem>
                <SelectItem value="interviewed">Entrevistados ({stats?.interviewed || 0})</SelectItem>
                <SelectItem value="hired">Contratados ({stats?.hired || 0})</SelectItem>
                <SelectItem value="rejected">Rechazados ({stats?.rejected || 0})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Calificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las calificaciones</SelectItem>
                <SelectItem value="5">5 estrellas</SelectItem>
                <SelectItem value="4">4+ estrellas</SelectItem>
                <SelectItem value="3">3+ estrellas</SelectItem>
                <SelectItem value="2">2+ estrellas</SelectItem>
                <SelectItem value="1">1+ estrellas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No se encontraron postulaciones</h3>
                  <p className="text-gray-500">
                    {applications.length === 0 
                      ? 'Aún no hay postulaciones para esta oportunidad.'
                      : 'Intenta ajustar los filtros de búsqueda.'
                    }
                  </p>
                </div>
                {applications.length === 0 && (
                  <div className="space-y-2">
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Compartir Oportunidad
                    </Button>
                    <p className="text-sm text-gray-400">o encuentra candidatos activamente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Talent Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={application.talent.profile_image} />
                      <AvatarFallback>
                        {application.talent.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.talent.full_name}
                          </h3>
                          <p className="text-gray-600">{application.talent.title}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </Badge>
                          {application.rating > 0 && renderStars(application.rating)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{application.talent.experience_level}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{application.talent.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{application.talent.email}</span>
                        </div>
                        
                        {application.salary_expectation && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Expectativa:</span>
                            <span>${application.salary_expectation}/mes</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1">
                        {application.talent.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {application.talent.skills.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{application.talent.skills.length - 4} más
                          </Badge>
                        )}
                      </div>

                      {/* Cover Letter Preview */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {application.cover_letter}
                        </p>
                      </div>

                      {/* Indicators */}
                      <div className="flex items-center gap-4 text-sm">
                        {application.talent.has_video && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Play className="h-4 w-4" />
                            <span>Video</span>
                          </div>
                        )}
                        {application.talent.has_portfolio && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <FileText className="h-4 w-4" />
                            <span>Portfolio</span>
                          </div>
                        )}
                        <div className="text-gray-500">
                          Aplicó hace {Math.floor((new Date().getTime() - new Date(application.created_at).getTime()) / (1000 * 60 * 60 * 24))} días
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {/* Rating */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Calificación</label>
                      {renderStars(application.rating, application.id, true)}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/business-dashboard/applications/${application.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(application.id, 'contacted')}
                        disabled={application.status === 'contacted'}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>
                    </div>

                    {/* Status Actions */}
                    <Tabs value={application.status} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="status" className="text-xs">Estado</TabsTrigger>
                        <TabsTrigger value="actions" className="text-xs">Acciones</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="status" className="mt-2">
                        <Select 
                          value={application.status} 
                          onValueChange={(value) => handleStatusChange(application.id, value as MockApplication['status'])}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Nueva</SelectItem>
                            <SelectItem value="reviewed">Vista</SelectItem>
                            <SelectItem value="contacted">Contactado</SelectItem>
                            <SelectItem value="interviewed">Entrevistado</SelectItem>
                            <SelectItem value="hired">Contratado</SelectItem>
                            <SelectItem value="rejected">Rechazado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TabsContent>
                      
                      <TabsContent value="actions" className="mt-2 space-y-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs"
                          onClick={() => handleStatusChange(application.id, 'hired')}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Contratar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs"
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Rechazar
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OpportunityApplicants;
