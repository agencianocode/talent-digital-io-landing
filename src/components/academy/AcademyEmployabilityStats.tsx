import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, Clock, Briefcase, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EmployabilityStats {
  total_graduates: number;
  employed_graduates: number;
  employment_rate: number;
  avg_days_to_hire: number;
  total_applications: number;
  top_companies: { name: string; hires: number }[];
  top_roles: { role: string; count: number }[];
}

interface AcademyEmployabilityStatsProps {
  academyId: string;
}

export const AcademyEmployabilityStats = ({ academyId }: AcademyEmployabilityStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmployabilityStats>({
    total_graduates: 0,
    employed_graduates: 0,
    employment_rate: 0,
    avg_days_to_hire: 0,
    total_applications: 0,
    top_companies: [],
    top_roles: [],
  });

  useEffect(() => {
    loadStats();
  }, [academyId]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get total graduates
      const { data: graduates, error: gradError } = await supabase
        .from('academy_students')
        .select('student_email, graduation_date')
        .eq('academy_id', academyId)
        .eq('status', 'graduated');

      if (gradError) throw gradError;

      const totalGraduates = graduates?.length || 0;

      // Get applications from graduates
      const graduateEmails = graduates?.map(g => g.student_email) || [];
      
      // Guard: only query if we have emails to avoid malformed query (400 error)
      let userIds: string[] = [];
      if (graduateEmails.length > 0) {
        const { data: users } = await supabase
          .from('profiles')
          .select('user_id')
          .in('email', graduateEmails);

        userIds = users?.map(u => u.user_id) || [];
      }

      // Guard: only query applications if we have user IDs
      let applications: any[] = [];
      if (userIds.length > 0) {
        const { data: applicationsData, error: appError } = await supabase
          .from('applications')
          .select(`
            id,
            user_id,
            status,
            created_at,
            opportunities (
              id,
              title,
              companies (
                name
              )
            )
          `)
          .in('user_id', userIds);

        if (appError) throw appError;
        applications = applicationsData || [];
      }

      // Calculate employment stats
      const employedCount = applications?.filter(a => 
        a.status === 'accepted' || a.status === 'hired'
      ).length || 0;

      const employmentRate = totalGraduates > 0 
        ? Math.round((employedCount / totalGraduates) * 100) 
        : 0;

      // Calculate top companies
      const companyHires: Record<string, number> = {};
      applications?.forEach(app => {
        if ((app.status === 'accepted' || app.status === 'hired') && app.opportunities?.companies?.name) {
          const name = app.opportunities.companies.name;
          companyHires[name] = (companyHires[name] || 0) + 1;
        }
      });

      const topCompanies = Object.entries(companyHires)
        .map(([name, hires]) => ({ name, hires }))
        .sort((a, b) => b.hires - a.hires)
        .slice(0, 5);

      setStats({
        total_graduates: totalGraduates,
        employed_graduates: employedCount,
        employment_rate: employmentRate,
        avg_days_to_hire: 30, // Placeholder
        total_applications: applications?.length || 0,
        top_companies: topCompanies,
        top_roles: [],
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas de Empleabilidad
          </CardTitle>
          <CardDescription>
            Métricas de éxito de tus graduados en el mercado laboral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Total Graduados</span>
              </div>
              <div className="text-3xl font-bold">{stats.total_graduates}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Empleados</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {stats.employed_graduates}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Tasa de Empleo</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.employment_rate}%
              </div>
              <Progress value={stats.employment_rate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Días a Contratación</span>
              </div>
              <div className="text-3xl font-bold">{stats.avg_days_to_hire}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Empresas Contratando</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.top_companies.length > 0 ? (
              <div className="space-y-3">
                {stats.top_companies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-muted-foreground">{company.hires} contrataciones</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos disponibles aún
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aplicaciones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-primary">{stats.total_applications}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Aplicaciones de tus graduados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
