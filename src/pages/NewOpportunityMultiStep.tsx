import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import MultiStepOpportunityForm from '@/components/opportunity/MultiStepOpportunityForm';
import { InvitationLinkModal } from '@/components/opportunity/PublishJobModal';

interface MultiStepFormData {
  // Step 1
  title: string;
  description: string;
  skills: string[];
  tools: string[];
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
  // Publicación
  publishToFeed?: boolean;
}

const NewOpportunityMultiStep = () => {
  const navigate = useNavigate();
  const { user, userRole } = useSupabaseAuth();
  const { activeCompany, canCreateOpportunities } = useCompany();
  const [loading, setLoading] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');

  // Función para generar un enlace único de invitación
  const generateInvitationLink = (opportunityId: string) => {
    return `${window.location.origin}/opportunity/invite/${opportunityId}`;
  };

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
      let salaryMin, salaryMax;
      
      if (formData.projectType === 'one-time') {
        salaryMin = formData.monthlyMinBudget ? parseInt(formData.monthlyMinBudget) : null;
        salaryMax = formData.monthlyMaxBudget ? parseInt(formData.monthlyMaxBudget) : null;
        // salaryPeriod = 'project'; // Se usará cuando se agregue el campo a la DB
      } else {
        switch (formData.paymentMethod) {
          case 'hourly':
            salaryMin = formData.hourlyMinRate ? parseInt(formData.hourlyMinRate) : null;
            salaryMax = formData.hourlyMaxRate ? parseInt(formData.hourlyMaxRate) : null;
            // salaryPeriod = 'hourly'; // Se usará cuando se agregue el campo a la DB
            break;
          case 'weekly':
            salaryMin = formData.weeklyMinBudget ? parseInt(formData.weeklyMinBudget) : null;
            salaryMax = formData.weeklyMaxBudget ? parseInt(formData.weeklyMaxBudget) : null;
            // salaryPeriod = 'weekly'; // Se usará cuando se agregue el campo a la DB
            break;
          case 'monthly':
            salaryMin = formData.monthlyMinBudget ? parseInt(formData.monthlyMinBudget) : null;
            salaryMax = formData.monthlyMaxBudget ? parseInt(formData.monthlyMaxBudget) : null;
            // salaryPeriod = 'monthly'; // Se usará cuando se agregue el campo a la DB
            break;
        }
      }

      const selectedCategory: string = (formData.skills && formData.skills.length > 0) ? (formData.skills[0] ?? 'General') : 'General';
      
      // Extraer el país de la empresa para la restricción
      const companyCountry = activeCompany.location ? 
        activeCompany.location.split(',').map(part => part.trim()).pop() : null;

      // Construir descripción de requisitos más detallada
      let requirements = '';
      if (formData.skills?.length > 0) {
        requirements += `Habilidades: ${formData.skills.join(', ')}\n`;
      }
      if (formData.tools?.length > 0) {
        requirements += `Herramientas: ${formData.tools.join(', ')}\n`;
      }
      requirements += `Contratistas requeridos: ${formData.contractorsCount}\n`;
      if (formData.preferredTimezone) {
        requirements += `Zona horaria preferida: ${formData.preferredTimezone}\n`;
      }
      if (formData.preferredLanguages?.length > 0) {
        requirements += `Idiomas preferidos: ${formData.preferredLanguages.join(', ')}\n`;
      }
      if (formData.usOnlyApplicants && companyCountry) {
        requirements += `Restricción de país: Solo ${companyCountry}\n`;
      }

      const opportunityData = {
        title: formData.title,
        description: formData.description,
        requirements: requirements.trim(),
        category: selectedCategory,
        type: formData.projectType === 'ongoing' ? 'Trabajo Continuo' : 'Proyecto Una Vez',
        location: formData.preferredTimezone || 'Remoto',
        salary_min: salaryMin,
        salary_max: salaryMax,
        // Campos existentes en el esquema actual
        skills: formData.skills,
        // Campos que se agregarán con las migraciones:
        // contract_type: formData.projectType === 'ongoing' ? 'ongoing' : 'project',
        // duration_type: formData.noEndDate ? 'indefinite' : 'fixed',
        // duration_value: formData.noEndDate ? null : formData.jobDuration,
        // duration_unit: formData.jobDurationUnit || 'months',
        // experience_levels: ['mid'],
        // timezone_preference: formData.preferredTimezone,
        // deadline_date: null,
        // payment_type: formData.paymentMethod === 'hourly' ? 'hourly' : 'fixed',
        // commission_percentage: null,
        // salary_is_public: true,
        // is_academy_exclusive: false,
        company_id: activeCompany.id,
        status: formData.publishToFeed ? 'active' : ((formData as any).status === 'draft' ? 'draft' : 'active') as 'active'
        // Campos de restricción de país se agregarán cuando se ejecute la migración
        // country_restriction_enabled: formData.usOnlyApplicants,
        // allowed_country: formData.usOnlyApplicants ? companyCountry : null
      };

      const { data: insertedData, error } = await supabase
        .from('opportunities')
        .insert([opportunityData])
        .select()
        .single();

      if (error) {
        console.error('Error creating opportunity:', error);
        throw error;
      }

      // Check if this is a draft save (only when explicitly saving as draft, not when publishing)
      const isDraft = (formData as any).status === 'draft' && !formData.publishToFeed;
      
      if (isDraft) {
        toast.success('¡Borrador guardado exitosamente!');
        // No redirect for drafts - let user continue editing
        return;
      }
      
      if (formData.publishToFeed) {
        toast.success('¡Oportunidad publicada exitosamente en el feed!');
        navigate('/business-dashboard/opportunities');
      } else {
        // Generar enlace de invitación para oportunidades privadas
        if (insertedData) {
          const inviteLink = generateInvitationLink(insertedData.id);
          
          // Actualizar la oportunidad con el enlace de invitación
          await supabase
            .from('opportunities')
            .update({ invitation_link: inviteLink } as any)
            .eq('id', insertedData.id);
          
          // Mostrar modal con enlace de invitación
          setInvitationLink(inviteLink);
          setOpportunityTitle(formData.title);
          setShowInvitationModal(true);
          toast.success('¡Oportunidad guardada como invitación privada!');
        }
      }
      
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

  const handleInvitationModalClose = () => {
    setShowInvitationModal(false);
    navigate('/business-dashboard/opportunities');
  };

  return (
    <>
      <div className="min-h-screen py-8" style={{ backgroundColor: '#eff6ff' }}>
        <div className="max-w-4xl mx-auto px-6">
        <MultiStepOpportunityForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={loading}
          company={activeCompany}
        />
        </div>
      </div>
      
      {/* Modal de enlace de invitación */}
      <InvitationLinkModal
        isOpen={showInvitationModal}
        onClose={handleInvitationModalClose}
        invitationLink={invitationLink}
        opportunityTitle={opportunityTitle}
      />
    </>
  );
};

export default NewOpportunityMultiStep;
