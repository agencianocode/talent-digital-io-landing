
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
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, X, Briefcase, GraduationCap, Award } from 'lucide-react';

const experienceSchema = z.object({
  position: z.string().min(1, 'Posición requerida'),
  company: z.string().min(1, 'Empresa requerida'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
});

const educationSchema = z.object({
  degree: z.string().min(1, 'Título requerido'),
  institution: z.string().min(1, 'Institución requerida'),
  graduationYear: z.number().min(1900, 'Año válido requerido'),
  fieldOfStudy: z.string().optional(),
  description: z.string().optional(),
});

const talentProfileSchema = z.object({
  title: z.string().min(1, 'Título profesional requerido'),
  specialty: z.string().min(1, 'Especialidad requerida'),
  bio: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  skills: z.array(z.string()).min(1, 'Agrega al menos una habilidad'),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  yearsExperience: z.number().min(0, 'Años de experiencia requeridos'),
  availability: z.string().min(1, 'Disponibilidad requerida'),
});

type TalentProfileFormData = z.infer<typeof talentProfileSchema>;

const TalentProfileSettings = () => {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [talentProfile, setTalentProfile] = useState(null);

  const form = useForm<TalentProfileFormData>({
    resolver: zodResolver(talentProfileSchema),
    defaultValues: {
      title: '',
      specialty: '',
      bio: '',
      skills: [],
      experience: [],
      education: [],
      yearsExperience: 0,
      availability: 'full-time',
    },
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

        // Get work experience
        const { data: experience, error: expError } = await supabase
          .from('work_experience')
          .select('*')
          .eq('talent_profile_id', profile.id)
          .order('start_date', { ascending: false });

        if (expError) throw expError;

        // Get education
        const { data: education, error: eduError } = await supabase
          .from('education')
          .select('*')
          .eq('talent_profile_id', profile.id)
          .order('graduation_year', { ascending: false });

        if (eduError) throw eduError;

        // Update form with loaded data
        form.reset({
          title: profile.title || '',
          specialty: profile.specialty || '',
          bio: profile.bio || '',
          skills: profile.skills || [],
          experience: experience?.map(exp => ({
            company: exp.company,
            position: exp.position,
            description: exp.description || '',
            startDate: exp.start_date,
            endDate: exp.end_date,
            isCurrent: exp.is_current || false
          })) || [],
          education: education?.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.field_of_study || '',
            graduationYear: edu.graduation_year,
            description: edu.description || ''
          })) || [],
          yearsExperience: profile.years_experience || 0,
          availability: profile.availability || 'full-time',
        });
      }
    } catch (error) {
      console.error('Error loading talent profile:', error);
      toast.error('No se pudo cargar el perfil de talento');
    }
  };

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  });

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
            years_experience: data.yearsExperience,
            availability: data.availability,
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
            years_experience: data.yearsExperience,
            availability: data.availability,
          })
          .eq('id', talentProfile.id);

        if (updateError) throw updateError;
      }

      // Update work experience
      if (profileId) {
        // Delete existing experience
        await supabase
          .from('work_experience')
          .delete()
          .eq('talent_profile_id', profileId);

        // Insert new experience
        if (data.experience.length > 0) {
          const { error: expError } = await supabase
            .from('work_experience')
            .insert(data.experience.map(exp => ({
              talent_profile_id: profileId,
              company: exp.company,
              position: exp.position,
              description: exp.description,
              start_date: exp.startDate,
              end_date: exp.endDate,
              is_current: exp.isCurrent,
            })));

          if (expError) throw expError;
        }

        // Update education
        // Delete existing education
        await supabase
          .from('education')
          .delete()
          .eq('talent_profile_id', profileId);

        // Insert new education
        if (data.education.length > 0) {
          const { error: eduError } = await supabase
            .from('education')
            .insert(data.education.map(edu => ({
              talent_profile_id: profileId,
              institution: edu.institution,
              degree: edu.degree,
              field_of_study: edu.fieldOfStudy,
              graduation_year: edu.graduationYear,
              description: edu.description,
            })));

          if (eduError) throw eduError;
        }
      }

      toast.success('Perfil profesional actualizado');
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
                        <Input placeholder="Ej: Especialista en Ventas B2B" {...field} />
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
                        <Input placeholder="Ej: Closer, SDR, Media Buyer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de Experiencia</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ej: 5" 
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
                      <FormControl>
                        <Input placeholder="Ej: Inmediata, 2 semanas" {...field} />
                      </FormControl>
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

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experiencia Laboral
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendExperience({
                    position: '',
                    company: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    description: ''
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {experienceFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Experiencia {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Senior Sales Executive" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.company`}
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
                      name={`experience.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Inicio</FormLabel>
                          <FormControl>
                            <Input type="month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Fin</FormLabel>
                          <FormControl>
                    <Input 
                              type="month" 
                              disabled={form.watch(`experience.${index}.isCurrent`)}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experience.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe tus responsabilidades y logros..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formación Académica
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendEducation({
                    degree: '',
                    institution: '',
                    graduationYear: new Date().getFullYear(),
                    fieldOfStudy: '',
                    description: ''
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {educationFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Formación {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Grado en Marketing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institución</FormLabel>
                          <FormControl>
                            <Input placeholder="Universidad o institución" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.graduationYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Año</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2020" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
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
