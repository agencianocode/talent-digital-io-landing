import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OpportunityApplicantsNew = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  
  const [opportunity, setOpportunity] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!opportunityId) {
      setError("ID de oportunidad no encontrado");
      setIsLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: opportunityData, error: opportunityError } = await supabase
          .from("opportunities")
          .select("id, title, status")
          .eq("id", opportunityId)
          .single();
          
        if (opportunityError) {
          setError("Oportunidad no encontrada");
          return;
        }
        
        setOpportunity(opportunityData);
        
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select("id, user_id, status, created_at")
          .eq("opportunity_id", opportunityId)
          .order("created_at", { ascending: false });
          
        if (applicationsError) {
          setError("Error al cargar aplicaciones");
        } else {
          setApplications(applicationsData || []);
        }
        
      } catch (error) {
        setError("Error inesperado");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [opportunityId]);
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "reviewed": return "Revisado";
      case "accepted": return "Aceptado";
      case "rejected": return "Rechazado";
      default: return status;
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicaciones...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate("/business-dashboard/opportunities")}>
            Volver a Oportunidades
          </Button>
        </div>
      </div>
    );
  }
  
  if (!opportunity) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oportunidad no encontrada</h1>
          <p className="text-gray-600 mb-6">La oportunidad solicitada no existe.</p>
          <Button onClick={() => navigate("/business-dashboard/opportunities")}>
            Volver a Oportunidades
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/business-dashboard/opportunities")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Postulantes para: {opportunity.title}</h1>
          <p className="text-gray-600">ID: {opportunity.id}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 mb-4">
                <Briefcase className="w-12 h-12 mx-auto mb-2" />
                <p>No hay aplicaciones para esta oportunidad</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Usuario ID: {application.user_id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Aplicación ID: {application.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Fecha: {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {getStatusText(application.status)}
                    </Badge>
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

export default OpportunityApplicantsNew;
