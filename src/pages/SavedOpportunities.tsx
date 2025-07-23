import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { Bookmark, Eye, Briefcase, MapPin, DollarSign } from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";

const SavedOpportunities = () => {
  const navigate = useNavigate();
  const { getSavedOpportunitiesWithData, unsaveOpportunity, isLoading } = useSavedOpportunities();
  const { hasApplied } = useSupabaseOpportunities();
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Por Contrato' },
    { value: 'freelance', label: 'Freelance' }
  ];

  useEffect(() => {
    const loadSavedOpportunities = async () => {
      setLoadingData(true);
      try {
        const data = await getSavedOpportunitiesWithData();
        setSavedOpportunities(data);
      } catch (error) {
        console.error('Error loading saved opportunities:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadSavedOpportunities();
  }, [getSavedOpportunitiesWithData]);

  const handleUnsave = async (opportunityId: string) => {
    try {
      await unsaveOpportunity(opportunityId);
      setSavedOpportunities(prev => 
        prev.filter(item => item.opportunities.id !== opportunityId)
      );
    } catch (error) {
      console.error('Error unsaving opportunity:', error);
    }
  };

  if (loadingData || isLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Oportunidades Guardadas
          </h1>
          <p className="text-muted-foreground">
            Oportunidades que has guardado para revisar más tarde
          </p>
        </div>
        <LoadingSkeleton type="list" count={3} />
      </div>
    );
  }

  if (savedOpportunities.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Oportunidades Guardadas
          </h1>
          <p className="text-muted-foreground">
            Oportunidades que has guardado para revisar más tarde
          </p>
        </div>
        <EmptyState
          type="search"
          icon={<Bookmark className="h-12 w-12 text-muted-foreground" />}
          title="No tienes oportunidades guardadas"
          description="Guarda oportunidades interesantes para revisarlas más tarde"
          actionText="Explorar Oportunidades"
          onAction={() => navigate('/talent-dashboard/explore')}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Oportunidades Guardadas ({savedOpportunities.length})
        </h1>
        <p className="text-muted-foreground">
          Oportunidades que has guardado para revisar más tarde
        </p>
      </div>

      <div className="space-y-4">
        {savedOpportunities.map((savedItem) => {
          const opportunity = savedItem.opportunities;
          const company = opportunity.companies;
          const applied = hasApplied(opportunity.id);

          return (
            <div key={opportunity.id} className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {opportunity.title}
                    </h3>
                    {applied && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Aplicado
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {opportunity.category}
                    </Badge>
                    <Badge variant="secondary">
                      {jobTypes.find(t => t.value === opportunity.type)?.label || opportunity.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    {company && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{company.name}</span>
                      </div>
                    )}
                    {opportunity.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    {opportunity.salary_min && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          ${opportunity.salary_min.toLocaleString()}
                          {opportunity.salary_max && ` - $${opportunity.salary_max.toLocaleString()}`}
                          {` ${opportunity.currency || 'USD'}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {opportunity.description}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    Guardado el {new Date(savedItem.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUnsave(opportunity.id)}
                    title="Quitar de guardados"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedOpportunities;