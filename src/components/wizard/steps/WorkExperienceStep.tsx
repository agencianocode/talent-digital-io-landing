import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { CreateCompanyModal } from '@/components/ui/create-company-modal';
import { Building, Plus, X, Search, Briefcase } from 'lucide-react';
import { WizardData } from '../TalentProfileWizard';
import { useProfessionalData, CompanyDirectory, JobTitle } from '@/hooks/useProfessionalData';
import { useDebounce } from '@/hooks/useDebounce';

const workExperienceSchema = z.object({
  work_experience: z.array(z.object({
    company: z.string().min(1, 'El nombre de la empresa es requerido'),
    company_directory_id: z.string().optional(),
    position: z.string().min(1, 'El puesto es requerido'),
    description: z.string().min(10, 'Descripción mínima de 10 caracteres'),
    start_date: z.string().min(1, 'Fecha de inicio requerida'),
    end_date: z.string().optional(),
    is_current: z.boolean(),
  })).min(1, 'Agrega al menos una experiencia laboral'),
});

type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;

interface WorkExperienceStepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const { searchCompaniesDirectory, searchJobTitles, incrementJobTitleUsage, addCompanyToDirectory } = useProfessionalData();
  const [searchResults, setSearchResults] = useState<{ [key: number]: CompanyDirectory[] }>({});
  const [isSearching, setIsSearching] = useState<{ [key: number]: boolean }>({});
  const [jobTitleResults, setJobTitleResults] = useState<{ [key: number]: JobTitle[] }>({});
  const [isSearchingJobs, setIsSearchingJobs] = useState<{ [key: number]: boolean }>({});
  const [createCompanyModal, setCreateCompanyModal] = useState<{
    open: boolean;
    fieldIndex: number;
    companyName: string;
  }>({
    open: false,
    fieldIndex: -1,
    companyName: '',
  });

  // Create proper default values
  const getDefaultWorkExperience = () => ({
    company: '',
    company_directory_id: '',
    position: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  const form = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      work_experience: data.work_experience.length > 0 
        ? data.work_experience.map(exp => ({
            company: exp.company || '',
            company_directory_id: exp.company_directory_id || '',
            position: exp.position || '',
            description: exp.description || '',
            start_date: exp.start_date || '',
            end_date: exp.end_date || '',
            is_current: exp.is_current || false,
          }))
        : [getDefaultWorkExperience()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'work_experience',
  });

  const searchCompanies = async (searchTerm: string, fieldIndex: number) => {
    if (searchTerm.length < 2) {
      setSearchResults(prev => ({ ...prev, [fieldIndex]: [] }));
      return;
    }

    setIsSearching(prev => ({ ...prev, [fieldIndex]: true }));
    try {
      const results = await searchCompaniesDirectory(searchTerm);
      setSearchResults(prev => ({ ...prev, [fieldIndex]: results }));
    } catch (error) {
      console.error('Error searching companies:', error);
    } finally {
      setIsSearching(prev => ({ ...prev, [fieldIndex]: false }));
    }
  };

  const selectCompanyFromDirectory = (company: CompanyDirectory, fieldIndex: number) => {
    form.setValue(`work_experience.${fieldIndex}.company`, company.name);
    form.setValue(`work_experience.${fieldIndex}.company_directory_id`, company.id);
    setSearchResults(prev => ({ ...prev, [fieldIndex]: [] }));
  };

  // Job title search functionality
  const searchJobTitlesDebounced = useCallback(async (searchTerm: string, fieldIndex: number) => {
    if (searchTerm.length < 2) {
      setJobTitleResults(prev => ({ ...prev, [fieldIndex]: [] }));
      return;
    }

    setIsSearchingJobs(prev => ({ ...prev, [fieldIndex]: true }));
    try {
      const results = await searchJobTitles(searchTerm);
      setJobTitleResults(prev => ({ ...prev, [fieldIndex]: results }));
    } catch (error) {
      console.error('Error searching job titles:', error);
    } finally {
      setIsSearchingJobs(prev => ({ ...prev, [fieldIndex]: false }));
    }
  }, [searchJobTitles]);

  const debouncedJobSearch = useDebounce(searchJobTitlesDebounced, 300);

  const selectJobTitle = useCallback(async (jobTitle: string, fieldIndex: number) => {
    form.setValue(`work_experience.${fieldIndex}.position`, jobTitle);
    setJobTitleResults(prev => ({ ...prev, [fieldIndex]: [] }));
    
    // Track usage
    try {
      await incrementJobTitleUsage(jobTitle);
    } catch (error) {
      console.error('Error tracking job title usage:', error);
    }
  }, [form, incrementJobTitleUsage]);

  // Company creation functionality
  const handleCreateCompany = (companyName: string, fieldIndex: number) => {
    setCreateCompanyModal({
      open: true,
      fieldIndex,
      companyName,
    });
  };

  const handleCompanyCreated = (companyId: string, companyName: string) => {
    const fieldIndex = createCompanyModal.fieldIndex;
    form.setValue(`work_experience.${fieldIndex}.company`, companyName);
    form.setValue(`work_experience.${fieldIndex}.company_directory_id`, companyId);
    setCreateCompanyModal({ open: false, fieldIndex: -1, companyName: '' });
  };

  const addNewExperience = () => {
    append(getDefaultWorkExperience());
  };

  const onSubmit = (formData: WorkExperienceFormData) => {
    // Map form data to proper WizardData format
    const mappedWorkExperience = formData.work_experience.map(exp => ({
      id: undefined, // Will be assigned when saved
      company: exp.company,
      company_directory_id: exp.company_directory_id,
      position: exp.position,
      description: exp.description,
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      is_current: exp.is_current,
    }));

    updateData({ work_experience: mappedWorkExperience });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          Experiencia Laboral
        </h2>
        <p className="text-muted-foreground">
          Muestra tu trayectoria profesional y logros más importantes
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Experiencia #{index + 1}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company Search */}
                <FormField
                  control={form.control}
                  name={`work_experience.${index}.company`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Buscar empresa o escribir nueva..."
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              searchCompanies(e.target.value, index);
                            }}
                          />
                        </FormControl>
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        
                        {/* Search Results */}
                        {searchResults[index] && searchResults[index].length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {searchResults[index].map((company) => (
                              <button
                                key={company.id}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-muted"
                                onClick={() => selectCompanyFromDirectory(company, index)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{company.name}</p>
                                    {company.industry_name && (
                                      <p className="text-sm text-muted-foreground">{company.industry_name}</p>
                                    )}
                                  </div>
                                  {company.is_claimed && (
                                    <Badge variant="outline" className="text-xs">
                                      Verificada
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                            {/* Add "Create New" option */}
                            {form.watch(`work_experience.${index}.company`) && 
                             !searchResults[index].some(company => 
                               company.name.toLowerCase() === form.watch(`work_experience.${index}.company`).toLowerCase()
                             ) && (
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-muted border-t"
                                onClick={() => handleCreateCompany(form.watch(`work_experience.${index}.company`), index)}
                              >
                                <div className="flex items-center gap-2">
                                  <Plus className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="font-medium text-primary">Crear nueva empresa</p>
                                    <p className="text-sm text-muted-foreground">
                                      "{form.watch(`work_experience.${index}.company`)}"
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Show create option when no results found */}
                        {form.watch(`work_experience.${index}.company`) && 
                         form.watch(`work_experience.${index}.company`).length >= 2 &&
                         (!searchResults[index] || searchResults[index].length === 0) &&
                         !isSearching[index] && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg">
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted"
                              onClick={() => handleCreateCompany(form.watch(`work_experience.${index}.company`), index)}
                            >
                              <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="font-medium text-primary">Crear nueva empresa</p>
                                  <p className="text-sm text-muted-foreground">
                                    "{form.watch(`work_experience.${index}.company`)}"
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        Busca tu empresa en nuestro directorio o escribe una nueva
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Position with autocomplete */}
                <FormField
                  control={form.control}
                  name={`work_experience.${index}.position`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puesto *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Ej: Marketing Manager, Frontend Developer..."
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              debouncedJobSearch(e.target.value, index);
                            }}
                          />
                        </FormControl>
                        <Briefcase className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        
                        {/* Job Title Results */}
                        {jobTitleResults[index] && jobTitleResults[index].length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {jobTitleResults[index].map((jobTitle) => (
                              <button
                                key={jobTitle.id}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-muted"
                                onClick={() => selectJobTitle(jobTitle.title, index)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{jobTitle.title}</p>
                                    {jobTitle.category && (
                                      <p className="text-sm text-muted-foreground">{jobTitle.category}</p>
                                    )}
                                  </div>
                                  {jobTitle.usage_count > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        Sugerencias basadas en puestos comunes en la industria
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`work_experience.${index}.start_date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio *</FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`work_experience.${index}.end_date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Fin</FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field}
                            disabled={form.watch(`work_experience.${index}.is_current`)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`work_experience.${index}.is_current`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <div className="flex items-center space-x-2 p-3 rounded-lg border">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">
                            Trabajo actual
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name={`work_experience.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción y Logros *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tus responsabilidades principales, proyectos destacados y logros cuantificables..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Incluye logros específicos y resultados medibles cuando sea posible
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addNewExperience}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Más Experiencia
          </Button>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Anterior
            </Button>
            <Button type="submit">
              Continuar
            </Button>
          </div>
        </form>
      </Form>

      {/* Create Company Modal */}
      <CreateCompanyModal
        open={createCompanyModal.open}
        onOpenChange={(open) => setCreateCompanyModal(prev => ({ ...prev, open }))}
        onCompanyCreated={handleCompanyCreated}
        initialName={createCompanyModal.companyName}
      />
    </div>
  );
};