import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth, isBusinessRole } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const NewOpportunity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, userRole } = useSupabaseAuth();
  const { activeCompany, canCreateOpportunities } = useCompany();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  // Cargar datos de la oportunidad si estamos editando
  useEffect(() => {
    const loadOpportunity = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setFormData({
          title: data.title || "",
          description: data.description || "",
          requirements: data.requirements || "",
          salaryMin: data.salary_min?.toString() || "",
          salaryMax: data.salary_max?.toString() || "",
          location: data.location || "",
          type: data.type || "full-time",
          category: data.category || "",
          currency: data.currency || "MXN"
        });
        setIsEditing(true);
      } catch (error) {
        console.error('Error loading opportunity:', error);
        toast.error('Error al cargar la oportunidad');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOpportunity();
    }
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user || !isBusinessRole(userRole) || !activeCompany || !canCreateOpportunities()) {
      toast.error('No tienes permisos para crear oportunidades en esta empresa');
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error('Título y descripción son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const opportunityData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || null,
        location: formData.location || null,
        type: formData.type,
        category: formData.category,
        salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        currency: formData.currency,
      };

      let error;
      if (isEditing && id) {
        // Actualizar oportunidad existente
        const { error: updateError } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', id);
        error = updateError;
      } else {
        // Crear nueva oportunidad
        const { error: insertError } = await supabase
          .from('opportunities')
          .insert({
            ...opportunityData,
            company_id: activeCompany.id,
          });
        error = insertError;
      }

      if (error) throw error;

      toast.success(isEditing ? 'Oportunidad actualizada exitosamente' : 'Oportunidad publicada exitosamente');
      navigate('/business-dashboard/opportunities');
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error(isEditing ? 'Error al actualizar la oportunidad' : 'Error al publicar la oportunidad');
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
          onClick={() => navigate('/business-dashboard/opportunities')}
          className="flex items-center text-foreground hover:text-muted-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a oportunidades
        </button>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? 'Editar Oportunidad' : 'Publicar Nueva Oportunidad'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing 
            ? 'Modifica la información de tu oportunidad laboral'
            : 'Completa la información para publicar tu oportunidad laboral'
          }
        </p>
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
                onClick={() => navigate('/business-dashboard/opportunities')}
              >
                Cancelar
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className="font-semibold"
              >
                {isLoading ? (isEditing ? 'Actualizando...' : 'Publicando...') : (isEditing ? 'Actualizar Oportunidad' : 'Publicar Oportunidad')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOpportunity;