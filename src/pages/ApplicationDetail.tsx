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
  X,
  CheckCircle,
  Eye,
  MessageCircle,
  User,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  File,
  Image,
  Video,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Percent
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

  // Función para obtener el icono del tipo de archivo
  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return { icon: FileText, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'doc':
      case 'docx':
        return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { icon: Image, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'mp4':
      case 'avi':
      case 'mov':
        return { icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      default:
        return { icon: File, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Función para obtener el nombre del archivo desde la URL
  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      return fileName || 'Documento';
    } catch {
      return 'Documento';
    }
  };

  // Función para calcular la puntuación de match
  const calculateMatchScore = () => {
    if (!application?.opportunities) return { score: 0, details: [] };

    const opportunity = application.opportunities;
    const requirements = opportunity.requirements || '';
    const matchDetails = [];

    // Extraer habilidades requeridas
    const skillsMatch = requirements.match(/Habilidades:\s*([^\n]+)/i);
    const requiredSkills = skillsMatch?.[1] ? skillsMatch[1].split(',').map(s => s.trim().toLowerCase()) : [];
    
    // Extraer herramientas requeridas
    const toolsMatch = requirements.match(/Herramientas:\s*([^\n]+)/i);
    const requiredTools = toolsMatch?.[1] ? toolsMatch[1].split(',').map(t => t.trim().toLowerCase()) : [];

    // Extraer idiomas requeridos
    const languagesMatch = requirements.match(/Idiomas preferidos:\s*([^\n]+)/i);
    const requiredLanguages = languagesMatch?.[1] ? languagesMatch[1].split(',').map(l => l.trim().toLowerCase()) : [];

    // Extraer zona horaria
    const timezoneMatch = requirements.match(/Zona horaria preferida:\s*([^\n]+)/i);
    const requiredTimezone = timezoneMatch?.[1] ? timezoneMatch[1].trim() : '';

    // Simular perfil del usuario (en una implementación real, esto vendría de la base de datos)
    const userProfile = {
      skills: ['cierre de ventas', 'negociación', 'crm', 'prospección', 'cold calling'], // Ejemplo
      tools: ['hubspot', 'salesforce', 'zoom', 'linkedin sales navigator'], // Ejemplo
      languages: ['español', 'inglés'], // Ejemplo
      timezone: 'UTC-5 (EST) - Estados Unidos (Costa Este), Colombia' // Ejemplo
    };

    let totalScore = 0;
    let maxScore = 0;

    // Calcular match de habilidades (40% del score)
    if (requiredSkills.length > 0) {
      maxScore += 40;
      const matchedSkills = requiredSkills.filter(skill => 
        userProfile.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill) || skill.includes(userSkill.toLowerCase())
        )
      );
      const skillsScore = (matchedSkills.length / requiredSkills.length) * 40;
      totalScore += skillsScore;
      
      matchDetails.push({
        category: 'Habilidades',
        score: Math.round(skillsScore),
        maxScore: 40,
        matched: matchedSkills,
        required: requiredSkills,
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      });
    }

    // Calcular match de herramientas (30% del score)
    if (requiredTools.length > 0) {
      maxScore += 30;
      const matchedTools = requiredTools.filter(tool => 
        userProfile.tools.some(userTool => 
          userTool.toLowerCase().includes(tool) || tool.includes(userTool.toLowerCase())
        )
      );
      const toolsScore = (matchedTools.length / requiredTools.length) * 30;
      totalScore += toolsScore;
      
      matchDetails.push({
        category: 'Herramientas',
        score: Math.round(toolsScore),
        maxScore: 30,
        matched: matchedTools,
        required: requiredTools,
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      });
    }

    // Calcular match de idiomas (20% del score)
    if (requiredLanguages.length > 0) {
      maxScore += 20;
      const matchedLanguages = requiredLanguages.filter(lang => 
        userProfile.languages.some(userLang => 
          userLang.toLowerCase().includes(lang) || lang.includes(userLang.toLowerCase())
        )
      );
      const languagesScore = (matchedLanguages.length / requiredLanguages.length) * 20;
      totalScore += languagesScore;
      
      matchDetails.push({
        category: 'Idiomas',
        score: Math.round(languagesScore),
        maxScore: 20,
        matched: matchedLanguages,
        required: requiredLanguages,
        icon: CheckCircle2,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      });
    }

    // Calcular match de zona horaria (10% del score)
    if (requiredTimezone) {
      maxScore += 10;
      const timezoneMatch = userProfile.timezone.toLowerCase().includes(requiredTimezone.toLowerCase()) ||
                           requiredTimezone.toLowerCase().includes(userProfile.timezone.toLowerCase());
      const timezoneScore = timezoneMatch ? 10 : 0;
      totalScore += timezoneScore;
      
      matchDetails.push({
        category: 'Zona Horaria',
        score: timezoneScore,
        maxScore: 10,
        matched: timezoneMatch ? [requiredTimezone] : [],
        required: [requiredTimezone],
        icon: XCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      });
    }

    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      score: finalScore,
      details: matchDetails,
      totalPossible: maxScore,
      achieved: Math.round(totalScore)
    };
  };

  // Generar timeline de la aplicación
  const generateApplicationTimeline = () => {
    if (!application) return [];

    const timeline = [];

    // 1. Aplicación enviada
    timeline.push({
      id: 'applied',
      title: 'Aplicación enviada',
      description: 'Tu aplicación fue enviada exitosamente',
      date: application.created_at,
      icon: CheckCircle,
      status: 'completed',
      color: 'text-green-600'
    });

    // 2. Aplicación vista (si tiene viewed_at)
    if (application.viewed_at) {
      timeline.push({
        id: 'viewed',
        title: 'Aplicación vista',
        description: 'La empresa ha revisado tu aplicación',
        date: application.viewed_at,
        icon: Eye,
        status: 'completed',
        color: 'text-blue-600'
      });
    }

    // 3. Contacto inicial (si tiene contacted_at)
    if (application.contacted_at) {
      timeline.push({
        id: 'contacted',
        title: 'Contacto inicial',
        description: 'La empresa se ha puesto en contacto contigo',
        date: application.contacted_at,
        icon: MessageCircle,
        status: 'completed',
        color: 'text-purple-600'
      });
    }

    // 4. Estado actual
    const currentStatus = application.status;
    let currentStep = null;

    switch (currentStatus) {
      case 'pending':
        currentStep = {
          id: 'review',
          title: 'En revisión',
          description: 'Tu aplicación está siendo evaluada por el equipo de recursos humanos',
          date: application.updated_at,
          icon: Clock,
          status: 'current',
          color: 'text-yellow-600'
        };
        break;
      case 'reviewed':
        currentStep = {
          id: 'reviewed',
          title: 'Aplicación revisada',
          description: 'Tu perfil ha sido evaluado, esperando próximos pasos',
          date: application.updated_at,
          icon: CheckCircle,
          status: 'current',
          color: 'text-blue-600'
        };
        break;
      case 'interview_scheduled':
        currentStep = {
          id: 'interview',
          title: 'Entrevista programada',
          description: 'Se ha programado una entrevista contigo',
          date: application.updated_at,
          icon: User,
          status: 'current',
          color: 'text-purple-600'
        };
        break;
      case 'accepted':
        currentStep = {
          id: 'accepted',
          title: '¡Aplicación aceptada!',
          description: '¡Felicidades! Has sido seleccionado para esta posición',
          date: application.updated_at,
          icon: CheckCircle,
          status: 'completed',
          color: 'text-green-600'
        };
        break;
      case 'rejected':
        currentStep = {
          id: 'rejected',
          title: 'Aplicación no seleccionada',
          description: 'Gracias por tu interés, pero no fuiste seleccionado para esta posición',
          date: application.updated_at,
          icon: AlertCircle,
          status: 'completed',
          color: 'text-red-600'
        };
        break;
    }

    if (currentStep) {
      timeline.push(currentStep);
    }

    // 5. Próximos pasos (si no está completado)
    if (currentStatus !== 'accepted' && currentStatus !== 'rejected') {
      let nextStep = null;

      switch (currentStatus) {
        case 'pending':
          nextStep = {
            id: 'next_review',
            title: 'Próximo: Revisión',
            description: 'El equipo evaluará tu perfil y experiencia',
            date: null,
            icon: Eye,
            status: 'upcoming',
            color: 'text-gray-400'
          };
          break;
        case 'reviewed':
          nextStep = {
            id: 'next_contact',
            title: 'Próximo: Contacto',
            description: 'Si eres seleccionado, la empresa se pondrá en contacto contigo',
            date: null,
            icon: MessageCircle,
            status: 'upcoming',
            color: 'text-gray-400'
          };
          break;
        case 'interview_scheduled':
          nextStep = {
            id: 'next_decision',
            title: 'Próximo: Decisión',
            description: 'Después de la entrevista, recibirás una respuesta final',
            date: null,
            icon: CheckCircle,
            status: 'upcoming',
            color: 'text-gray-400'
          };
          break;
      }

      if (nextStep) {
        timeline.push(nextStep);
      }
    }

    return timeline.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
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

        {/* Layout Principal - Grid Responsivo Mejorado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Información de la Aplicación */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            {/* Estado y Match Score Card */}
            <Card className="border-t-4 border-t-primary shadow-lg animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Estado de tu Aplicación</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Estado actual</span>
                  <Badge className={getStatusBadgeClass(application.status)} variant="secondary">
                    {getStatusText(application.status)}
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Aplicado el {new Date(application.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {application.viewed_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-4 w-4 flex-shrink-0" />
                      <span>Vista el {new Date(application.viewed_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  {application.contacted_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Contactado el {new Date(application.contacted_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>

                {(() => {
                  const matchData = calculateMatchScore();
                  return (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Compatibilidad</span>
                        <span className="text-2xl font-bold text-primary">{matchData.score}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500 animate-scale-in"
                          style={{ width: `${matchData.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Tu Carta de Presentación */}
            {(application.cover_letter || isEditing) && (
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <FileText className="h-4 w-4 text-accent-foreground" />
                    </div>
                    Tu Carta de Presentación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editData.cover_letter}
                      onChange={(e) => setEditData({ ...editData, cover_letter: e.target.value })}
                      placeholder="Escribe tu carta de presentación..."
                      className="min-h-[200px] resize-none"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {application.cover_letter}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CV Adjunto */}
            {(application.resume_url || isEditing) && (
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <Download className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    CV Adjunto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editData.resume_url}
                        onChange={(e) => setEditData({ ...editData, resume_url: e.target.value })}
                        placeholder="URL del CV..."
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ingresa la URL de tu CV o portafolio
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(() => {
                        const fileInfo = getFileIcon(application.resume_url || '');
                        const IconComponent = fileInfo.icon;
                        return (
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                            <div className={`p-2 ${fileInfo.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
                              <IconComponent className={`h-5 w-5 ${fileInfo.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{getFileName(application.resume_url || '')}</p>
                              <p className="text-xs text-muted-foreground">Haz clic para abrir</p>
                            </div>
                            <a
                              href={application.resume_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0"
                            >
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Detalles de Compatibilidad */}
            {(() => {
              const matchData = calculateMatchScore();
              return matchData.details.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Percent className="h-4 w-4 text-primary" />
                      </div>
                      Análisis de Compatibilidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {matchData.details.map((detail, index) => {
                      const IconComponent = detail.icon;
                      const percentage = (detail.score / detail.maxScore) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 ${detail.bgColor} rounded-lg`}>
                                <IconComponent className={`h-3.5 w-3.5 ${detail.color}`} />
                              </div>
                              <span className="text-sm font-medium">{detail.category}</span>
                            </div>
                            <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${detail.bgColor} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          {detail.matched.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Coincide: {detail.matched.join(', ')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {/* Columna Principal - Información de la Oportunidad */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">

            {/* Grid de Metadatos - Información Clave */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {application.opportunities?.location && (
                <Card className="hover:shadow-lg transition-all hover:scale-105 duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Ubicación</p>
                        <p className="text-sm font-semibold">{application.opportunities.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {application.opportunities?.type && (
                <Card className="hover:shadow-lg transition-all hover:scale-105 duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Tipo</p>
                        <p className="text-sm font-semibold">{application.opportunities.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(application.opportunities?.salary_min || application.opportunities?.salary_max) && (
                <Card className="hover:shadow-lg transition-all hover:scale-105 duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
                        <DollarSign className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Salario</p>
                        <p className="text-sm font-semibold">
                          {application.opportunities.salary_min && application.opportunities.salary_max
                            ? `$${application.opportunities.salary_min.toLocaleString()} - $${application.opportunities.salary_max.toLocaleString()}`
                            : application.opportunities.salary_min
                            ? `$${application.opportunities.salary_min.toLocaleString()}`
                            : `$${application.opportunities.salary_max?.toLocaleString()}`
                          }
                          {application.opportunities.currency && ` ${application.opportunities.currency}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="hover:shadow-lg transition-all hover:scale-105 duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Publicado</p>
                      <p className="text-sm font-semibold">
                        {new Date(application.opportunities?.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Descripción y Requisitos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Descripción */}
              {application.opportunities?.description && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      Descripción
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {application.opportunities.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Requisitos */}
              {application.opportunities?.requirements && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Target className="h-4 w-4 text-orange-600" />
                      </div>
                      Requisitos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {application.opportunities.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Timeline de la aplicación */}
            <Card className="border-l-4 border-l-primary shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  Progreso de la Aplicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generateApplicationTimeline().map((step, index) => {
                    const IconComponent = step.icon;
                    const isLast = index === generateApplicationTimeline().length - 1;
                    
                    return (
                      <div key={step.id} className="flex items-start gap-3 group">
                        {/* Icono y línea conectora */}
                        <div className="flex flex-col items-center">
                          <div className={`p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform ${
                            step.status === 'completed' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                            step.status === 'current' ? 'bg-gradient-to-br from-yellow-100 to-amber-100' :
                            'bg-muted'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              step.status === 'completed' ? 'text-green-600' :
                              step.status === 'current' ? 'text-yellow-600' :
                              'text-muted-foreground'
                            }`} />
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-10 mt-2 ${
                              step.status === 'completed' ? 'bg-green-200' : 'bg-border'
                            }`} />
                          )}
                        </div>
                        
                        {/* Contenido del paso */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${
                              step.status === 'completed' ? 'text-green-700' :
                              step.status === 'current' ? 'text-yellow-700' :
                              'text-muted-foreground'
                            }`}>
                              {step.title}
                            </h4>
                            {step.status === 'current' && (
                              <Badge variant="default" className="text-xs animate-pulse">
                                Actual
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {step.description}
                          </p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground/70">
                              {new Date(step.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Información de la Empresa y Oportunidad */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Building className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  Información de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Header con Logo y Título de Oportunidad */}
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-primary/20 flex-shrink-0">
                      {application.opportunities?.companies?.logo_url ? (
                        <img 
                          src={application.opportunities.companies.logo_url} 
                          alt={application.opportunities?.companies?.name}
                          className="w-12 h-12 object-contain rounded-lg"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1">
                        {application.opportunities?.title}
                      </h3>
                      <p className="text-lg font-medium text-muted-foreground">
                        {application.opportunities?.companies?.name}
                      </p>
                    </div>
                  </div>

                  {/* Website */}
                  {application.opportunities?.companies?.website && (
                    <div>
                      <a 
                        href={application.opportunities.companies.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-glow inline-flex items-center gap-1 hover:underline"
                      >
                        {application.opportunities.companies.website}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                  
                  {/* Descripción de la Empresa */}
                  {application.opportunities?.companies?.description && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Descripción</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {application.opportunities.companies.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default ApplicationDetail;