import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const NewOpportunity = () => {
  const navigate = useNavigate();
  const { user, company, userRole } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
    location: "",
    type: "full-time",
    category: "",
    currency: "MXN"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user || userRole !== 'business' || !company) {
      toast.error('Solo los usuarios de empresa pueden crear oportunidades');
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error('Título y descripción son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .insert({
          company_id: company.id,
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements || null,
          location: formData.location || null,
          type: formData.type,
          category: formData.category,
          salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          currency: formData.currency,
        });

      if (error) throw error;

      toast.success('Oportunidad publicada exitosamente');
      navigate('/dashboard/opportunities');
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Error al publicar la oportunidad');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.category;

  const jobCategories = [
    { value: 'Ventas', label: 'Ventas' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operaciones', label: 'Operaciones' },
    { value: 'Fulfillment', label: 'Fulfillment' },
    { value: 'Desarrollo', label: 'Desarrollo' },
    { value: 'Diseño', label: 'Diseño' },
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Por Contrato' },
    { value: 'freelance', label: 'Freelance' },
  ];

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
                  Categoría *
                </label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Trabajo
                </label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salario Mínimo
                </label>
                <Input
                  type="number"
                  placeholder="20000"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salario Máximo
                </label>
                <Input
                  type="number"
                  placeholder="35000"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Moneda
                </label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ubicación
              </label>
              <Input
                type="text"
                placeholder="Ej: Remoto, Ciudad de México, Híbrido"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
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
                disabled={!isFormValid || isLoading}
                className="font-semibold"
              >
                {isLoading ? 'Publicando...' : 'Publicar Oportunidad'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOpportunity;