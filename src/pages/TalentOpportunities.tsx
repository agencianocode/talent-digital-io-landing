
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin, Clock, DollarSign, Briefcase } from "lucide-react";
import { useApplications } from "@/hooks/useCustomHooks";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface Application {
  id: string;
  opportunity_id: string;
  status: string;
  created_at: string;
  opportunities: {
    title: string;
    company_id: string;
    location?: string;
    type: string;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    companies: {
      name: string;
      logo_url?: string;
    };
  };
}

const TalentOpportunities = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          opportunity_id,
          status,
          created_at,
          opportunities (
            id,
            title,
            company_id,
            location,
            type,
            salary_min,
            salary_max,
            currency,
            status,
            companies (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium";
      case 'accepted':
        return "bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium";
      case 'rejected':
        return "bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      default:
        return status;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.opportunities?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.opportunities?.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar aplicaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">
        Mis Aplicaciones ({filteredApplications.length})
      </h1>
      


      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {applications.length === 0 ? 'No has enviado aplicaciones aún' : 'No se encontraron aplicaciones'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {applications.length === 0 
              ? 'Explora las oportunidades disponibles y envía tu primera aplicación'
              : 'Intenta con otros términos de búsqueda'
            }
          </p>
          {applications.length === 0 && (
            <Button onClick={() => window.location.href = '/talent-dashboard/explore'}>
              Explorar Oportunidades
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-secondary p-4 sm:p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {application.opportunities?.title}
                    </h3>
                    <span className={getStatusBadgeClass(application.status)}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">
                      {application.opportunities?.companies?.name}
                    </span>
                    {application.opportunities?.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{application.opportunities.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{application.opportunities?.type}</span>
                    </div>
                    {application.opportunities?.salary_min && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          ${application.opportunities.salary_min.toLocaleString()}
                          {application.opportunities.salary_max && 
                            ` - $${application.opportunities.salary_max.toLocaleString()}`
                          } {application.opportunities.currency || 'USD'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm">
                    Aplicación enviada el {new Date(application.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="flex items-center justify-start sm:justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/talent-dashboard/opportunities/${application.opportunity_id}`)}
                    className="w-full sm:w-auto"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentOpportunities;
