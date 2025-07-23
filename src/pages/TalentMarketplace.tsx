
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin, Clock, DollarSign, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location?: string;
  type: string;
  category: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  company_id: string;
  companies: {
    name: string;
    logo_url?: string;
  };
}

const TalentMarketplace = () => {
  const { user } = useSupabaseAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          location,
          type,
          category,
          salary_min,
          salary_max,
          currency,
          company_id,
          companies (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (opportunityId: string) => {
    if (!user) return;

    setApplying(opportunityId);
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          status: 'pending'
        });

      if (error) throw error;
      
      // Show success message or update UI
      alert('¡Aplicación enviada exitosamente!');
    } catch (error) {
      console.error('Error applying to opportunity:', error);
      alert('Error al enviar la aplicación. Intenta de nuevo.');
    } finally {
      setApplying(null);
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar oportunidades..."
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

      <h1 className="text-3xl font-bold text-foreground mb-8">
        Marketplace de Oportunidades ({filteredOpportunities.length})
      </h1>
      
      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {opportunities.length === 0 ? 'No hay oportunidades disponibles' : 'No se encontraron oportunidades'}
          </h3>
          <p className="text-muted-foreground">
            {opportunities.length === 0 
              ? 'Las empresas pronto publicarán nuevas oportunidades'
              : 'Intenta con otros términos de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-secondary p-6 rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {opportunity.title}
                    </h3>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                      {opportunity.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <span className="font-medium text-foreground">
                      {opportunity.companies?.name}
                    </span>
                    {opportunity.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{opportunity.type}</span>
                    </div>
                    {opportunity.salary_min && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          ${opportunity.salary_min.toLocaleString()}
                          {opportunity.salary_max && 
                            ` - $${opportunity.salary_max.toLocaleString()}`
                          } {opportunity.currency || 'USD'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-foreground mb-4 line-clamp-3">
                    {opportunity.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <Button 
                    onClick={() => handleApply(opportunity.id)}
                    disabled={applying === opportunity.id}
                    className="min-w-[120px]"
                  >
                    {applying === opportunity.id ? 'Aplicando...' : 'Aplicar'}
                  </Button>
                  <Button variant="outline" size="sm">
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

export default TalentMarketplace;
