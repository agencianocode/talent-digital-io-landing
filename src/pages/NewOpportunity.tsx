import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X, ArrowLeft, Clock } from 'lucide-react';
import { OpportunityTemplates, JobTemplate } from '@/components/OpportunityTemplates';
import { toast } from 'sonner';
import { useAutoSave } from '@/hooks/useAutoSave';
import { 
  categoryTemplates, 
  contractTypes, 
  durationUnits, 
  salaryPeriods, 
  experienceLevelOptions,
  timezones 
} from '@/lib/opportunityTemplates';

interface OpportunityData {
  title: string;
  description: string;
  requirements: string;
  salary_min: string;
  salary_max: string;
  location: string;
  category: string;
  type: string;
  status: string;
  contract_type: string;
  duration_type: string;
  duration_value: string;
  duration_unit: string;
  skills: string[];
  experience_levels: string[];
  timezone_preference: string;
  deadline_date: Date | null;
  payment_type: string;
  commission_percentage: string;
  salary_period: string;
  salary_is_public: boolean;
  is_academy_exclusive: boolean;
  auto_save_data?: any;
}

const NewOpportunity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, userRole } = useSupabaseAuth();
  const { activeCompany, canCreateOpportunities } = useCompany();
  
  const [formData, setFormData] = useState<OpportunityData>({
    title: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    location: '',
    category: '',
    type: '',
    status: 'draft',
    contract_type: '',
    duration_type: 'indefinite',
    duration_value: '',
    duration_unit: 'months',
    skills: [],
    experience_levels: [],
    timezone_preference: '',
    deadline_date: null,
    payment_type: 'fixed',
    commission_percentage: '',
    salary_period: 'monthly',
    salary_is_public: true,
    is_academy_exclusive: false,
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const autoSaveToDatabase = useCallback(async (data: OpportunityData) => {
    if (!user || !isBusinessRole(userRole) || !activeCompany) return;
    
    try {
      const opportunityData = {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        category: data.category,
        type: data.type,
        location: data.location,
        salary_min: data.salary_min ? parseInt(data.salary_min) : null,
        salary_max: data.salary_max ? parseInt(data.salary_max) : null,
        contract_type: data.contract_type || null,
        duration_type: data.duration_type,
        duration_value: data.duration_value ? parseInt(data.duration_value) : null,
        duration_unit: data.duration_unit,
        skills: data.skills,
        experience_levels: data.experience_levels,
        timezone_preference: data.timezone_preference || null,
        deadline_date: data.deadline_date ? data.deadline_date.toISOString().split('T')[0] : null,
        payment_type: data.payment_type,
        commission_percentage: data.commission_percentage ? parseFloat(data.commission_percentage) : null,
        salary_is_public: data.salary_is_public,
        is_academy_exclusive: data.is_academy_exclusive,
        status: (data.status as 'draft' | 'active' | 'paused' | 'closed'),
        auto_saved_at: new Date().toISOString()
      };

      if (isEditing && id) {
        await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', id);
      } else {
        await supabase
          .from('opportunities')
          .insert({
            ...opportunityData,
            company_id: activeCompany.id,
          });
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
      throw error;
    }
  }, [user, userRole, activeCompany, isEditing, id]);

  useAutoSave({
    data: formData,
    onSave: autoSaveToDatabase,
    interval: 30000, // 30 segundos
    enabled: true,
    storageKey: `opportunity-draft-${id || 'new'}`
  });

  // Load opportunity data if editing
  useEffect(() => {
    const loadOpportunity = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        console.log('📥 Datos cargados desde BD:', data);

        // Mapeo correcto de categoría
        const categoryMap: Record<string, string> = {
          'Cierre de ventas': 'Ventas',
          'Ventas': 'Ventas',
          'Marketing': 'Marketing',
          'Atención al cliente': 'Atención al cliente',
          'Operaciones': 'Operaciones',
          'Creativo': 'Creativo',
          'Tecnología y Automatizaciones': 'Tecnología y Automatizaciones',
          'Soporte Profesional': 'Soporte Profesional',
        };

        // Mapeo correcto de modalidad (type)
        const typeMap: Record<string, string> = {
          'Trabajo Continuo': 'tiempo_completo',
          'Proyecto Una Vez': 'freelance',
          'Tiempo Completo': 'tiempo_completo',
          'Medio Tiempo': 'medio_tiempo',
          'Freelance': 'freelance',
          'Contrato': 'contrato',
          'Prácticas': 'prácticas',
        };

        // Mapeo correcto de tipo de contrato
        const contractMap: Record<string, string> = {
          'Full Time': 'Full Time',
          'Part Time': 'Part Time',
          'Freelance': 'Freelance',
          'Por Comisión': 'Por Comisión',
          'Fijo + Comisión': 'Fijo + Comisión',
        };

        const mappedCategory = categoryMap[data.category || ''] || data.category || '';
        const mappedType = typeMap[data.type || ''] || data.type || '';
        const mappedContract = contractMap[data.contract_type || ''] || data.contract_type || '';

        // Fecha límite
        const deadlineDate = data.deadline_date 
          ? new Date(data.deadline_date + 'T00:00:00') 
          : null;

        console.log('📋 Datos mapeados:', {
          category: mappedCategory,
          type: mappedType,
          contract_type: mappedContract,
          deadline_date: deadlineDate
        });

        setFormData({
          title: data.title || '',
          description: data.description || '',
          requirements: data.requirements || '',
          salary_min: data.salary_min?.toString() || '',
          salary_max: data.salary_max?.toString() || '',
          location: data.location || '',
          category: mappedCategory,
          type: mappedType,
          status: data.status || 'draft',
          contract_type: mappedContract,
          duration_type: data.duration_type || 'indefinite',
          duration_value: data.duration_value?.toString() || '',
          duration_unit: data.duration_unit || 'months',
          skills: data.skills || [],
          experience_levels: data.experience_levels || [],
          timezone_preference: data.timezone_preference || '',
          deadline_date: deadlineDate,
          payment_type: data.payment_type || 'fixed',
          commission_percentage: data.commission_percentage?.toString() || '',
          salary_period: 'monthly',
          salary_is_public: data.salary_is_public !== false,
          is_academy_exclusive: data.is_academy_exclusive || false,
        });
        setIsEditing(true);
      } catch (error) {
        console.error('Error loading opportunity:', error);
        toast.error('Error al cargar la oportunidad');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOpportunity();
    }
  }, [id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleTemplateSelect = (template: JobTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      requirements: template.requirements,
      skills: template.skills,
    }));
    toast.success(`Plantilla "${template.title}" aplicada`);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      handleInputChange('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    handleInputChange('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };

  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      handleInputChange('experience_levels', [...formData.experience_levels, level]);
    } else {
      handleInputChange('experience_levels', formData.experience_levels.filter(l => l !== level));
    }
  };

  // Función para manejar el cambio de categoría y aplicar plantillas
  const handleCategoryChange = (category: string) => {
    handleInputChange('category', category);
    
    // Aplicar plantilla automáticamente si existe
    const template = categoryTemplates[category];
    if (template) {
      setFormData(prev => ({
        ...prev,
        category: category,
        skills: template.defaultSkills, // Aplicar skills por defecto
        experience_levels: template.experienceLevels.slice(0, 2), // Aplicar primeros 2 niveles de experiencia
        requirements: template.suggestedRequirements.join('\n• '), // Convertir a lista
      }));
      toast.success(`Plantilla aplicada para la categoría "${category}"`);
    }
  };

  const handleSubmit = async (publishNow = false) => {
    if (!user || !isBusinessRole(userRole) || !activeCompany || !canCreateOpportunities()) {
      toast.error('No tienes permisos para crear oportunidades en esta empresa');
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Título, descripción y categoría son obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Mapeo inverso: de valores del formulario a valores de BD
      const categoryReverseMap: Record<string, string> = {
        'Ventas': 'Ventas',
        'Marketing': 'Marketing',
        'Atención al cliente': 'Atención al cliente',
        'Operaciones': 'Operaciones',
        'Creativo': 'Creativo',
        'Tecnología y Automatizaciones': 'Tecnología y Automatizaciones',
        'Soporte Profesional': 'Soporte Profesional',
      };

      const typeReverseMap: Record<string, string> = {
        'tiempo_completo': 'Tiempo Completo',
        'medio_tiempo': 'Medio Tiempo',
        'freelance': 'Freelance',
        'contrato': 'Contrato',
        'prácticas': 'Prácticas',
      };

      const opportunityData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || null,
        location: formData.location || null,
        type: typeReverseMap[formData.type] || formData.type,
        category: categoryReverseMap[formData.category] || formData.category,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        status: (publishNow ? 'active' : formData.status) as 'draft' | 'active' | 'paused' | 'closed',
        contract_type: formData.contract_type || null,
        duration_type: formData.duration_type,
        duration_value: formData.duration_value ? parseInt(formData.duration_value) : null,
        duration_unit: formData.duration_unit,
        skills: formData.skills,
        experience_levels: formData.experience_levels,
        timezone_preference: formData.timezone_preference || null,
        deadline_date: formData.deadline_date?.toISOString().split('T')[0] || null,
        payment_type: formData.payment_type,
        commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : null,
        salary_is_public: formData.salary_is_public,
        is_academy_exclusive: formData.is_academy_exclusive,
      };

      console.log('💾 Guardando datos:', opportunityData);

      if (isEditing && id) {
        const { data: updatedData, error: updateError } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Error al actualizar:', updateError);
          throw updateError;
        }
        
        console.log('✅ Oportunidad actualizada:', updatedData);
      } else {
        const { data: insertedData, error: insertError } = await supabase
          .from('opportunities')
          .insert({
            ...opportunityData,
            company_id: activeCompany.id,
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Error al crear:', insertError);
          throw insertError;
        }
        
        console.log('✅ Oportunidad creada:', insertedData);
      }

      const action = publishNow ? 'publicada' : 'guardada';
      toast.success(isEditing ? `Oportunidad ${action} exitosamente` : `Oportunidad ${action} exitosamente`);
      navigate('/business-dashboard/opportunities');
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      toast.error(error.message || (isEditing ? 'Error al actualizar la oportunidad' : 'Error al guardar la oportunidad'));
    } finally {
      setLoading(false);
    }
  };

  const jobCategories = Object.keys(categoryTemplates);

  const jobTypes = [
    'Tiempo Completo',
    'Medio Tiempo',
    'Freelance',
    'Contrato',
    'Prácticas',
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Oportunidad' : 'Crear Nueva Oportunidad'}
          </h1>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Guardado automáticamente: {format(lastSaved, 'HH:mm')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl">
        <div className="bg-card p-8 rounded-lg border border-border">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoría *
                  </label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.category && (
                  <OpportunityTemplates 
                    category={formData.category}
                    onSelectTemplate={handleTemplateSelect}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título de la oportunidad *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Desarrollador Full Stack"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de contrato *
                  </label>
                  <Select value={formData.contract_type} onValueChange={(value) => handleInputChange('contract_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                <div>
                  <label className="block text-sm font-medium mb-3">
                    Duración del vínculo
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="indefinite"
                        checked={formData.duration_type === 'indefinite'}
                        onCheckedChange={(checked) => {
                          if (checked) handleInputChange('duration_type', 'indefinite');
                        }}
                      />
                      <label htmlFor="indefinite" className="text-sm">Indefinido</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fixed"
                        checked={formData.duration_type === 'fixed'}
                        onCheckedChange={(checked) => {
                          if (checked) handleInputChange('duration_type', 'fixed');
                        }}
                      />
                      <label htmlFor="fixed" className="text-sm">Duración específica</label>
                    </div>
                    {formData.duration_type === 'fixed' && (
                      <div className="flex gap-2 ml-6">
                        <Input
                          type="number"
                          value={formData.duration_value}
                          onChange={(e) => handleInputChange('duration_value', e.target.value)}
                          placeholder="Cantidad"
                          className="w-24"
                        />
                        <Select value={formData.duration_unit} onValueChange={(value) => handleInputChange('duration_unit', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {durationUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Modalidad *
                  </label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase().replace(/ /g, '_')}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ubicación
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ej: Buenos Aires, Argentina o Remoto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Zona horaria preferida (opcional)
                  </label>
                  <Select value={formData.timezone_preference} onValueChange={(value) => handleInputChange('timezone_preference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha límite (opcional)
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline_date ? format(formData.deadline_date, 'PPP') : 'Seleccionar fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.deadline_date || undefined}
                        onSelect={(date) => handleInputChange('deadline_date', date)}
                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="academy_exclusive"
                      checked={formData.is_academy_exclusive}
                      onCheckedChange={(checked) => handleInputChange('is_academy_exclusive', checked)}
                    />
                    <label htmlFor="academy_exclusive" className="text-sm">
                      Exclusiva para estudiantes de academia
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description and Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descripción *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe las responsabilidades y objetivos del puesto..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Skills requeridos
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Agregar skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      Agregar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Nivel de experiencia (puede seleccionar múltiples)
                  </label>
                  <div className="space-y-2">
                      {experienceLevelOptions.map((level) => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={level.value}
                          checked={formData.experience_levels.includes(level.value)}
                          onCheckedChange={(checked) => handleExperienceLevelChange(level.value, checked as boolean)}
                        />
                        <label htmlFor={level.value} className="text-sm">
                          {level.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements and Compensation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Requisitos
                </label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Lista los requisitos específicos para el puesto..."
                  rows={6}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Tipo de pago
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fixed_payment"
                        checked={formData.payment_type === 'fixed'}
                        onCheckedChange={(checked) => {
                          if (checked) handleInputChange('payment_type', 'fixed');
                        }}
                      />
                      <label htmlFor="fixed_payment" className="text-sm">Fijo</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commission_payment"
                        checked={formData.payment_type === 'commission'}
                        onCheckedChange={(checked) => {
                          if (checked) handleInputChange('payment_type', 'commission');
                        }}
                      />
                      <label htmlFor="commission_payment" className="text-sm">Comisión</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mixed_payment"
                        checked={formData.payment_type === 'fixed_plus_commission'}
                        onCheckedChange={(checked) => {
                          if (checked) handleInputChange('payment_type', 'fixed_plus_commission');
                        }}
                      />
                      <label htmlFor="mixed_payment" className="text-sm">Fijo + Comisión</label>
                    </div>
                  </div>
                </div>

                {(formData.payment_type === 'fixed' || formData.payment_type === 'fixed_plus_commission') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Salario mínimo (USD)
                        </label>
                        <Input
                          type="number"
                          value={formData.salary_min}
                          onChange={(e) => handleInputChange('salary_min', e.target.value)}
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Salario máximo (USD)
                        </label>
                        <Input
                          type="number"
                          value={formData.salary_max}
                          onChange={(e) => handleInputChange('salary_max', e.target.value)}
                          placeholder="5000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Período de pago *
                      </label>
                      <Select value={formData.salary_period} onValueChange={(value) => handleInputChange('salary_period', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona período" />
                        </SelectTrigger>
                        <SelectContent>
                          {salaryPeriods.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {(formData.payment_type === 'commission' || formData.payment_type === 'fixed_plus_commission') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Porcentaje de comisión (%)
                    </label>
                    <Input
                      type="number"
                      value={formData.commission_percentage}
                      onChange={(e) => handleInputChange('commission_percentage', e.target.value)}
                      placeholder="10"
                      max="100"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="salary_public"
                    checked={formData.salary_is_public}
                    onCheckedChange={(checked) => handleInputChange('salary_is_public', checked)}
                  />
                  <label htmlFor="salary_public" className="text-sm">
                    Mostrar información de salario públicamente
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/business-dashboard/opportunities')}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                variant="secondary"
                onClick={() => handleSubmit(false)}
                disabled={loading || !formData.title}
              >
                {loading ? 'Guardando...' : 'Guardar como Borrador'}
              </Button>
              <Button 
                type="button" 
                onClick={() => handleSubmit(true)}
                disabled={loading || !formData.title || !formData.category || !formData.type}
                className="font-semibold"
              >
                {loading ? 'Publicando...' : (isEditing ? 'Actualizar y Publicar' : 'Publicar Oportunidad')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOpportunity;