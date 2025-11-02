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
  Mail, 
  TrendingUp, 
  Briefcase, 
  Activity,
  Share2,
  Plus,
  Settings,
  Palette,
  FileUp
} from 'lucide-react';
import AcademyOverview from '../components/academy/AcademyOverview';
import StudentDirectory from '../components/academy/StudentDirectory';
import InvitationManager from '../components/academy/InvitationManager';
import ActivityFeed from '../components/academy/ActivityFeed';
import ExclusiveOpportunities from '../components/academy/ExclusiveOpportunities';
import PublicDirectory from '../components/academy/PublicDirectory';
import { AcademyBrandingSettings } from '@/components/academy/AcademyBrandingSettings';
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

  // Check if user has academy role
  const isAcademyRole = userRole === 'business' || userRole === 'premium_business' || userRole === 'freemium_business' || userRole === 'academy_premium' || userRole === 'admin';

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

  // Only initialize useAcademyData when we have a valid company
  const academyId = activeCompany?.id || '';
  const { stats } = useAcademyData(academyId);

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
            <Button variant="outline" size="sm" onClick={() => setActiveTab('branding')}>
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Button size="sm" onClick={() => setActiveTab('invitations')}>
              <Plus className="h-4 w-4 mr-2" />
              Invitar Estudiantes
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                  <p className="text-2xl font-bold">{stats.active_students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Mail className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invitaciones</p>
                  <p className="text-2xl font-bold">{stats.pending_invitations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aplicaciones</p>
                  <p className="text-2xl font-bold">{stats.total_applications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Oportunidades</p>
                  <p className="text-2xl font-bold">{stats.exclusive_opportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitaciones
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Oportunidades
          </TabsTrigger>
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Directorio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <AcademyOverview academyId={academyId} onTabChange={setActiveTab} />
            <AcademyEmployabilityStats academyId={academyId} />
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <AcademyBrandingSettings academyId={academyId} />
        </TabsContent>

        <TabsContent value="students">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setBulkInviteOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
            </div>
            <StudentDirectory academyId={academyId} onInviteClick={() => setActiveTab('invitations')} />
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationManager academyId={academyId} />
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            <ActivityFeed academyId={academyId} />
            <GraduateApplicationsTracking academyId={academyId} />
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <ExclusiveOpportunities academyId={academyId} />
        </TabsContent>

        <TabsContent value="directory">
          <PublicDirectory academyId={academyId} />
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
