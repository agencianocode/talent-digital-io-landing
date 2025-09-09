import React from 'react';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { ProfileCompletenessDashboard } from '@/components/ProfileCompletenessDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { userRole, profile } = useSupabaseAuth();
  const navigate = useNavigate();

  // Redirect if not talent role
  if (!isTalentRole(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground mb-4">
              El onboarding está disponible solo para perfiles de talento.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/talent-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
            <p className="text-muted-foreground">
              Completa tu perfil para encontrar mejores oportunidades
            </p>
          </div>
        </div>

        {/* Main Content */}
        <OnboardingWizard />
      </div>
    </div>
  );
};

export default OnboardingPage;