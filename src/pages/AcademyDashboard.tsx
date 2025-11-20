import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAcademyData } from '@/hooks/useAcademyData';
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Activity,
  Share2,
  Plus,
  Settings,
  FileUp
} from 'lucide-react';
import AcademyOverview from '../components/academy/AcademyOverview';
import StudentManagement from '../components/academy/StudentManagement';
import ActivityFeed from '../components/academy/ActivityFeed';
import PublicDirectorySettings from '../components/academy/PublicDirectorySettings';
import { BulkInviteModal } from '@/components/academy/BulkInviteModal';
import { AcademyEmployabilityStats } from '@/components/academy/AcademyEmployabilityStats';
import { GraduateApplicationsTracking } from '@/components/academy/GraduateApplicationsTracking';
import { ShareAcademyModal } from '@/components/academy/ShareAcademyModal';

const AcademyDashboard: React.FC = () => {
  const { user, userRole, isLoading: authLoading } = useSupabaseAuth();
  const { activeCompany, isLoading: companyLoading } = useCompany();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [expandInvitations, setExpandInvitations] = useState(false);

  // Check if user has academy role
  const isAcademyRole = userRole === 'business' || userRole === 'premium_business' || userRole === 'freemium_business' || userRole === 'academy_premium' || userRole === 'admin';

  // Initialize useAcademyData BEFORE any conditional returns (React Hook rules)
  // Pass activeCompany?.id safely, hook will handle empty/invalid values
  const academyId = activeCompany?.id || '';
  useAcademyData(academyId);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isAcademyRole) {
      navigate('/business-dashboard');
      return;
    }

    if (!companyLoading && !activeCompany) {
      toast.error('No se encontró ninguna empresa activa');
      navigate('/business-dashboard');
    }
  }, [user, userRole, navigate, isAcademyRole, activeCompany, companyLoading]);

  // Show loading while auth or company are loading
  if (authLoading || companyLoading || !user || !activeCompany) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando academia...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAcademyRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground text-center mb-4">
              Solo las academias pueden acceder a esta sección.
            </p>
            <p className="text-sm text-muted-foreground">
              Rol actual: {userRole || 'No definido'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              Mi Academia
            </h1>
            <p className="text-muted-foreground">
              Gestiona tu academia, estudiantes y oportunidades exclusivas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShareModalOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('public-directory')}>
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Button size="sm" onClick={() => {
              setActiveTab('students');
              setExpandInvitations(true);
              // Reset after a short delay to allow the component to react
              setTimeout(() => setExpandInvitations(false), 100);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Invitar Estudiantes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="public-directory" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Directorio Público
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <AcademyOverview academyId={academyId} onTabChange={setActiveTab} />
            <AcademyEmployabilityStats academyId={academyId} />
          </div>
        </TabsContent>

        <TabsContent value="students">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setBulkInviteOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
            </div>
            <StudentManagement academyId={academyId} initialExpanded={expandInvitations} />
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            <ActivityFeed academyId={academyId} />
            <GraduateApplicationsTracking academyId={academyId} />
          </div>
        </TabsContent>

        <TabsContent value="public-directory">
          <PublicDirectorySettings academyId={academyId} />
        </TabsContent>
      </Tabs>

      <BulkInviteModal 
        open={bulkInviteOpen}
        onOpenChange={setBulkInviteOpen}
        academyId={academyId}
        onSuccess={() => {
          setBulkInviteOpen(false);
          toast.success('Estudiantes importados exitosamente');
        }}
      />

      <ShareAcademyModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        academyId={academyId}
        academySlug={(activeCompany as any).academy_slug || undefined}
        academyName={activeCompany.name}
      />
    </div>
  );
};

export default AcademyDashboard;
