import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import MultiStepOpportunityForm from '@/components/opportunity/MultiStepOpportunityForm';

interface MultiStepFormData {
  // Step 1
  title: string;
  companyName: string;
  companyDescription: string;
  
  // Step 2
  pricePoints: Array<{ id: string; programName: string; price: string }>;
  socialLinks: Array<{ id: string; url: string }>;
  
  // Step 3
  roleType: string;
  minimumOTE: string;
  maximumOTE: string;
  timezone: string;
  workingHoursTBD: boolean;
  startTime: string;
  endTime: string;
  requirements: string[];
  applicationInstructions: string;
}

const NewOpportunityMultiStep = () => {
  const navigate = useNavigate();
  const { user, userRole } = useSupabaseAuth();
  const { activeCompany, canCreateOpportunities } = useCompany();
  const [loading, setLoading] = useState(false);

  // Verificar permisos
  if (!user || !isBusinessRole(userRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">Solo las empresas pueden crear oportunidades.</p>
        </div>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Empresa Requerida</h2>
          <p className="text-gray-600 mb-4">Necesitas tener una empresa activa para crear oportunidades.</p>
        </div>
      </div>
    );
  }

  if (!canCreateOpportunities) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin Permisos</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para crear oportunidades en esta empresa.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (formData: MultiStepFormData) => {
    setLoading(true);
    
    try {
      // Convertir los datos del formulario multi-paso al formato de base de datos
      const opportunityData = {
        title: formData.title,
        description: `**Descripción de la empresa:**\n${formData.companyDescription}\n\n**Instrucciones de aplicación:**\n${formData.applicationInstructions}`,
        requirements: formData.requirements.join('\n• '),
        category: formData.roleType,
        type: 'Trabajo Remoto',
        location: formData.timezone,
        salary_min: formData.minimumOTE ? parseInt(formData.minimumOTE) : null,
        salary_max: formData.maximumOTE ? parseInt(formData.maximumOTE) : null,
        contract_type: 'full_time',
        duration_type: 'indefinite',
        duration_value: null,
        duration_unit: 'months',
        skills: [],
        experience_levels: ['mid'],
        location_type: 'remote',
        timezone_preference: formData.timezone,
        deadline_date: null,
        payment_type: 'fixed',
        commission_percentage: null,
        salary_period: 'annual',
        salary_is_public: true,
        is_academy_exclusive: false,
        company_id: activeCompany.id,
        status: 'active' as 'active'
      };

      const { error } = await supabase
        .from('opportunities')
        .insert([opportunityData]);

      if (error) {
        console.error('Error creating opportunity:', error);
        throw error;
      }

      toast.success('¡Oportunidad publicada exitosamente!');
      navigate('/business-dashboard/opportunities');
      
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      toast.error(`Error al publicar la oportunidad: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const initialData = {
    companyName: activeCompany.name,
    companyDescription: activeCompany.description || '',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <MultiStepOpportunityForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default NewOpportunityMultiStep;
