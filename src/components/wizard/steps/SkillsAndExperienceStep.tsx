import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, Plus, X, Lightbulb, Target } from 'lucide-react';
import { WizardData } from '../TalentProfileWizard';
import { ProfessionalCategory, Industry } from '@/hooks/useProfessionalData';
import { useProfessionalData, ProfileSuggestions } from '@/hooks/useProfessionalData';

const skillsExperienceSchema = z.object({
  skills: z.array(z.string()).min(3, 'Agrega al menos 3 habilidades'),
  industries_of_interest: z.array(z.string()).min(1, 'Selecciona al menos una industria de interés'),
});

type SkillsExperienceFormData = z.infer<typeof skillsExperienceSchema>;

interface SkillsAndExperienceStepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  categories: ProfessionalCategory[];
  industries: Industry[];
  onNext: () => void;
  onPrev: () => void;
}

export const SkillsAndExperienceStep: React.FC<SkillsAndExperienceStepProps> = ({
  data,
  updateData,
  categories,
  industries,
  onNext,
  onPrev,
}) => {
  const { getProfileSuggestions } = useProfessionalData();
  const [newSkill, setNewSkill] = useState('');
  const [suggestions, setSuggestions] = useState<ProfileSuggestions | null>(null);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

  const form = useForm<SkillsExperienceFormData>({
    resolver: zodResolver(skillsExperienceSchema),
    defaultValues: {
      skills: data.skills,
      industries_of_interest: data.industries_of_interest,
    },
  });

  // Load suggestions based on selected category
  useEffect(() => {
    const loadSuggestions = async () => {
      if (data.primary_category_id) {
        try {
          const categoryData = await getProfileSuggestions(data.primary_category_id);
          setSuggestions(categoryData);
          
          // Set recommended industries if none selected
          if (data.industries_of_interest.length === 0 && categoryData?.industry_recommendations) {
            form.setValue('industries_of_interest', categoryData.industry_recommendations);
          }
        } catch (error) {
          console.error('Error loading suggestions:', error);
        }
      }
    };

    loadSuggestions();
  }, [data.primary_category_id]); // Removed getProfileSuggestions from deps

  // Filter suggested skills based on input
  useEffect(() => {
    if (suggestions?.suggested_skills && newSkill.length > 0) {
      const currentSkills = form.getValues('skills');
      const filtered = suggestions.suggested_skills.filter(skill =>
        skill.toLowerCase().includes(newSkill.toLowerCase()) &&
        !currentSkills.includes(skill)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  }, [newSkill, suggestions]); // Removed form.watch from deps

  const addSkill = (skill: string) => {
    const currentSkills = form.getValues('skills');
    if (!currentSkills.includes(skill)) {
      form.setValue('skills', [...currentSkills, skill]);
      setNewSkill('');
      setFilteredSkills([]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills');
    form.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addSuggestedSkill = (skill: string) => {
    addSkill(skill);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newSkill.trim()) {
        addSkill(newSkill.trim());
      }
    }
  };

  const onSubmit = (formData: SkillsExperienceFormData) => {
    updateData(formData);
    onNext();
  };

  const toggleIndustry = (industryId: string) => {
    const current = form.getValues('industries_of_interest');
    const updated = current.includes(industryId)
      ? current.filter(id => id !== industryId)
      : [...current, industryId];
    form.setValue('industries_of_interest', updated);
  };

  const currentSkills = form.watch('skills');
  const remainingSuggestedSkills = suggestions?.suggested_skills?.filter(
    skill => !currentSkills.includes(skill)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Habilidades y Experiencia
        </h2>
        <p className="text-muted-foreground">
          Muestra tus competencias y áreas de interés profesional
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Habilidades Técnicas y Profesionales
              </CardTitle>
              <CardDescription>
                Agrega las habilidades que te definen como profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Skill Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Ej: JavaScript, Marketing Digital, CRM..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    
                    {/* Skill Suggestions Dropdown */}
                    {filteredSkills.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg">
                        {filteredSkills.slice(0, 5).map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                            onClick={() => addSuggestedSkill(skill)}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => newSkill.trim() && addSkill(newSkill.trim())}
                    disabled={!newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Suggested Skills */}
                {remainingSuggestedSkills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="h-4 w-4" />
                      Habilidades sugeridas para tu área:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {remainingSuggestedSkills.slice(0, 8).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => addSuggestedSkill(skill)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Skills */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tus Habilidades ({field.value.length}/20)</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((skill, index) => (
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
                    <FormDescription>
                      Mínimo 3 habilidades. Incluye tanto técnicas como soft skills.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Industries of Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Industrias de Interés
              </CardTitle>
              <CardDescription>
                Selecciona las industrias donde te gustaría trabajar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="industries_of_interest"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {industries.map((industry) => (
                        <div
                          key={industry.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            field.value.includes(industry.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => toggleIndustry(industry.id)}
                        >
                          <Checkbox
                            checked={field.value.includes(industry.id)}
                            onCheckedChange={() => {}} // Prevent double calls
                          />
                          <div className="flex-1">
                            <p className="font-medium">{industry.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {industry.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      Selecciona las industrias donde tienes experiencia o interés en trabajar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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