import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

const opportunities = [
  {
    id: 1,
    title: "Closer de ventas B2B",
    status: "ACTIVA",
    tags: ["Ventas", "Closer de ventas", "Vendedor remoto"],
    applicants: 0,
    description: "Buscamos un closer de ventas especializado en B2B para unirse a nuestro equipo. El candidato ideal tendrá experiencia en ventas consultivas y manejo de CRM."
  },
  {
    id: 2, 
    title: "Media Buyer para Agencia de Diseño",
    status: "ACTIVA",
    tags: ["Ads", "Media Buyer", "Marketing"],
    applicants: 0,
    description: "Agencia de diseño busca Media Buyer experimentado para manejar campañas publicitarias en Facebook, Google y otras plataformas digitales."
  },
  {
    id: 3,
    title: "Closer de ventas B2B", 
    status: "CERRADA",
    tags: ["Ventas", "Closer de ventas", "Vendedor remoto"],
    applicants: 0,
    description: "Posición cerrada - Closer de ventas B2B con experiencia en tecnología."
  }
];

const OpportunityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("preview");
  
  const opportunity = opportunities.find(opp => opp.id === parseInt(id || "1"));

  if (!opportunity) {
    return <div>Oportunidad no encontrada</div>;
  }

  const getStatusBadgeClass = (status: string) => {
    return status === "ACTIVA" 
      ? "bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
      : "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium";
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/opportunities')}
          className="flex items-center text-foreground hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a oportunidades publicadas
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-foreground">
            {opportunity.title}
          </h1>
          <span className={getStatusBadgeClass(opportunity.status)}>
            {opportunity.status}
          </span>
        </div>
        
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "preview"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Vista Previa
          </button>
          <button
            onClick={() => setActiveTab("applicants")}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "applicants"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Postulantes
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "preview" && (
        <div className="bg-card p-8 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {opportunity.title}
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {opportunity.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-secondary text-foreground px-3 py-1 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="prose max-w-none">
            <p className="text-foreground leading-relaxed">
              {opportunity.description}
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-muted-foreground text-sm">
              {opportunity.applicants} personas han aplicado a esta oportunidad
            </p>
          </div>
        </div>
      )}

      {activeTab === "applicants" && (
        <div className="bg-card p-8 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Postulantes
          </h2>
          <p className="text-muted-foreground text-center py-12">
            Aún no hay postulantes para esta oportunidad
          </p>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetail;