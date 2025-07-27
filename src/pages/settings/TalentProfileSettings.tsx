
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, X, Award, GraduationCap, Briefcase } from 'lucide-react';

// Simplified schemas for education and work experience
const educationSchema = z.object({
  institution: z.string().min(1, 'Institución requerida'),
  degree: z.string().min(1, 'Título requerido'),
  field_of_study: z.string().optional(),
  description: z.string().optional(),
  graduation_year: z.number().optional(),
});

const workExperienceSchema = z.object({
  company: z.string().min(1, 'Empresa requerida'),
  position: z.string().min(1, 'Puesto requerido'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
});

const talentProfileSchema = z.object({
  title: z.string().min(1, 'Título profesional requerido'),
  specialty: z.string().min(1, 'Especialidad requerida'),
  bio: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  skills: z.array(z.string()).min(1, 'Agrega al menos una habilidad'),
  years_experience: z.number().min(0, 'Años de experiencia requeridos'),
  availability: z.string().min(1, 'Disponibilidad requerida'),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  hourly_rate_min: z.number().min(0, 'Tarifa mínima requerida'),
  hourly_rate_max: z.number().min(0, 'Tarifa máxima requerida'),
  currency: z.string().default('USD'),
  education: z.array(educationSchema).optional(),
  work_experience: z.array(workExperienceSchema).optional(),
});

type TalentProfileFormData = z.infer<typeof talentProfileSchema>;

const TalentProfileSettings = () => {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [talentProfile, setTalentProfile] = useState<any>(null);

  const form = useForm<TalentProfileFormData>({
    resolver: zodResolver(talentProfileSchema),
    defaultValues: {
      title: '',
      specialty: '',
      bio: '',
      skills: [],
      years_experience: 0,
      availability: 'immediate',
      linkedin_url: '',
      portfolio_url: '',
      hourly_rate_min: 20,
      hourly_rate_max: 50,
      currency: 'USD',
      education: [],
      work_experience: [],
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: 'work_experience',
  });

  // Load talent profile data
  useEffect(() => {
    if (user) {
      loadTalentProfile();
    }
  }, [user]);

  const loadTalentProfile = async () => {
    if (!user) return;

    try {
      // Get talent profile
      const { data: profile, error: profileError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        setTalentProfile(profile);

        // Load education data
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('talent_profile_id', profile.id)
          .order('created_at', { ascending: false });

        console.log('Education data loaded:', educationData);
        console.log('Education error:', educationError);

        // Load work experience data
        const { data: workData } = await supabase
          .from('work_experience')
          .select('*')
          .eq('talent_profile_id', profile.id)
          .order('start_date', { ascending: false });

        // Update form with loaded data
        form.reset({
          title: profile.title || '',
          specialty: profile.specialty || '',
          bio: profile.bio || '',
          skills: profile.skills || [],
          years_experience: profile.years_experience || 0,
          availability: profile.availability || 'immediate',
          linkedin_url: profile.linkedin_url || '',
          portfolio_url: profile.portfolio_url || '',
          hourly_rate_min: profile.hourly_rate_min || 20,
          hourly_rate_max: profile.hourly_rate_max || 50,
          currency: profile.currency || 'USD',
          education: educationData?.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.field_of_study || '',
            description: edu.description || '',
            graduation_year: edu.graduation_year || undefined,
          })) || [],
          work_experience: workData?.map(work => ({
            company: work.company,
            position: work.position,
            description: work.description || '',
            start_date: (work as any).start_date || '',
            end_date: (work as any).end_date || '',
            is_current: (work as any).is_current || false,
          })) || [],
        });
      }
    } catch (error) {
      console.error('Error loading talent profile:', error);
      toast.error('No se pudo cargar el perfil de talento');
    }
  };

  const onSubmit = async (data: TalentProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let profileId = talentProfile?.id;

      // Create or update talent profile
      if (!talentProfile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('talent_profiles')
          .insert({
            user_id: user.id,
            title: data.title,
            specialty: data.specialty,
            bio: data.bio,
            skills: data.skills,
            years_experience: data.years_experience,
            availability: data.availability,
            linkedin_url: data.linkedin_url,
            portfolio_url: data.portfolio_url,
            hourly_rate_min: data.hourly_rate_min,
            hourly_rate_max: data.hourly_rate_max,
            currency: data.currency,
          })
          .select()
          .single();

        if (profileError) throw profileError;
        profileId = newProfile.id;
        setTalentProfile(newProfile);
      } else {
        const { error: updateError } = await supabase
          .from('talent_profiles')
          .update({
            title: data.title,
            specialty: data.specialty,
            bio: data.bio,
            skills: data.skills,
            years_experience: data.years_experience,
            availability: data.availability,
            linkedin_url: data.linkedin_url,
            portfolio_url: data.portfolio_url,
            hourly_rate_min: data.hourly_rate_min,
            hourly_rate_max: data.hourly_rate_max,
            currency: data.currency,
          })
          .eq('id', talentProfile.id);

        if (updateError) throw updateError;
      }

      // Save education data
      if (data.education && data.education.length > 0) {
        console.log('Saving education data:', data.education);
        console.log('Profile ID:', profileId);
        
        try {
          // Delete existing education records
          const { error: deleteError } = await supabase
            .from('education')
            .delete()
            .eq('talent_profile_id', profileId);

          if (deleteError) {
            console.error('Error deleting existing education:', deleteError);
          } else {
            console.log('Existing education records deleted successfully');
          }

          // Insert new education records one by one
          for (let i = 0; i < data.education.length; i++) {
            const edu = data.education[i];
            console.log(`Inserting education record ${i + 1}:`, edu);
            
            const educationRecord = {
              talent_profile_id: profileId,
              institution: edu.institution,
              degree: edu.degree,
              field_of_study: edu.field_of_study || null,
              description: edu.description || null,
              graduation_year: edu.graduation_year || null,
            };

            console.log('Education record to insert:', educationRecord);

            const { data: insertedRecord, error: insertError } = await supabase
              .from('education')
              .insert(educationRecord)
              .select()
              .single();

            if (insertError) {
              console.error(`Error inserting education record ${i + 1}:`, insertError);
              throw insertError;
            }

            console.log(`Education record ${i + 1} saved successfully:`, insertedRecord);
          }

          console.log('All education records saved successfully');
        } catch (error) {
          console.error('Error in education save process:', error);
          throw error;
        }
      } else {
        console.log('No education data to save');
      }

      // Save work experience data
      if (data.work_experience && data.work_experience.length > 0) {
        // Delete existing work experience records
        await supabase
          .from('work_experience')
          .delete()
          .eq('talent_profile_id', profileId);

        // Insert new work experience records
        const workData = data.work_experience.map(work => ({
          talent_profile_id: profileId,
          company: work.company,
          position: work.position,
          description: work.description,
          start_date: work.start_date,
          end_date: work.is_current ? null : work.end_date,
          is_current: work.is_current,
        }));

        const { error: workError } = await supabase
          .from('work_experience')
          .insert(workData);

        if (workError) throw workError;
      }

      toast.success('Perfil profesional actualizado correctamente');
    } catch (error) {
      console.error('Error updating talent profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = form.getValues('skills');
      if (!currentSkills.includes(newSkill.trim())) {
        form.setValue('skills', [...currentSkills, newSkill.trim()]);
        setNewSkill('');
      } else {
        toast.error('Esta habilidad ya está agregada');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills');
    form.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addEducation = () => {
    appendEducation({
      institution: '',
      degree: '',
      field_of_study: '',
      description: '',
      graduation_year: undefined,
    });
  };

  const addWorkExperience = () => {
    appendWork({
      company: '',
      position: '',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Perfil Profesional</h2>
        <p className="text-muted-foreground">Gestiona tu información profesional y experiencia</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Profesional</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Especialista No Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: No Code, Frontend, Marketing Digital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="years_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de Experiencia</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona disponibilidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Inmediata</SelectItem>
                          <SelectItem value="1-week">1 semana</SelectItem>
                          <SelectItem value="2-weeks">2 semanas</SelectItem>
                          <SelectItem value="1-month">1 mes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Profesional</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe tu experiencia, logros y lo que te diferencia..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Skills Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Habilidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar habilidad"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {form.watch('skills').map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experiencia Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Experiencia {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeWork(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de la empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puesto</FormLabel>
                          <FormControl>
                            <Input placeholder="Título del puesto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`work_experience.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe tus responsabilidades y logros..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.start_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inicio</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <FormLabel>Fecha de fin</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Trabajo actual</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addWorkExperience}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Experiencia Laboral
              </Button>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {educationFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Educación {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institución</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de la institución" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Título obtenido" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`education.${index}.field_of_study`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campo de estudio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Ingeniería Informática, Marketing Digital" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`education.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe tu formación, proyectos destacados..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`education.${index}.graduation_year`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año de graduación</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2024" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addEducation}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Educación
              </Button>
            </CardContent>
          </Card>

          {/* Links and Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Enlaces y Tarifas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/tu-perfil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tu-portfolio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hourly_rate_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa Mínima por Hora</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hourly_rate_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa Máxima por Hora</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Descartar Cambios
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Perfil'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TalentProfileSettings;
