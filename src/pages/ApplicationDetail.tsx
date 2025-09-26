import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface ApplicationDetail {
  id: string;
  opportunity_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  cover_letter?: string | null;
  contact_status?: string | null;
  contacted_at?: string | null;
  resume_url?: string | null;
  internal_rating?: number | null;
  viewed_at?: string | null;
  user_id: string;
  opportunities: {
    id: string;
    title: string;
    description: string;
    requirements?: string;
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
      website?: string;
      description?: string;
    };
  };
}

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    cover_letter: '',
    resume_url: ''
  });

  useEffect(() => {
    if (id && user) {
      fetchApplicationDetail();
    }
  }, [id, user]);

  const fetchApplicationDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          opportunity_id,
          user_id,
          status,
          created_at,
          updated_at,
          cover_letter,
          contact_status,
          contacted_at,
          resume_url,
          internal_rating,
          viewed_at,
          opportunities (
            id,
            title,
            description,
            requirements,
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
              name,
              logo_url,
              website,
              description
            )
          )
        `)
        .eq('id', id || '')
        .eq('user_id', user?.id || '')
        .single();

      if (error) throw error;
      
      const applicationData = data as any;
      setApplication(applicationData);
      
      // Inicializar datos para edición
      setEditData({
        cover_letter: applicationData.cover_letter || '',
        resume_url: applicationData.resume_url || ''
      });
      
    } catch (error) {
      console.error('Error fetching application detail:', error);
      toast.error('Error al cargar los detalles de la aplicación');
      navigate('/talent-dashboard/applications');
    } finally {
      setLoading(false);
    }
  };

  // Estados disponibles
  const applicationStates = [
    { value: 'pending', label: 'En revisión', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'reviewed', label: 'Revisada', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Contactado', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
    { value: 'hired', label: 'Contratado', color: 'bg-purple-100 text-purple-800' }
  ];

  const getStatusBadgeClass = (status: string) => {
    const state = applicationStates.find(s => s.value === status);
    return state ? `${state.color} px-3 py-1 rounded-full text-sm font-medium` : "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
  };

  const getStatusText = (status: string) => {
    const state = applicationStates.find(s => s.value === status);
    return state ? state.label : status;
  };

  // Manejar edición
  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          cover_letter: editData.cover_letter,
          resume_url: editData.resume_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', id || '');

      if (error) throw error;

      setIsEditing(false);
      await fetchApplicationDetail();
      toast.success('Aplicación actualizada correctamente');
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Error al actualizar la aplicación');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restaurar datos originales
    if (application) {
      setEditData({
        cover_letter: application.cover_letter || '',
        resume_url: application.resume_url || ''
      });
    }
  };

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
    );
  }

  if (!application) {
    return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aplicación no encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                La aplicación que buscas no existe o no tienes permisos para verla.
              </p>
              <Button onClick={() => navigate('/talent-dashboard/applications')}>
                Volver a Mis Postulaciones
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/talent-dashboard/applications')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Detalles de Aplicación
            </h1>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de la oportunidad */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles de la oportunidad */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {application.opportunities?.companies?.logo_url ? (
                      <img 
                        src={application.opportunities.companies.logo_url} 
                        alt={application.opportunities?.companies?.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <Building className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {application.opportunities?.title}
                    </CardTitle>
                    <p className="text-gray-600 text-lg">
                      {application.opportunities?.companies?.name}
                    </p>
                  </div>
                  <Badge className={getStatusBadgeClass(application.status)}>
                    {getStatusText(application.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Metadatos de la oportunidad */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {application.opportunities?.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {application.opportunities.location}
                    </div>
                  )}
                  
                  {application.opportunities?.type && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      {application.opportunities.type}
                    </div>
                  )}

                  {(application.opportunities?.salary_min || application.opportunities?.salary_max) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
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

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(application.opportunities?.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>

                {/* Categoría */}
                {application.opportunities?.category && (
                  <div className="mb-4">
                    <Badge variant="secondary">
                      {application.opportunities.category}
                    </Badge>
                  </div>
                )}

                {/* Descripción */}
                {application.opportunities?.description && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.opportunities.description}
                    </p>
                  </div>
                )}

                {/* Requisitos */}
                {application.opportunities?.requirements && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requisitos</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.opportunities.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de la empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {application.opportunities?.companies?.name}
                    </h4>
                    {application.opportunities?.companies?.website && (
                      <a 
                        href={application.opportunities.companies.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {application.opportunities.companies.website}
                      </a>
                    )}
                  </div>
                  
                  {application.opportunities?.companies?.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                      <p className="text-gray-600">
                        {application.opportunities.companies.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Detalles de la aplicación */}
          <div className="space-y-6">
            {/* Estado y fechas */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de la Aplicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge className={getStatusBadgeClass(application.status)}>
                      {getStatusText(application.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Aplicado: {new Date(application.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Actualizado: {new Date(application.updated_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos de la aplicación */}
            <Card>
              <CardHeader>
                <CardTitle>Mi Aplicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Carta de presentación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carta de presentación
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editData.cover_letter}
                      onChange={(e) => setEditData(prev => ({ ...prev, cover_letter: e.target.value }))}
                      placeholder="Escribe tu carta de presentación..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                      {application.cover_letter || 'No proporcionada'}
                    </p>
                  )}
                </div>

                {/* URL del CV/Resume */}
                {(application.resume_url || isEditing) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CV / Resume
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editData.resume_url}
                        onChange={(e) => setEditData(prev => ({ ...prev, resume_url: e.target.value }))}
                        placeholder="https://mi-cv.com"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : application.resume_url ? (
                      <a 
                        href={application.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm bg-gray-50 p-3 rounded block"
                      >
                        {application.resume_url}
                      </a>
                    ) : (
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                        No proporcionado
                      </p>
                    )}
                  </div>
                )}

                {/* Estado de contacto */}
                {application.contact_status && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de contacto
                    </label>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                      {application.contact_status}
                    </p>
                  </div>
                )}

                {/* Fecha de contacto */}
                {application.contacted_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contactado el
                    </label>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                      {new Date(application.contacted_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {/* Calificación interna */}
                {application.internal_rating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calificación interna
                    </label>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                      {application.internal_rating}/5 ⭐
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default ApplicationDetail;