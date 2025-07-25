import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Search, Filter, Eye, Edit, Link, MoreHorizontal, Briefcase, Users } from "lucide-react";
import { toast } from "sonner";

const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const { userRole, company } = useSupabaseAuth();
  const { opportunities, isLoading, getApplicationsByOpportunity } = useSupabaseOpportunities();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});

  // Job categories with subcategories
  const jobCategories = {
    'Ventas': [
      'Closer de ventas',
      'SDR / Vendedor remoto', 
      'Appointment Setter',
      'Triage',
      'Director comercial'
    ],
    'Marketing': [
      'Media Buyer',
      'Marketing Expert', 
      'Content Specialist',
      'Editor de video'
    ],
    'Operaciones': [
      'Asistente Operativo',
      'Asistente Personal Virtual',
      'Project Manager', 
      'Experto en Automatizaciones'
    ],
    'Fulfillment': [
      'CSM',
      'Atención al cliente'
    ],
    'Desarrollo': [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer'
    ],
    'Diseño': [
      'UI/UX Designer', 
      'Graphic Designer',
      'Web Designer'
    ]
  };

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Por Contrato' },
    { value: 'freelance', label: 'Freelance' }
  ];

  // Filter opportunities by company (business users only see their own)
  const companyOpportunities = opportunities.filter(opp => 
    !company || opp.company_id === company.id
  );

  // Apply search and filters
  const filteredOpportunities = companyOpportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || categoryFilter === "all" || opp.category === categoryFilter;
    const matchesType = !typeFilter || typeFilter === "all" || opp.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Load application counts for each opportunity
  useEffect(() => {
    const loadApplicationCounts = async () => {
      const counts: Record<string, number> = {};
      
      for (const opp of companyOpportunities) {
        try {
          const applications = await getApplicationsByOpportunity(opp.id);
          counts[opp.id] = applications.length;
        } catch (error) {
          console.error(`Error loading applications for ${opp.id}:`, error);
          counts[opp.id] = 0;
        }
      }
      
      setApplicationCounts(counts);
    };

    if (companyOpportunities.length > 0) {
      loadApplicationCounts();
    }
  }, [companyOpportunities, getApplicationsByOpportunity]);

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  if (userRole !== 'business') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los usuarios de empresa pueden acceder a esta página.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with advanced filters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">
            Mis Oportunidades ({filteredOpportunities.length})
          </h1>
          <Button 
            onClick={() => navigate('/dashboard/opportunities/new')}
            className="font-semibold"
          >
            Publicar Oportunidad
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
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
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {Object.keys(jobCategories).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo de trabajo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {companyOpportunities.length === 0 ? 'No tienes oportunidades publicadas' : 'No se encontraron oportunidades'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {companyOpportunities.length === 0 
              ? 'Publica tu primera oportunidad para empezar a recibir aplicaciones'
              : 'Intenta con otros términos de búsqueda o filtros'
            }
          </p>
          {companyOpportunities.length === 0 && (
            <Button onClick={() => navigate('/dashboard/opportunities/new')}>
              Publicar Primera Oportunidad
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {opportunity.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={getStatusBadgeClass(opportunity.is_active)}
                    >
                      {opportunity.is_active ? 'ACTIVA' : 'INACTIVA'}
                    </Badge>
                    <Badge variant="outline">
                      {opportunity.category}
                    </Badge>
                    <Badge variant="outline">
                      {jobTypes.find(t => t.value === opportunity.type)?.label || opportunity.type}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {opportunity.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {opportunity.location && (
                      <span>📍 {opportunity.location}</span>
                    )}
                    {opportunity.salary_min && (
                      <span>
                        💰 ${opportunity.salary_min.toLocaleString()}
                        {opportunity.salary_max && ` - $${opportunity.salary_max.toLocaleString()}`}
                        {` ${opportunity.currency || 'USD'}`}
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{applicationCounts[opportunity.id] || 0} postulantes</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigate(`/dashboard/opportunities/${opportunity.id}`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="Compartir"
                    onClick={() => {
                      const url = `${window.location.origin}/opportunities/${opportunity.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Enlace copiado al portapapeles');
                    }}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="Más opciones"
                  >
                    <MoreHorizontal className="h-4 w-4" />
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

export default OpportunitiesPage;