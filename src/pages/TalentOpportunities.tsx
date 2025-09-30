import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Building,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";

interface Application {
  id: string;
  opportunity_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  cover_letter?: string | null;
  opportunities: {
    id: string;
    title: string;
    company_id: string;
    location?: string;
    type: string;
    category?: string;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    status: string;
    created_at: string;
    companies: {
      name: string;
      logo_url?: string;
    };
  };
}

const TalentOpportunities = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          opportunity_id,
          status,
          created_at,
          updated_at,
          cover_letter,
          opportunities (
            id,
            title,
            company_id,
            location,
            type,
            category,
            salary_min,
            salary_max,
            currency,
            status,
            created_at,
            companies (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data as any) || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  // Estados disponibles para filtros
  const applicationStates = [
    { value: 'pending', label: 'En revisión', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'reviewed', label: 'Revisada', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Contactado', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
    { value: 'hired', label: 'Contratado', color: 'bg-purple-100 text-purple-800' }
  ];

  const getStatusBadgeClass = (status: string) => {
    const state = applicationStates.find(s => s.value === status);
    return state ? `${state.color} px-2 py-1 rounded text-xs font-medium` : "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium";
  };

  const getStatusText = (status: string) => {
    const state = applicationStates.find(s => s.value === status);
    return state ? state.label : status;
  };

  // Contar aplicaciones por estado
  const getApplicationCount = (status: string) => {
    if (!status) return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  // Filtrar aplicaciones
  const filteredApplications = applications.filter(app => {
    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        app.opportunities?.title?.toLowerCase().includes(searchLower) ||
        app.opportunities?.companies?.name?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (statusFilter && app.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Obtener tiempo transcurrido desde la aplicación
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const applicationDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - applicationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  // Obtener última actividad
  const getLastActivity = (application: Application) => {
    const updatedDate = new Date(application.updated_at || application.created_at);
    return updatedDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Manejar edición de aplicación
  const handleEditApplication = (applicationId: string) => {
    // Navegar a la página de detalles de la aplicación donde se puede editar
    navigate(`/talent-dashboard/applications/${applicationId}`);
  };

  // Manejar retirar aplicación
  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast.success('Aplicación retirada correctamente');
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Error al retirar la aplicación');
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📄 Mis Postulaciones
          </h1>
          <p className="text-gray-600">
            Seguimiento de todas tus aplicaciones a oportunidades laborales
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        Todos los estados ({applications.length})
                      </SelectItem>
                      {applicationStates.map(state => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label} ({getApplicationCount(state.value)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {applicationStates.map(state => (
            <Card key={state.value}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {getApplicationCount(state.value)}
                </div>
                <div className="text-sm text-gray-600">
                  {state.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredApplications.length} aplicaciones encontradas
          </p>
        </div>

        {/* Lista de aplicaciones */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {applications.length === 0 ? 'No has enviado aplicaciones aún' : 'No se encontraron aplicaciones'}
              </h3>
              <p className="text-gray-600 mb-4">
                {applications.length === 0 
                  ? 'Explora las oportunidades disponibles y envía tu primera aplicación'
                  : 'Intenta ajustar tus filtros o criterios de búsqueda'
                }
              </p>
              {applications.length === 0 ? (
                <Button onClick={() => navigate('/talent-dashboard/opportunities')}>
                  Buscar Oportunidades
                </Button>
              ) : (
                <Button onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Logo de la empresa */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {application.opportunities?.companies?.logo_url ? (
                            <img 
                              src={application.opportunities.companies.logo_url} 
                              alt={application.opportunities?.companies?.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <Building className="h-6 w-6 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          {/* Título, empresa y estado */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {application.opportunities?.title}
                              </h3>
                              <p className="text-gray-600">
                                {application.opportunities?.companies?.name}
                              </p>
                            </div>
                            <Badge className={getStatusBadgeClass(application.status)}>
                              {getStatusText(application.status)}
                            </Badge>
                          </div>

                          {/* Metadatos */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Aplicado {getTimeAgo(application.created_at)}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Última actividad: {getLastActivity(application)}
                            </div>

                            {application.opportunities?.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {application.opportunities.location}
                              </div>
                            )}

                            {application.opportunities?.type && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {application.opportunities.type}
                              </div>
                            )}

                            {(application.opportunities?.salary_min || application.opportunities?.salary_max) && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {application.opportunities.salary_min && application.opportunities.salary_max
                                  ? `$${application.opportunities.salary_min.toLocaleString()} - $${application.opportunities.salary_max.toLocaleString()}`
                                  : application.opportunities.salary_min
                                  ? `Desde $${application.opportunities.salary_min.toLocaleString()}`
                                  : `Hasta $${application.opportunities.salary_max?.toLocaleString()}`
                                }
                                {application.opportunities.currency && ` ${application.opportunities.currency}`}
                              </div>
                            )}
                          </div>

                          {/* Categoría */}
                          {application.opportunities?.category && (
                            <div className="mb-3">
                              <Badge variant="secondary">
                                {application.opportunities.category}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/talent-dashboard/applications/${application.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver postulación
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEditApplication(application.id)}
                            className="flex items-center gap-2"
                          >
                            <Edit3 className="h-4 w-4" />
                            Editar aplicación
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleWithdrawApplication(application.id)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Retirar aplicación
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
};

export default TalentOpportunities;