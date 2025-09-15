import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ProfileTemplates } from '@/components/ProfileTemplates';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp, 
  Star,
  Lightbulb,
  Award,
  User,
  Briefcase,
  BookOpen,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  status: 'complete' | 'in-progress' | 'not-started';
  actionLabel: string;
  actionRoute: string;
  priority: 'high' | 'medium' | 'low';
  completionTips?: string[];
  estimatedTime?: string;
}

export const ProfileCompletenessDashboard: React.FC = () => {
  const { 
    completeness, 
    breakdown, 
    loading, 
    getCompletenessColor, 
    getCompletenessLabel 
  } = useProfileCompleteness();
  
  const { profile } = useSupabaseAuth();
  const navigate = useNavigate();
  const [showTemplates, setShowTemplates] = useState(false);

  const sections: DashboardSection[] = [
    {
      id: 'basic',
      title: 'Información Básica',
      description: 'Nombre, foto, contacto y ubicación',
      icon: <User className="h-5 w-5" />,
      progress: breakdown.basic_info,
      status: breakdown.basic_info >= 30 ? 'complete' : breakdown.basic_info > 0 ? 'in-progress' : 'not-started',
      actionLabel: 'Completar Información Personal',
      actionRoute: '/settings/profile?tab=personal',
      priority: breakdown.basic_info < 20 ? 'high' : 'medium',
      completionTips: [
        'Agrega tu nombre completo y foto de perfil',
        'Incluye tu ubicación y contacto',
        'Conecta tus redes sociales profesionales'
      ],
      estimatedTime: '5 min'
    },
    {
      id: 'professional',
      title: 'Información Profesional',
      description: 'Categoría, título y nivel de experiencia',
      icon: <Briefcase className="h-5 w-5" />,
      progress: breakdown.professional_info,
      status: breakdown.professional_info >= 25 ? 'complete' : breakdown.professional_info > 0 ? 'in-progress' : 'not-started',
      actionLabel: 'Configurar Perfil Profesional',
      actionRoute: '/settings/profile?tab=professional',
      priority: breakdown.professional_info < 15 ? 'high' : 'medium',
      completionTips: [
        'Selecciona tu categoría profesional',
        'Define tu título y nivel de experiencia',
        'Establece tus tarifas y disponibilidad'
      ],
      estimatedTime: '8 min'
    },
    {
      id: 'skills',
      title: 'Habilidades y Biografía',
      description: 'Skills, bio e industrias de interés',
      icon: <Award className="h-5 w-5" />,
      progress: breakdown.skills_and_bio,
      status: breakdown.skills_and_bio >= 18 ? 'complete' : breakdown.skills_and_bio > 0 ? 'in-progress' : 'not-started',
      actionLabel: 'Agregar Habilidades',
      actionRoute: '/settings/profile?tab=professional',
      priority: breakdown.skills_and_bio < 10 ? 'high' : 'low',
      completionTips: [
        'Lista tus habilidades técnicas clave',
        'Escribe una biografía atractiva',
        'Selecciona industrias de interés'
      ],
      estimatedTime: '10 min'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600';
      case 'in-progress': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default', 
      low: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants]} className="text-xs">
        {priority === 'high' ? 'Urgente' : priority === 'medium' ? 'Importante' : 'Opcional'}
      </Badge>
    );
  };

  const getMotivationalMessage = () => {
    if (completeness >= 90) return "¡Excelente! Tu perfil está prácticamente completo";
    if (completeness >= 70) return "¡Muy bien! Solo faltan algunos detalles";
    if (completeness >= 50) return "¡Buen progreso! Sigamos completando tu perfil";
    if (completeness >= 30) return "¡Buen comienzo! Continuemos mejorando tu perfil";
    return "¡Empecemos a crear un perfil increíble!";
  };

  const getNextSteps = () => {
    const incompleteSections = sections
      .filter(section => section.status !== 'complete')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    
    return incompleteSections.slice(0, 3);
  };

  // Get priority actions for the user

  if (loading && completeness === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Dashboard de Completitud
              </CardTitle>
              <p className="text-muted-foreground">
                {getMotivationalMessage()}
              </p>
            </div>
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Progreso Total</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getCompletenessColor(completeness)}`}>
                  {completeness}%
                </span>
                <Badge variant={completeness >= 80 ? 'default' : 'secondary'}>
                  {getCompletenessLabel(completeness)}
                </Badge>
              </div>
            </div>
            <Progress value={completeness} className="h-3" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sections.filter(s => s.status === 'complete').length}
              </div>
              <div className="text-xs text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sections.filter(s => s.status === 'in-progress').length}
              </div>
              <div className="text-xs text-muted-foreground">En Progreso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {sections.filter(s => s.status === 'not-started').length}
              </div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progreso por Sección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id}>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg bg-background ${getStatusColor(section.status)}`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{section.title}</h3>
                      {getStatusIcon(section.status)}
                      {getPriorityBadge(section.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {section.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress value={section.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium min-w-[40px]">
                        {section.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant={section.status === 'not-started' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => navigate(section.actionRoute)}
                  className="ml-4"
                >
                  {section.status === 'complete' ? 'Revisar' : 'Completar'}
                </Button>
              </div>
              {index < sections.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {getNextSteps().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Próximos Pasos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getNextSteps().map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate(step.actionRoute)}
                  variant={step.priority === 'high' ? 'default' : 'outline'}
                >
                  {step.actionLabel}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Profile Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Plantillas de Perfil
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowTemplates(!showTemplates)}
            >
              {showTemplates ? 'Ocultar' : 'Ver Plantillas'}
            </Button>
          </div>
        </CardHeader>
        {showTemplates && (
          <CardContent>
            <ProfileTemplates />
          </CardContent>
        )}
      </Card>

      {/* Tips & Suggestions */}
      {breakdown.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Consejos Personalizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {breakdown.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {completeness >= 90 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-800 mb-2">
              ¡Felicidades! Perfil Casi Completo
            </h3>
            <p className="text-green-700 mb-4">
              Tu perfil está en excelente forma. ¡Sigue así para destacar entre los talentos!
            </p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/talent-dashboard')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Ver Mi Perfil Completo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};