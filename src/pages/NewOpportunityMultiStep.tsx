import { useState, useRef, useEffect } from 'react';
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
  contractType: string;
  skills: string[];
  tools: string[];
  contractorsCount: number;
  preferredTimezone: string;
  preferredLanguages: string[];
  
  // Step 2
  paymentMethod: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'one-time';
  
  // Budget fields
  showBudgetRange: boolean;
  budget: string;
  hourlyMinRate: string;
  hourlyMaxRate: string;
  weeklyMinBudget: string;
  weeklyMaxBudget: string;
  biweeklyMinBudget: string;
  biweeklyMaxBudget: string;
  monthlyMinBudget: string;
  monthlyMaxBudget: string;
  
  // Commission fields
  showCommissionRange: boolean;
  commissionPercentage: string;
  commissionMin: string;
  commissionMax: string;
  
  maxHoursPerWeek: number;
  maxHoursPerMonth: number;
  
  // Step 3 - Aplicación
  applicationInstructions: string;
  isExternalApplication: boolean;
  externalApplicationUrl: string;
  
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
  
  // Estado para rastrear si ya existe un borrador (previene duplicados)
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [isInitializingDraft, setIsInitializingDraft] = useState(false);
  // Ref para prevenir doble-clic
  const isSubmittingRef = useRef(false);
  const draftInitializedRef = useRef(false);

  // Debug: Log company info
  console.log('🏢 NewOpportunityMultiStep - activeCompany:', activeCompany);
  console.log('🏢 NewOpportunityMultiStep - opportunityId:', opportunityId);

  // Función para generar un enlace único de invitación
  const generateInvitationLink = (opportunityId: string) => {
    return `${window.location.origin}/opportunity/invite/${opportunityId}`;
  };

  // DRAFT-FIRST: Crear borrador vacío inmediatamente al cargar
  useEffect(() => {
    const initDraft = async () => {
      // Solo crear si no hay ID, hay empresa activa, y no se está inicializando ya
      if (opportunityId || !activeCompany || draftInitializedRef.current || isInitializingDraft) {
        return;
      }

      draftInitializedRef.current = true;
      setIsInitializingDraft(true);

      try {
        console.log('📝 Creating initial draft for company:', activeCompany.id);
        
        const { data, error } = await supabase
          .from('opportunities')
          .insert({
            company_id: activeCompany.id,
            title: '',
            description: '',
            category: 'General',
            type: 'Tiempo Completo',
            status: 'draft',
            is_active: false
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating initial draft:', error);
          return;
        }

        if (data) {
          console.log('✅ Draft initialized with ID:', data.id);
          setOpportunityId(data.id);
        }
      } catch (error) {
        console.error('Error in initDraft:', error);
      } finally {
        setIsInitializingDraft(false);
      }
    };

    initDraft();
  }, [activeCompany, opportunityId, isInitializingDraft]);

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

  const handleSubmit = async (formData: MultiStepFormData): Promise<string | null> => {
    // Prevenir doble-clic y envíos múltiples
    if (isSubmittingRef.current || loading) {
      console.log('⚠️ Submission already in progress, ignoring...');
      return opportunityId;
    }

    // DRAFT-FIRST: Siempre debe existir un opportunityId
    if (!opportunityId) {
      console.error('❌ No opportunityId found - draft should have been created on mount');
      toast.error('Error: El borrador no se inicializó correctamente. Recarga la página.');
      return null;
    }
    
    isSubmittingRef.current = true;
    setLoading(true);
    
    try {
      // Convertir los datos del formulario multi-paso al formato de base de datos
      let salaryMin, salaryMax;
      
      switch (formData.paymentMethod) {
        case 'hourly':
          if (formData.showBudgetRange) {
            salaryMin = formData.hourlyMinRate ? parseInt(formData.hourlyMinRate) : null;
            salaryMax = formData.hourlyMaxRate ? parseInt(formData.hourlyMaxRate) : null;
          } else {
            salaryMin = formData.hourlyMinRate ? parseInt(formData.hourlyMinRate) : null;
            salaryMax = null;
          }
          break;
        case 'weekly':
          if (formData.showBudgetRange) {
            salaryMin = formData.weeklyMinBudget ? parseInt(formData.weeklyMinBudget) : null;
            salaryMax = formData.weeklyMaxBudget ? parseInt(formData.weeklyMaxBudget) : null;
          } else {
            salaryMin = formData.weeklyMinBudget ? parseInt(formData.weeklyMinBudget) : null;
            salaryMax = null;
          }
          break;
        case 'biweekly':
          if (formData.showBudgetRange) {
            salaryMin = formData.biweeklyMinBudget ? parseInt(formData.biweeklyMinBudget) : null;
            salaryMax = formData.biweeklyMaxBudget ? parseInt(formData.biweeklyMaxBudget) : null;
          } else {
            salaryMin = formData.biweeklyMinBudget ? parseInt(formData.biweeklyMinBudget) : null;
            salaryMax = null;
          }
          break;
        case 'monthly':
          if (formData.showBudgetRange) {
            salaryMin = formData.monthlyMinBudget ? parseInt(formData.monthlyMinBudget) : null;
            salaryMax = formData.monthlyMaxBudget ? parseInt(formData.monthlyMaxBudget) : null;
          } else {
            salaryMin = formData.monthlyMinBudget ? parseInt(formData.monthlyMinBudget) : null;
            salaryMax = null;
          }
          break;
        case 'one-time':
          if (formData.showBudgetRange) {
            salaryMin = formData.budget ? parseInt(formData.budget) : null;
            salaryMax = formData.monthlyMaxBudget ? parseInt(formData.monthlyMaxBudget) : null;
          } else {
            salaryMin = formData.budget ? parseInt(formData.budget) : null;
            salaryMax = null;
          }
          break;
      }

      const selectedCategory: string = (formData as any).category || 'General';

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

      const opportunityData = {
        title: formData.title,
        description: formData.description,
        requirements: requirements.trim(),
        category: selectedCategory,
        type: formData.contractType || 'Tiempo Completo',
        location: formData.preferredTimezone || 'Remoto',
        salary_min: salaryMin,
        salary_max: salaryMax,
        skills: formData.skills,
        // Campos adicionales
        contract_type: formData.contractType || null,
        duration_type: (formData as any).durationType || 'indefinite',
        duration_value: (formData as any).durationType === 'fixed' ? ((formData as any).durationValue || null) : null,
        duration_unit: (formData as any).durationType === 'fixed' ? ((formData as any).durationUnit || 'months') : null,
        experience_levels: (formData as any).experienceLevels || [],
        timezone_preference: formData.preferredTimezone || null,
        deadline_date: (formData as any).deadlineDate ? (formData as any).deadlineDate.toISOString().split('T')[0] : null,
        payment_type: formData.paymentMethod || 'monthly',
        commission_percentage: formData.commissionPercentage ? parseInt(formData.commissionPercentage) : null,
        salary_is_public: (formData as any).salaryIsPublic !== false,
        is_academy_exclusive: (formData as any).isAcademyExclusive || false,
        company_id: activeCompany.id,
        status: formData.publishToFeed ? 'active' : ((formData as any).status === 'draft' ? 'draft' : 'active') as 'active',
        is_public: formData.publishToFeed === true,
        application_instructions: formData.applicationInstructions,
        is_external_application: formData.isExternalApplication,
        external_application_url: formData.externalApplicationUrl || null,
      };

      // DRAFT-FIRST: Siempre UPDATE, nunca INSERT
      console.log('📝 Updating opportunity:', opportunityId);
      const { error } = await supabase
        .from('opportunities')
        .update(opportunityData)
        .eq('id', opportunityId);

      if (error) {
        console.error('Error updating opportunity:', error);
        throw error;
      }

      // Check if this is a draft save (only when explicitly saving as draft, not when publishing)
      const isDraft = (formData as any).status === 'draft' && !formData.publishToFeed;
      
      if (isDraft) {
        // No toast for auto-save drafts to avoid spam
        setLoading(false);
        isSubmittingRef.current = false;
        return opportunityId;
      }
      
      if (formData.publishToFeed) {
        toast.success('¡Oportunidad publicada exitosamente en el feed!');
        navigate('/business-dashboard/opportunities');
      } else {
        // Generar enlace de invitación para oportunidades privadas
        const inviteLink = generateInvitationLink(opportunityId);
        
        // Actualizar la oportunidad con el enlace de invitación
        await supabase
          .from('opportunities')
          .update({ invitation_link: inviteLink } as any)
          .eq('id', opportunityId);
        
        // Mostrar modal con enlace de invitación
        setInvitationLink(inviteLink);
        setOpportunityTitle(formData.title);
        setShowInvitationModal(true);
        toast.success('¡Oportunidad guardada como invitación privada!');
      }
      
      return opportunityId;
      
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      toast.error(`Error al publicar la oportunidad: ${error.message || 'Error desconocido'}`);
      return null;
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const initialData = {
    title: '',
    description: activeCompany?.description || '',
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
          opportunityId={opportunityId}
          onOpportunityIdChange={setOpportunityId}
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
