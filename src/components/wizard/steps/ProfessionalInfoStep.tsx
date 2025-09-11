import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, Star } from 'lucide-react';
import { WizardData } from '../TalentProfileWizard';
import { ProfessionalCategory } from '@/hooks/useProfessionalData';
import { useProfessionalData, ProfileSuggestions } from '@/hooks/useProfessionalData';

const professionalInfoSchema = z.object({
  primary_category_id: z.string().min(1, 'La categoría principal es requerida'),
  secondary_category_id: z.string().optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  experience_level: z.string().min(1, 'El nivel de experiencia es requerido'),
  bio: z.string().min(50, 'La biografía debe tener al menos 50 caracteres'),
});

type ProfessionalInfoFormData = z.infer<typeof professionalInfoSchema>;

interface ProfessionalInfoStepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => Promise<void>;
  categories: ProfessionalCategory[];
  onNext: () => void;
  onPrev: () => void;
  hideNavigationButtons?: boolean;
}

export const ProfessionalInfoStep: React.FC<ProfessionalInfoStepProps> = ({
  data,
  updateData,
  categories,
  onNext,
  onPrev,
  hideNavigationButtons = false,
}) => {
  const { getProfileSuggestions } = useProfessionalData();
  const [suggestions, setSuggestions] = useState<ProfileSuggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      primary_category_id: data.primary_category_id,
      secondary_category_id: data.secondary_category_id,
      title: data.title,
      experience_level: data.experience_level,
      bio: data.bio,
    },
  });

  const selectedCategory = form.watch('primary_category_id');

  // Load suggestions when category changes
  useEffect(() => {
    const loadSuggestions = async () => {
      if (selectedCategory) {
        setLoadingSuggestions(true);
        try {
          const categoryData = await getProfileSuggestions(selectedCategory);
          setSuggestions(categoryData);
        } catch (error) {
          console.error('Error loading suggestions:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      }
    };

    loadSuggestions();
  }, [selectedCategory]); // Removed getProfileSuggestions dependency

  const onSubmit = async (formData: ProfessionalInfoFormData) => {
    await updateData(formData);
    onNext();
  };

  const applySuggestedTitle = (title: string) => {
    form.setValue('title', title);
  };

  const applySuggestedBio = () => {
    if (suggestions?.suggested_bio_template) {
      form.setValue('bio', suggestions.suggested_bio_template);
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const secondaryCategories = selectedCategoryData?.subcategories || [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Información Profesional
        </h2>
        <p className="text-muted-foreground">
          Define tu especialización y experiencia profesional
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Professional Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="primary_category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría Principal *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu área principal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Tu área de especialización principal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondary_category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialización Secundaria</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Especialización específica" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {secondaryCategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Tu especialización específica dentro del área
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Experience Level */}
          <FormField
            control={form.control}
            name="experience_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de Experiencia *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nivel de experiencia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0-1">
                      <div>
                        <p className="font-medium">Principiante (0-1 años)</p>
                        <p className="text-sm text-muted-foreground">Recién graduado o nuevo en el área</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="1-3">
                      <div>
                        <p className="font-medium">Intermedio (1-3 años)</p>
                        <p className="text-sm text-muted-foreground">Experiencia sólida en proyectos</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="3-6">
                      <div>
                        <p className="font-medium">Avanzado (3-6 años)</p>
                        <p className="text-sm text-muted-foreground">Líder de proyectos y especialista</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="6+">
                      <div>
                        <p className="font-medium">Experto (+6 años)</p>
                        <p className="text-sm text-muted-foreground">Referente en el área con amplia experiencia</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Professional Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título Profesional *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Especialista en Marketing Digital, Senior Frontend Developer..." 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Un título que represente claramente tu rol y especialización
                </FormDescription>
                <FormMessage />
                
                {/* Suggested Titles */}
                {suggestions?.suggested_title_examples && suggestions.suggested_title_examples.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Lightbulb className="h-4 w-4" />
                      Sugerencias de títulos:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.suggested_title_examples.map((title, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => applySuggestedTitle(title)}
                        >
                          {title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Professional Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biografía Profesional *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe tu experiencia, logros más importantes y lo que te diferencia como profesional..."
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Una descripción atractiva de tu experiencia y lo que ofreces (mínimo 50 caracteres)
                </FormDescription>
                <FormMessage />
                
                {/* Suggested Bio Template */}
                {suggestions?.suggested_bio_template && (
                  <Card className="mt-3">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Plantilla Sugerida
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestions.suggested_bio_template}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applySuggestedBio}
                      >
                        Usar como base
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </FormItem>
            )}
          />

          {!hideNavigationButtons && (
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrev}>
                Anterior
              </Button>
              <Button type="submit">
                Continuar
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};