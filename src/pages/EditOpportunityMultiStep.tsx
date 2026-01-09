import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import MultiStepOpportunityForm from '@/components/opportunity/MultiStepOpportunityForm';
import { InvitationLinkModal } from '@/components/opportunity/PublishJobModal';
import { Loader2 } from 'lucide-react';

interface MultiStepFormData {
  // Step 1
  category: string;
  title: string;
  description: string;
  contractType: string;
  skills: string[];
  tools: string[];
  experienceLevels: string[];
  locationType: string;
  location: string;
  contractorsCount: number;
  preferredTimezone: string;
  preferredLanguages: string[];
  deadlineDate: Date | null;
  isAcademyExclusive?: boolean;
  
  // Step 2
  durationType: 'indefinite' | 'fixed';
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months';
  paymentType: 'fixed' | 'commission' | 'fixed_plus_commission';
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
  
  salaryIsPublic: boolean;
  maxHoursPerWeek: number;
  maxHoursPerMonth: number;
  
  // Step 3 - Aplicación
  applicationInstructions: string;
  isExternalApplication: boolean;
  externalApplicationUrl: string;
  
  // Publicación
  publishToFeed?: boolean;
}

const EditOpportunityMultiStep = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, userRole } = useSupabaseAuth();
  const { activeCompany, canCreateOpportunities } = useCompany();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [initialData, setInitialData] = useState<Partial<MultiStepFormData> | null>(null);

  // Función para generar un enlace único de invitación
  const generateInvitationLink = (opportunityId: string) => {
    return `${window.location.origin}/opportunity/invite/${opportunityId}`;
  };

  // Load opportunity data
  useEffect(() => {
    const loadOpportunity = async () => {
      if (!id) {
        navigate('/business-dashboard/opportunities');
        return;
      }
      
      setInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          toast.error('Oportunidad no encontrada');
          navigate('/business-dashboard/opportunities');
          return;
        }

        // Map database data to form data
        const mappedData: Partial<MultiStepFormData> = {
          // Step 1
          category: data.category || '',
          title: data.title || '',
          description: data.description || '',
          contractType: data.contract_type || data.type || '',
          skills: data.skills || [],
          tools: [],
          experienceLevels: data.experience_levels || [],
          locationType: mapLocationType(data.location),
          location: data.location || '',
          contractorsCount: 1,
          preferredTimezone: data.timezone_preference || '',
          preferredLanguages: [],
          deadlineDate: data.deadline_date ? new Date(data.deadline_date) : null,
          isAcademyExclusive: data.is_academy_exclusive || false,
          
          // Step 2
          durationType: (data.duration_type as 'indefinite' | 'fixed') || 'indefinite',
          durationValue: data.duration_value || 1,
          durationUnit: (data.duration_unit as 'days' | 'weeks' | 'months') || 'months',
          paymentType: mapPaymentType(data.payment_type),
          paymentMethod: mapPaymentMethod(data.payment_type),
          
          // Budget fields - map based on payment method
          showBudgetRange: !!(data.salary_min && data.salary_max),
          budget: data.salary_min?.toString() || '',
          hourlyMinRate: data.payment_type === 'hourly' ? (data.salary_min?.toString() || '') : '',
          hourlyMaxRate: data.payment_type === 'hourly' ? (data.salary_max?.toString() || '') : '',
          weeklyMinBudget: data.payment_type === 'weekly' ? (data.salary_min?.toString() || '') : '',
          weeklyMaxBudget: data.payment_type === 'weekly' ? (data.salary_max?.toString() || '') : '',
          biweeklyMinBudget: data.payment_type === 'biweekly' ? (data.salary_min?.toString() || '') : '',
          biweeklyMaxBudget: data.payment_type === 'biweekly' ? (data.salary_max?.toString() || '') : '',
          monthlyMinBudget: (!data.payment_type || data.payment_type === 'monthly' || data.payment_type === 'fixed') ? (data.salary_min?.toString() || '') : '',
          monthlyMaxBudget: (!data.payment_type || data.payment_type === 'monthly' || data.payment_type === 'fixed') ? (data.salary_max?.toString() || '') : '',
          
          // Commission fields
          showCommissionRange: false,
          commissionPercentage: data.commission_percentage?.toString() || '',
          commissionMin: '',
          commissionMax: '',
          
          salaryIsPublic: data.salary_is_public !== false,
          maxHoursPerWeek: 0,
          maxHoursPerMonth: 0,
          
          // Step 3
          applicationInstructions: data.application_instructions || '',
          isExternalApplication: data.is_external_application || false,
          externalApplicationUrl: data.external_application_url || '',
        };

        setInitialData(mappedData);
      } catch (error) {
        console.error('Error loading opportunity:', error);
        toast.error('Error al cargar la oportunidad');
        navigate('/business-dashboard/opportunities');
      } finally {
        setInitialLoading(false);
      }
    };

    loadOpportunity();
  }, [id, navigate]);

  // Helper functions to map database values to form values
  const mapLocationType = (location: string | null): string => {
    if (!location) return 'remote';
    const lower = location.toLowerCase();
    if (lower.includes('remoto') || lower.includes('remote')) return 'remote';
    if (lower.includes('híbrido') || lower.includes('hybrid')) return 'hybrid';
    if (lower.includes('presencial') || lower.includes('onsite')) return 'onsite';
    return 'remote';
  };

  const mapPaymentType = (paymentType: string | null): 'fixed' | 'commission' | 'fixed_plus_commission' => {
    if (!paymentType) return 'fixed';
    if (paymentType.includes('commission') && paymentType.includes('fixed')) return 'fixed_plus_commission';
    if (paymentType === 'commission') return 'commission';
    return 'fixed';
  };

  const mapPaymentMethod = (paymentType: string | null): 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'one-time' => {
    if (!paymentType) return 'monthly';
    if (paymentType === 'hourly') return 'hourly';
    if (paymentType === 'weekly') return 'weekly';
    if (paymentType === 'biweekly') return 'biweekly';
    if (paymentType === 'one-time') return 'one-time';
    return 'monthly';
  };

  // Verificar permisos
  if (!user || !isBusinessRole(userRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">Solo las empresas pueden editar oportunidades.</p>
        </div>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Empresa Requerida</h2>
          <p className="text-gray-600 mb-4">Necesitas tener una empresa activa para editar oportunidades.</p>
        </div>
      </div>
    );
  }

  if (!canCreateOpportunities) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin Permisos</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para editar oportunidades en esta empresa.</p>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando oportunidad...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (formData: MultiStepFormData) => {
    if (!id) return;
    
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

      const selectedCategory: string = (formData.skills && formData.skills.length > 0) ? (formData.skills[0] ?? 'General') : 'General';

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
        is_academy_exclusive: formData.isAcademyExclusive || false,
        status: formData.publishToFeed ? 'active' : ((formData as any).status === 'draft' ? 'draft' : 'active') as 'active',
        application_instructions: formData.applicationInstructions,
        is_external_application: formData.isExternalApplication,
        external_application_url: formData.externalApplicationUrl || null,
      };

      const { error } = await supabase
        .from('opportunities')
        .update(opportunityData)
        .eq('id', id);

      if (error) {
        console.error('Error updating opportunity:', error);
        throw error;
      }

      // Check if this is a draft save
      const isDraft = (formData as any).status === 'draft' && !formData.publishToFeed;
      
      if (isDraft) {
        toast.success('¡Borrador guardado exitosamente!');
        return;
      }
      
      if (formData.publishToFeed) {
        toast.success('¡Oportunidad actualizada y publicada exitosamente!');
        navigate('/business-dashboard/opportunities');
      } else {
        // Generar enlace de invitación para oportunidades privadas
        const inviteLink = generateInvitationLink(id);
        
        // Actualizar la oportunidad con el enlace de invitación
        await supabase
          .from('opportunities')
          .update({ invitation_link: inviteLink } as any)
          .eq('id', id);
        
        // Mostrar modal con enlace de invitación
        setInvitationLink(inviteLink);
        setOpportunityTitle(formData.title);
        setShowInvitationModal(true);
        toast.success('¡Oportunidad actualizada como invitación privada!');
      }
      
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      toast.error(`Error al actualizar la oportunidad: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationModalClose = () => {
    setShowInvitationModal(false);
    navigate('/business-dashboard/opportunities');
  };

  if (!initialData) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen py-8" style={{ backgroundColor: '#eff6ff' }}>
        <div className="max-w-4xl mx-auto px-6">
          <MultiStepOpportunityForm 
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={loading}
            company={activeCompany}
            isEditing={true}
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

export default EditOpportunityMultiStep;
