import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { WizardData } from '../TalentProfileWizard';

const educationSchema = z.object({
  education: z.array(z.object({
    id: z.string().optional(),
    institution: z.string().min(1, 'La institución es requerida'),
    degree: z.string().min(1, 'El título/grado es requerido'),
    field_of_study: z.string().min(1, 'El campo de estudio es requerido'),
    description: z.string().optional(),
    graduation_year: z.number().min(1900, 'Año inválido').max(new Date().getFullYear() + 10, 'Año inválido'),
  })).min(0),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationStepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export const EducationStep: React.FC<EducationStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      education: data.education.length > 0 ? data.education : [{
        institution: '',
        degree: '',
        field_of_study: '',
        description: '',
        graduation_year: new Date().getFullYear(),
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const onSubmit = async (formData: EducationFormData) => {
    await updateData({
      education: formData.education.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        description: edu.description || '',
        graduation_year: edu.graduation_year,
      })),
    });
    onNext();
  };

  const addEducation = () => {
    append({
      id: undefined,
      institution: '',
      degree: '',
      field_of_study: '',
      description: '',
      graduation_year: new Date().getFullYear(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Educación
        </h2>
        <p className="text-muted-foreground">
          Agrega tu formación académica y certificaciones relevantes
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {index === 0 ? 'Educación Principal' : `Educación ${index + 1}`}
                    </CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institución *</FormLabel>
                          <FormControl>
                            <Input placeholder="Universidad, Instituto, Academia..." {...field} />
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
                          <FormLabel>Año de Graduación *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2024"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título/Grado *</FormLabel>
                          <FormControl>
                            <Input placeholder="Licenciatura, Maestría, Certificación..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.field_of_study`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campo de Estudio *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingeniería, Marketing, Diseño..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`education.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Menciones honoríficas, proyectos destacados, especialización..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Información adicional relevante sobre tu educación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addEducation}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Educación
            </Button>
          </div>

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
    </div>
  );
};