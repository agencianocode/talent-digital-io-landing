import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExclusiveOpportunityBadge } from '@/components/opportunity/ExclusiveOpportunityBadge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useIsMounted } from '@/hooks/useIsMounted';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  DollarSign,
  Clock,
  Users,
  Loader2
} from 'lucide-react';

interface ExclusiveOpportunitiesProps {
  academyId: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  created_at: string;
  companies?: {
    name: string;
  };
  _count?: {
    applications: number;
  };
}

export const ExclusiveOpportunities: React.FC<ExclusiveOpportunitiesProps> = ({ academyId }) => {
  const navigate = useNavigate();
  const isMountedRef = useIsMounted();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    loadExclusiveOpportunities();
  }, [academyId]);

  const loadExclusiveOpportunities = async () => {
    if (!isMountedRef.current) return;
    
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          location,
          type,
          salary_min,
          salary_max,
          currency,
          created_at,
          companies (
            name
          )
        `)
        .eq('company_id', academyId)
        .eq('is_academy_exclusive', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get application counts for each opportunity
      const opportunitiesWithCounts = await Promise.all(
        (data || []).map(async (opp) => {
          const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('opportunity_id', opp.id);

          return {
            ...opp,
            _count: { applications: count || 0 }
          };
        })
      );

      if (isMountedRef.current) {
        setOpportunities(opportunitiesWithCounts as Opportunity[]);
      }
    } catch (error) {
      console.error('Error loading exclusive opportunities:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const formatSalary = (opp: Opportunity) => {
    if (!opp.salary_min && !opp.salary_max) return null;
    const currency = opp.currency || 'USD';
    if (opp.salary_min && opp.salary_max) {
      return `${currency} ${opp.salary_min.toLocaleString()} - ${opp.salary_max.toLocaleString()}`;
    }
    if (opp.salary_min) return `Desde ${currency} ${opp.salary_min.toLocaleString()}`;
    return `Hasta ${currency} ${opp.salary_max?.toLocaleString()}`;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Oportunidades Exclusivas</h2>
          <p className="text-muted-foreground">
            Oportunidades de trabajo exclusivas para estudiantes de tu academia
          </p>
        </div>
        <Button onClick={() => navigate('/business-dashboard/opportunities/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Oportunidad
        </Button>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay oportunidades exclusivas</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crea oportunidades exclusivas para tus estudiantes
              </p>
              <Button onClick={() => navigate('/business-dashboard/opportunities/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Oportunidad
              </Button>
            </CardContent>
          </Card>
        ) : (
          opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow border-2 border-purple-200 bg-gradient-to-br from-purple-50/30 to-blue-50/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {opportunity.title}
                      </h3>
                      <ExclusiveOpportunityBadge size="sm" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {opportunity.companies?.name}
                    </p>
                    
                    <p className="text-sm text-foreground mb-4 line-clamp-2">
                      {opportunity.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{opportunity.location}</span>
                      </div>
                      {formatSalary(opportunity) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatSalary(opportunity)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{opportunity.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{opportunity._count?.applications || 0} aplicaciones</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Publicada: {new Date(opportunity.created_at).toLocaleDateString('es')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}/applicants`)}
                    >
                      Ver Aplicaciones
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}/edit`)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExclusiveOpportunities;
