import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Edit, Link, MoreHorizontal } from "lucide-react";

const opportunities = [
  {
    id: 1,
    title: "Closer de ventas B2B",
    status: "ACTIVA",
    tags: ["Ventas", "Closer de ventas", "Vendedor remoto"],
    applicants: 0
  },
  {
    id: 2, 
    title: "Media Buyer para Agencia de Diseño",
    status: "ACTIVA",
    tags: ["Ads", "Media Buyer", "Marketing"],
    applicants: 0
  },
  {
    id: 3,
    title: "Closer de ventas B2B", 
    status: "CERRADA",
    tags: ["Ventas", "Closer de ventas", "Vendedor remoto"],
    applicants: 0
  }
];

const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadgeClass = (status: string) => {
    return status === "ACTIVA" 
      ? "bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
      : "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium";
  };

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
        
        <Button 
          onClick={() => navigate('/dashboard/opportunities/new')}
          className="ml-4 font-semibold"
        >
          Publicar Oportunidad
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-8">
        Oportunidades Publicadas
      </h1>
      
      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-secondary p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {opportunity.title}
                  </h3>
                  <span className={getStatusBadgeClass(opportunity.status)}>
                    {opportunity.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {opportunity.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <p className="text-muted-foreground text-sm">
                  {opportunity.applicants} postulantes
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate(`/dashboard/opportunities/${opportunity.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Link className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpportunitiesPage;