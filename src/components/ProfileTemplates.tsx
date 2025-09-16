import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useProfessionalData } from '@/hooks/useProfessionalData';
import { 
  User, 
  Briefcase, 
  Award, 
  MapPin, 
  Star,
  Copy,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  category_id: string;
  example_data: any; // Use any for flexibility with JSON data
  suggestions: string[];
}

interface ProfileTemplatesProps {
  onApplyTemplate?: (templateData: any) => void;
  selectedCategoryId?: string;
}

export const ProfileTemplates: React.FC<ProfileTemplatesProps> = ({
  onApplyTemplate,
  selectedCategoryId
}) => {
  const [templates, setTemplates] = useState<ProfileTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { categories } = useProfessionalData();

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('profile_templates')
          .select('*')
          .order('name');

        // Filter by category if provided
        if (selectedCategoryId) {
          query = query.eq('category_id', selectedCategoryId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        setTemplates((data || []).map(template => ({
          ...template,
          description: template.description || '',
          example_data: typeof template.example_data === 'string' 
            ? JSON.parse(template.example_data) 
            : template.example_data
        })) as ProfileTemplate[]);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [selectedCategoryId]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const handleApplyTemplate = (template: ProfileTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template.example_data);
      toast.success(`Plantilla "${template.name}" aplicada`);
    } else {
      // Copy to clipboard as fallback
      navigator.clipboard.writeText(JSON.stringify(template.example_data, null, 2));
      toast.success('Datos de la plantilla copiados al portapapeles');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Plantillas de Perfil</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryName(template.category_id)}
                  </Badge>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={template.example_data.avatar_url} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              
              {/* Quick preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Briefcase className="h-3 w-3" />
                  <span className="font-medium">{template.example_data.title}</span>
                </div>
                
                {template.example_data.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{template.example_data.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span>{template.example_data.experience_level}</span>
                </div>
              </div>

              {/* Skills preview */}
              <div className="flex flex-wrap gap-1">
                {template.example_data.skills.slice(0, 3).map((skill: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                    {skill}
                  </Badge>
                ))}
                {template.example_data.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{template.example_data.skills.length - 3}
                  </Badge>
                )}
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyTemplate(template);
                }}
                className="w-full"
                size="sm"
                variant="outline"
              >
                <Copy className="h-3 w-3 mr-1" />
                Usar Plantilla
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin plantillas disponibles</h3>
            <p className="text-muted-foreground">
              No hay plantillas para la categoría seleccionada.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {selectedTemplate.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <Button
                onClick={() => handleApplyTemplate(selectedTemplate)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Aplicar Plantilla
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            
            {/* Detailed preview */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Título Profesional</h4>
                <p className="text-sm bg-muted p-2 rounded">
                  {selectedTemplate.example_data.title}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Biografía</h4>
                <ScrollArea className="h-20">
                  <p className="text-sm bg-muted p-2 rounded">
                    {selectedTemplate.example_data.bio}
                  </p>
                </ScrollArea>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Habilidades</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.example_data.skills.map((skill: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedTemplate.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Sugerencias de Personalización</h4>
                  <ul className="text-sm space-y-1">
                    {selectedTemplate.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};