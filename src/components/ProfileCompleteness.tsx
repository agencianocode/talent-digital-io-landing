import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedProgress } from '@/components/ui/unified-progress';
import { AchievementBadge, LevelProgress, MotivationalMessage, sampleBadges } from '@/components/ui/gamification';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Star, Trophy, Target } from 'lucide-react';

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  route: string;
}

interface ProfileCompletenessProps {
  userType: 'talent' | 'business';
  profileData?: any;
  onSectionComplete?: (sectionId: string) => void;
}

const motivationalMessages = [
  "¡Cada paso te acerca más a tus objetivos profesionales!",
  "Tu perfil se ve cada vez mejor. ¡Sigue así!",
  "Los reclutadores valoran perfiles completos como el tuyo.",
  "¡Estás construyendo tu marca personal digital!",
  "Cada detalle cuenta para destacar entre otros profesionales."
];

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({
  userType
}) => {
  const navigate = useNavigate();
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [achievements, setAchievements] = useState(sampleBadges);

  const talentSections: ProfileSection[] = [
    {
      id: 'basic-info',
      title: 'Información Básica',
      description: 'Nombre, foto de perfil, ubicación',
      completed: false,
      points: 100,
      route: '/settings/profile'
    },
    {
      id: 'professional-info',
      title: 'Información Profesional',
      description: 'Título, experiencia, habilidades',
      completed: false,
      points: 150,
      route: '/settings/talent-profile'
    },
    {
      id: 'portfolio',
      title: 'Portafolio',
      description: 'Proyectos, trabajos anteriores',
      completed: false,
      points: 200,
      route: '/settings/talent-profile'
    },
    {
      id: 'preferences',
      title: 'Preferencias',
      description: 'Tipo de trabajo, disponibilidad',
      completed: false,
      points: 100,
      route: '/settings/professional-preferences'
    }
  ];

  const businessSections: ProfileSection[] = [
    {
      id: 'company-basic',
      title: 'Información de Empresa',
      description: 'Nombre, logo, descripción',
      completed: false,
      points: 100,
      route: '/business-dashboard/company-profile'
    },
    {
      id: 'company-details',
      title: 'Detalles Empresariales',
      description: 'Industria, tamaño, cultura',
      completed: false,
      points: 150,
      route: '/business-dashboard/company-profile'
    },
    {
      id: 'team-setup',
      title: 'Configuración de Equipo',
      description: 'Miembros, roles, permisos',
      completed: false,
      points: 100,
      route: '/business-dashboard/users'
    }
  ];

  const sections = userType === 'talent' ? talentSections : businessSections;
  const totalPoints = sections.reduce((sum, section) => sum + section.points, 0);
  const earnedPoints = sections
    .filter(section => completedSections.includes(section.id))
    .reduce((sum, section) => sum + section.points, 0);
  
  const completionPercentage = sections.length > 0 
    ? Math.round((completedSections.length / sections.length) * 100)
    : 0;

  // Simulate profile completion data
  useEffect(() => {
    // In a real app, this would come from your profile data
    const mockCompletedSections = ['basic-info']; // Mock one completed section
    setCompletedSections(mockCompletedSections);
    setCurrentXP(earnedPoints);
    
    // Update achievement progress based on completion
    const updatedAchievements = achievements.map(badge => {
      if (badge.id === 'first-profile' && mockCompletedSections.length > 0) {
        return { ...badge, earned: true, progress: 1 };
      }
      return badge;
    });
    setAchievements(updatedAchievements);
  }, []);

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(currentXP / 100) + 1;
    setCurrentLevel(newLevel);
  }, [currentXP]);

  const handleSectionClick = (section: ProfileSection) => {
    if (!section.completed) {
      navigate(section.route);
    }
  };

  const xpInCurrentLevel = currentXP % 100;

  return (
    <div className="space-y-6">
      {/* Header with Level and Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Completitud del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Progress */}
          <UnifiedProgress
            value={completionPercentage}
            maxValue={100}
            label="Progreso General"
            size="lg"
            animated={true}
          />
          
          {/* Level Progress */}
          <LevelProgress
            currentLevel={currentLevel}
            currentXP={xpInCurrentLevel}
            requiredXP={100}
          />
          
          {/* XP Summary */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{earnedPoints} / {totalPoints} XP ganados</span>
            <span>{completedSections.length} / {sections.length} secciones</span>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <MotivationalMessage messages={motivationalMessages} />

      {/* Profile Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Próximos Pasos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sections.map((section) => {
              const isCompleted = completedSections.includes(section.id);
              
              return (
                <div
                  key={section.id}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-card hover:bg-accent/50'
                  }`}
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-current" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                          {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-muted-foreground">{section.points} XP</span>
                      </div>
                      {!isCompleted && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Logros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((badge) => (
              <AchievementBadge
                key={badge.id}
                badge={badge}
                size="sm"
                showProgress={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {completionPercentage < 100 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿Listo para seguir mejorando tu perfil?
              </p>
              <Button
                onClick={() => {
                  const nextIncompleteSection = sections.find(
                    section => !completedSections.includes(section.id)
                  );
                  if (nextIncompleteSection) {
                    navigate(nextIncompleteSection.route);
                  }
                }}
                className="w-full sm:w-auto"
              >
                Continuar Perfil
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileCompleteness;