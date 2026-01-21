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
  Percent,
  Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface ApplicationDetailData {
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
    deadline_date?: string | null;
    skills?: string[];
    companies: {
      name: string;
      logo_url?: string;
      website?: string;
      description?: string;
    };
  };
}

interface TalentProfileData {
  primary_category_id: string | null;
  secondary_category_id: string | null;
  skills: string[] | null;
}

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [application, setApplication] = useState<ApplicationDetailData | null>(null);
  const [talentProfile, setTalentProfile] = useState<TalentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    cover_letter: '',
    resume_url: ''
  });

  useEffect(() => {
    if (id && user) {
      fetchApplicationDetail();
      fetchTalentProfile();
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
            deadline_date,
            skills,
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

  const fetchTalentProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('primary_category_id, secondary_category_id, skills')
        .eq('user_id', user?.id || '')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTalentProfile(data);
    } catch (error) {
      console.error('Error fetching talent profile:', error);
    }
  };

  // Estados disponibles para talent view
  const applicationStates = [
    { value: 'pending', label: 'Enviada', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'reviewed', label: 'En Revisión', color: 'bg-blue-100 text-blue-800' },
    { value: 'accepted', label: 'Aceptada', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rechazada', color: 'bg-red-100 text-red-800' },
    { value: 'hired', label: 'Contratado', color: 'bg-purple-100 text-purple-800' },
    { value: 'closed', label: 'Cerrada', color: 'bg-gray-100 text-gray-800' }
  ];

  // Determinar el estado a mostrar considerando oportunidades cerradas
  const getDisplayStatus = (): string => {
    if (!application) return 'pending';
    const oppStatus = application.opportunities?.status;
    const appStatus = application.status;
    
    if (oppStatus === 'closed' && appStatus !== 'rejected' && appStatus !== 'hired') {
      return 'closed';
    }
    return appStatus;
  };

  const getStatusBadgeClass = (status: string) => {
    const state = applicationStates.find(s => s.value === status);
    return state ? `${state.color} px-3 py-1 rounded-full text-sm font-medium` : "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
  };

  const getStatusText = (status: string) => {
    const state = applicationStates.find(s => s.value === status);
    return state ? state.label : status;
  };

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
    if (application) {
      setEditData({
        cover_letter: application.cover_letter || '',
        resume_url: application.resume_url || ''
      });
    }
  };

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

  // Calculate compatibility score based on new formula
  const calculateCompatibilityScore = () => {
    if (!application?.opportunities || !talentProfile) {
      return { total: 0, category: 0, skills: 0, tools: 0, details: [] };
    }

    const opportunity = application.opportunities;
    const details = [];

    // 1. Category Match (33.33%)
    let categoryScore = 0;
    const oppCategory = opportunity.category?.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
    const primaryCat = talentProfile.primary_category_id?.toLowerCase() || '';
    const secondaryCat = talentProfile.secondary_category_id?.toLowerCase() || '';
    
    if (oppCategory && (primaryCat.includes(oppCategory) || oppCategory.includes(primaryCat) ||
        secondaryCat.includes(oppCategory) || oppCategory.includes(secondaryCat))) {
      categoryScore = 100;
    }
    
    details.push({
      category: 'Categoría',
      score: categoryScore,
      maxScore: 100,
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: categoryScore === 100 ? 'Tu categoría coincide con la oportunidad' : 'La categoría no coincide'
    });

    // 2. Skills Match (33.33%)
    let skillsScore = 0;
    const oppSkills = opportunity.skills || [];
    const talentSkills = talentProfile.skills || [];
    
    if (oppSkills.length > 0 && talentSkills.length > 0) {
      const oppSkillsLower = oppSkills.map(s => s.toLowerCase().trim());
      const talentSkillsLower = talentSkills.map(s => s.toLowerCase().trim());
      
      const matchedSkills = oppSkillsLower.filter(skill => 
        talentSkillsLower.some(ts => ts.includes(skill) || skill.includes(ts))
      );
      
      skillsScore = Math.round((matchedSkills.length / oppSkills.length) * 100);
    } else if (oppSkills.length === 0) {
      skillsScore = 100; // No skills required = perfect match
    }
    
    details.push({
      category: 'Habilidades',
      score: skillsScore,
      maxScore: 100,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: oppSkills.length === 0 ? 'Sin requisitos de habilidades' : `${Math.round(skillsScore)}% de las habilidades requeridas`
    });

    // 3. Tools Match (33.33%) - Parse from requirements
    let toolsScore = 0;
    const requirements = opportunity.requirements || '';
    const toolsMatch = requirements.match(/Herramientas:\s*([^\n]+)/i);
    const requiredTools = toolsMatch?.[1] ? toolsMatch[1].split(',').map(t => t.trim().toLowerCase()) : [];
    
    if (requiredTools.length > 0 && talentSkills.length > 0) {
      const talentSkillsLower = talentSkills.map(s => s.toLowerCase().trim());
      
      const matchedTools = requiredTools.filter(tool => 
        talentSkillsLower.some(ts => ts.includes(tool) || tool.includes(ts))
      );
      
      toolsScore = Math.round((matchedTools.length / requiredTools.length) * 100);
    } else if (requiredTools.length === 0) {
      toolsScore = 100; // No tools required = perfect match
    }
    
    details.push({
      category: 'Herramientas',
      score: toolsScore,
      maxScore: 100,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: requiredTools.length === 0 ? 'Sin requisitos de herramientas' : `${Math.round(toolsScore)}% de las herramientas requeridas`
    });

    // Total score (average of three)
    const totalScore = Math.round((categoryScore + skillsScore + toolsScore) / 3);

    return {
      total: totalScore,
      category: categoryScore,
      skills: skillsScore,
      tools: toolsScore,
      details
    };
  };

  // Calculate application progress based on dates
  const calculateApplicationProgress = () => {
    if (!application?.opportunities) return { progress: 0, daysRemaining: null };
    
    const opportunity = application.opportunities;
    const publishDate = new Date(opportunity.created_at);
    const deadlineDate = opportunity.deadline_date ? new Date(opportunity.deadline_date) : null;
    const today = new Date();
    
    if (!deadlineDate) {
      return { progress: 50, daysRemaining: null }; // No deadline = show 50%
    }
    
    const totalDuration = deadlineDate.getTime() - publishDate.getTime();
    const elapsed = today.getTime() - publishDate.getTime();
    
    if (totalDuration <= 0) return { progress: 100, daysRemaining: 0 };
    
    const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    return { progress, daysRemaining };
  };

  // Generate application timeline
  const generateApplicationTimeline = () => {
    if (!application) return [];

    const timeline = [];

    timeline.push({
      id: 'applied',
      title: 'Aplicación enviada',
      description: 'Tu aplicación fue enviada exitosamente',
      date: application.created_at,
      icon: CheckCircle,
      status: 'completed',
      color: 'text-green-600'
    });

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

    const currentStatus = getDisplayStatus();
    let currentStep = null;

    switch (currentStatus) {
      case 'pending':
        currentStep = {
          id: 'review',
          title: 'Enviada',
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
          title: 'En Revisión',
          description: 'Tu perfil ha sido evaluado, esperando próximos pasos',
          date: application.updated_at,
          icon: CheckCircle,
          status: 'current',
          color: 'text-blue-600'
        };
        break;
      case 'accepted':
        currentStep = {
          id: 'accepted',
          title: 'Aceptada',
          description: 'Has sido seleccionado para continuar en el proceso',
          date: application.updated_at,
          icon: CheckCircle,
          status: 'completed',
          color: 'text-green-600'
        };
        break;
      case 'rejected':
        currentStep = {
          id: 'rejected',
          title: 'Rechazada',
          description: 'Gracias por tu interés, pero no fuiste seleccionado para esta posición',
          date: application.updated_at,
          icon: AlertCircle,
          status: 'completed',
          color: 'text-red-600'
        };
        break;
      case 'hired':
        currentStep = {
          id: 'hired',
          title: 'Contratado',
          description: '¡Felicidades! Has sido contratado para esta posición',
          date: application.updated_at,
          icon: CheckCircle2,
          status: 'completed',
          color: 'text-purple-600'
        };
        break;
      case 'closed':
        currentStep = {
          id: 'closed',
          title: 'Oportunidad Cerrada',
          description: 'Esta oportunidad ya no está disponible',
          date: application.updated_at,
          icon: AlertCircle,
          status: 'completed',
          color: 'text-gray-600'
        };
        break;
    }

    if (currentStep) {
      timeline.push(currentStep);
    }

    if (currentStatus !== 'accepted' && currentStatus !== 'rejected' && currentStatus !== 'hired' && currentStatus !== 'closed') {
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

  const displayStatus = getDisplayStatus();
  const compatibilityData = calculateCompatibilityScore();
  const progressData = calculateApplicationProgress();

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
          <h1 className="text-3xl font-bold text-foreground">
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

      {/* Opportunity Link Card - TOP */}
      <Card className="shadow-md hover:shadow-lg transition-shadow mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-xl flex items-center justify-center">
                {application.opportunities?.companies?.logo_url ? (
                  <img 
                    src={application.opportunities.companies.logo_url} 
                    alt={application.opportunities?.companies?.name}
                    className="w-8 h-8 object-contain rounded-lg"
                  />
                ) : (
                  <Briefcase className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {application.opportunities?.title}
                </h2>
                <p className="text-muted-foreground">
                  {application.opportunities?.companies?.name}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/opportunities/${application.opportunity_id}`)}
              variant="outline"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver detalles de la oportunidad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Layout Principal - Grid Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estado de Aplicación Card */}
          <Card className="border-t-4 border-t-primary shadow-lg">
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
                <Badge className={getStatusBadgeClass(displayStatus)} variant="secondary">
                  {getStatusText(displayStatus)}
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

              {/* Application Progress Bar */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progreso de Oportunidad</span>
                  <span className="text-sm text-muted-foreground">{progressData.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500"
                    style={{ width: `${progressData.progress}%` }}
                  />
                </div>
                {application.opportunities?.deadline_date && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Cierre: {new Date(application.opportunities.deadline_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {progressData.daysRemaining !== null && progressData.daysRemaining > 0 && (
                      <span className="text-primary ml-1">({progressData.daysRemaining} días restantes)</span>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline - Moved to Left Column */}
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
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform ${
                          step.status === 'completed' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                          step.status === 'current' ? 'bg-gradient-to-br from-yellow-100 to-amber-100' :
                          'bg-muted'
                        }`}>
                          <IconComponent className={`h-4 w-4 ${
                            step.status === 'completed' ? 'text-green-600' :
                            step.status === 'current' ? 'text-yellow-600' :
                            'text-muted-foreground'
                          }`} />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-8 mt-1 ${
                            step.status === 'completed' ? 'bg-green-200' : 'bg-border'
                          }`} />
                        )}
                      </div>
                      
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`font-semibold text-sm ${
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
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                        {step.date && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {new Date(step.date).toLocaleDateString('es-ES', {
                              month: 'short',
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
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grid de Metadatos */}
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

          {/* Cover Letter - Full Width */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                Carta de Presentación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.cover_letter}
                  onChange={(e) => setEditData({...editData, cover_letter: e.target.value})}
                  rows={8}
                  placeholder="Escribe tu carta de presentación..."
                  className="resize-none"
                />
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {application.cover_letter || 'Sin carta de presentación'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Compatibility Analysis - Moved to Right Column */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Percent className="h-4 w-4 text-primary" />
                  </div>
                  Análisis de Compatibilidad
                </CardTitle>
                <span className="text-2xl font-bold text-primary">{compatibilityData.total}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500"
                  style={{ width: `${compatibilityData.total}%` }}
                />
              </div>
              
              {compatibilityData.details.map((detail, index) => {
                const IconComponent = detail.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 ${detail.bgColor} rounded-lg`}>
                          <IconComponent className={`h-3.5 w-3.5 ${detail.color}`} />
                        </div>
                        <span className="text-sm font-medium">{detail.category}</span>
                      </div>
                      <span className="text-sm font-semibold">{detail.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${detail.bgColor} rounded-full transition-all duration-500`}
                        style={{ width: `${detail.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {detail.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Company Information */}
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
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-primary/20 flex-shrink-0">
                    {application.opportunities?.companies?.logo_url ? (
                      <img 
                        src={application.opportunities.companies.logo_url} 
                        alt={application.opportunities?.companies?.name}
                        className="w-10 h-10 object-contain rounded-lg"
                      />
                    ) : (
                      <Building className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold">
                      {application.opportunities?.companies?.name}
                    </h3>
                    {application.opportunities?.companies?.website && (
                      <a 
                        href={application.opportunities.companies.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-glow inline-flex items-center gap-1 text-sm hover:underline"
                      >
                        {application.opportunities.companies.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                
                {application.opportunities?.companies?.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Descripción</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
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