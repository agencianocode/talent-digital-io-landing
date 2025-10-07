import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigationFlow } from '@/components/NavigationFlowProvider';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { 
  Sparkles, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Star,
  Users,
  TrendingUp,
  Heart
} from 'lucide-react';

const WelcomePage: React.FC = () => {
  const { 
    profileStateInfo, 
    disclosureConfig,
    navigateToOnboarding, 
    navigateToDashboard,
    canAccessDashboard 
  } = useNavigationFlow();
  const { profile, userRole } = useSupabaseAuth();

  // Redirect business users to business dashboard
  useEffect(() => {
    if (userRole && isBusinessRole(userRole)) {
      navigateToDashboard();
    }
  }, [userRole, navigateToDashboard]);

  const userName = profile?.full_name || 'Talento';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            ¡Bienvenido a TalentoDigital.io, {userName}! 🎉
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Estás a punto de descubrir las mejores oportunidades en ventas digitales. 
            Te guiaremos paso a paso para crear un perfil profesional irresistible.
          </p>

          {/* Profile State Badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <Badge variant="outline" className="text-sm">
              Estado del perfil: {profileStateInfo.label} {profileStateInfo.icon}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* What You'll Get */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Lo que conseguirás
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileStateInfo.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Próximos pasos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileStateInfo.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Available Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Funciones disponibles para ti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {disclosureConfig.availableFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <Card className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Casos de éxito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">87%</div>
                  <div className="text-sm text-muted-foreground">Encuentra trabajo en 30 días</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">2.3x</div>
                  <div className="text-sm text-muted-foreground">Más ingresos promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
                  <div className="text-sm text-muted-foreground">Satisfacción del usuario</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={userRole && isBusinessRole(userRole) ? navigateToDashboard : navigateToOnboarding}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Comenzar configuración
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {canAccessDashboard && (
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={navigateToDashboard}
              >
                <Users className="mr-2 h-5 w-5" />
                Ir al Dashboard
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Un perfil completo recibe 3x más oportunidades
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;