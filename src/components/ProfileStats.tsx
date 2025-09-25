import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Eye, 
  Share2, 
  Heart, 
  MessageCircle, 
  Calendar,
  Award,
  Target
} from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useExperience } from '@/hooks/useExperience';
import { useEducation } from '@/hooks/useEducation';
import { useSocialLinks } from '@/hooks/useSocialLinks';

export const ProfileStats: React.FC = () => {
  const { getProfileCompleteness } = useProfileData();
  const { portfolios } = usePortfolio();
  const { experiences, getTotalYearsExperience } = useExperience();
  const { education, getHighestDegree } = useEducation();
  const { socialLinks } = useSocialLinks();

  const profileCompleteness = getProfileCompleteness();
  const totalYearsExperience = getTotalYearsExperience();
  const highestDegree = getHighestDegree();

  // Mock data for demo purposes - in a real app, this would come from analytics
  const mockStats = {
    profileViews: 1247,
    shares: 23,
    likes: 89,
    messages: 12,
    lastActive: '2 horas',
    joinDate: 'Enero 2024'
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessMessage = (percentage: number) => {
    if (percentage >= 80) return 'Perfil completo';
    if (percentage >= 60) return 'Casi completo';
    return 'Necesita más información';
  };

  return (
    <div className="space-y-6">
      {/* Profile Completeness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Completitud del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso general</span>
              <span className={`text-sm font-bold ${getCompletenessColor(profileCompleteness)}`}>
                {profileCompleteness}%
              </span>
            </div>
            <Progress value={profileCompleteness} className="h-2" />
            <p className={`text-sm ${getCompletenessColor(profileCompleteness)}`}>
              {getCompletenessMessage(profileCompleteness)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{portfolios.length}</div>
              <div className="text-sm text-blue-600">Portfolios</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{experiences.length}</div>
              <div className="text-sm text-green-600">Experiencias</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{education.length}</div>
              <div className="text-sm text-purple-600">Educación</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{socialLinks.length}</div>
              <div className="text-sm text-orange-600">Redes Sociales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Experiencia Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Años de experiencia</span>
              <Badge variant="secondary">
                {totalYearsExperience} años
              </Badge>
            </div>
            {highestDegree && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Título más alto</span>
                <Badge variant="outline">
                  {highestDegree.degree}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Posiciones actuales</span>
              <Badge variant="secondary">
                {experiences.filter(exp => exp.current).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Visualizaciones</span>
              </div>
              <span className="text-sm font-medium">{mockStats.profileViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Compartidos</span>
              </div>
              <span className="text-sm font-medium">{mockStats.shares}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Me gusta</span>
              </div>
              <span className="text-sm font-medium">{mockStats.likes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Mensajes</span>
              </div>
              <span className="text-sm font-medium">{mockStats.messages}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Última actividad</span>
                <span className="text-xs text-gray-500">{mockStats.lastActive}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Miembro desde</span>
                <span className="text-xs text-gray-500">{mockStats.joinDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips for Improvement */}
      {profileCompleteness < 80 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Target className="h-5 w-5" />
              Mejora tu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!portfolios.length && (
                <p className="text-sm text-yellow-700">• Agrega al menos un portfolio</p>
              )}
              {!experiences.length && (
                <p className="text-sm text-yellow-700">• Completa tu experiencia laboral</p>
              )}
              {!education.length && (
                <p className="text-sm text-yellow-700">• Agrega tu formación académica</p>
              )}
              {!socialLinks.length && (
                <p className="text-sm text-yellow-700">• Conecta tus redes sociales</p>
              )}
              <p className="text-sm text-yellow-700">
                Un perfil completo tiene 3x más probabilidades de ser contactado
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
