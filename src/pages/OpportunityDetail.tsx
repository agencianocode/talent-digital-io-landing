import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useOpportunities } from "@/contexts/OpportunitiesContext";
import ApplicantsList from "@/components/ApplicantsList";

const OpportunityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("preview");
  const { opportunities } = useOpportunities();
  
  const opportunity = opportunities.find(opp => opp.id === id);

  if (!opportunity) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Oportunidad no encontrada</h1>
          <Button onClick={() => navigate('/dashboard/opportunities')}>
            Volver a oportunidades
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
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
          <Badge variant={getStatusVariant(opportunity.status)}>
            {opportunity.status === 'active' ? 'ACTIVA' : 
             opportunity.status === 'paused' ? 'PAUSADA' : 'CERRADA'}
          </Badge>
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
            Postulantes ({opportunity.applicantsCount})
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
          
          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold mb-3">Descripción</h3>
            <p className="text-foreground leading-relaxed mb-4">
              {opportunity.description}
            </p>

            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Requisitos:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index} className="text-foreground">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-semibold mb-2">Ubicación:</h4>
                <p className="text-foreground">{opportunity.location}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Modalidad:</h4>
                <p className="text-foreground">
                  {opportunity.type === 'remote' ? 'Remoto' : 
                   opportunity.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
                </p>
              </div>

              {opportunity.salary && (
                <div>
                  <h4 className="font-semibold mb-2">Salario:</h4>
                  <p className="text-foreground">
                    {opportunity.salary.min.toLocaleString()} - {opportunity.salary.max.toLocaleString()} {opportunity.salary.currency}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Categoría:</h4>
                <p className="text-foreground">{opportunity.category}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-muted-foreground text-sm">
              {opportunity.applicantsCount} persona{opportunity.applicantsCount !== 1 ? 's han' : ' ha'} aplicado a esta oportunidad
            </p>
          </div>
        </div>
      )}

      {activeTab === "applicants" && (
        <div className="bg-card p-8 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Postulantes ({opportunity.applicantsCount})
          </h2>
          <ApplicantsList opportunityId={opportunity.id} />
        </div>
      )}
    </div>
  );
};

export default OpportunityDetail;