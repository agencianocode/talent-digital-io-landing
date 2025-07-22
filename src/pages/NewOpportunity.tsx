import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const NewOpportunity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    type: "",
    tags: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Handle opportunity creation
    console.log("Creating opportunity:", formData);
    navigate('/dashboard/opportunities');
  };

  const isFormValid = formData.title && formData.description;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/opportunities')}
          className="flex items-center text-foreground hover:text-muted-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a oportunidades
        </button>
        <h1 className="text-3xl font-bold text-foreground">
          Publicar Nueva Oportunidad
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-card p-8 rounded-lg border border-border">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Título de la oportunidad *
              </label>
              <Input
                type="text"
                placeholder="Ej: Closer de ventas B2B"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción *
              </label>
              <Textarea
                placeholder="Describe la oportunidad, responsabilidades y lo que buscas..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Requisitos
              </label>
              <Textarea
                placeholder="Experiencia requerida, habilidades, certificaciones..."
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salario/Comisión
                </label>
                <Input
                  type="text"
                  placeholder="Ej: $2000 + comisiones"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ubicación
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Remoto, México"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (separados por comas)
              </label>
              <Input
                type="text"
                placeholder="Ej: Ventas, Closer, B2B, Remoto"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard/opportunities')}
              >
                Cancelar
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="font-semibold"
              >
                Publicar Oportunidad
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOpportunity;