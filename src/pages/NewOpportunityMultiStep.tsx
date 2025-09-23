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
  description: string;
  skills: string;
  tools: string;
  contractorsCount: number;
  usOnlyApplicants: boolean;
  preferredTimezone: string;
  preferredLanguages: string[];
  
  // Step 2
  projectType: 'ongoing' | 'one-time';
  paymentMethod: 'hourly' | 'weekly' | 'monthly';
  hourlyMinRate: string;
  hourlyMaxRate: string;
  weeklyMinBudget: string;
  weeklyMaxBudget: string;
  monthlyMinBudget: string;
  monthlyMaxBudget: string;
  maxHoursPerWeek: number;
  maxHoursPerMonth: number;
  isMaxHoursOptional: boolean;
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
      let salaryMin, salaryMax, salaryPeriod;
      
      if (formData.projectType === 'one-time') {
        salaryMin = formData.monthlyMinBudget ? parseInt(formData.monthlyMinBudget) : null;
        salaryMax = formData.monthlyMaxBudget ? parseInt(formData.monthlyMaxBudget) : null;
        salaryPeriod = 'project';
      } else {
        switch (formData.paymentMethod) {
          case 'hourly':
            salaryMin = formData.hourlyMinRate ? parseInt(formData.hourlyMinRate) : null;
            salaryMax = formData.hourlyMaxRate ? parseInt(formData.hourlyMaxRate) : null;
            salaryPeriod = 'hourly';
            break;
          case 'weekly':
            salaryMin = formData.weeklyMinBudget ? parseInt(formData.weeklyMinBudget) : null;
            salaryMax = formData.weeklyMaxBudget ? parseInt(formData.weeklyMaxBudget) : null;
            salaryPeriod = 'weekly';
            break;
          case 'monthly':
            salaryMin = formData.monthlyMinBudget ? parseInt(formData.monthlyMinBudget) : null;
            salaryMax = formData.monthlyMaxBudget ? parseInt(formData.monthlyMaxBudget) : null;
            salaryPeriod = 'monthly';
            break;
        }
      }

      const opportunityData = {
        title: formData.title,
        description: formData.description,
        requirements: `Habilidades: ${formData.skills}\nHerramientas: ${formData.tools}\nContratistas requeridos: ${formData.contractorsCount}`,
        category: formData.skills || 'General',
        type: formData.projectType === 'ongoing' ? 'Trabajo Continuo' : 'Proyecto Una Vez',
        location: formData.preferredTimezone || 'Remoto',
        salary_min: salaryMin,
        salary_max: salaryMax,
        contract_type: formData.projectType === 'ongoing' ? 'ongoing' : 'project',
        duration_type: formData.projectType === 'ongoing' ? 'indefinite' : 'fixed',
        duration_value: null,
        duration_unit: 'months',
        skills: formData.skills ? [formData.skills] : [],
        experience_levels: ['mid'],
        location_type: 'remote',
        timezone_preference: formData.preferredTimezone,
        deadline_date: null,
        payment_type: formData.paymentMethod === 'hourly' ? 'hourly' : 'fixed',
        commission_percentage: null,
        salary_period: salaryPeriod,
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
    title: '',
    description: activeCompany.description || '',
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#eff6ff' }}>
      <div className="max-w-4xl mx-auto px-6">
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
