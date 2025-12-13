import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Edit, 
  Save, 
  X, 
  Eye, 
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  content: Record<string, any>;
  is_active: boolean | null;
  updated_at: string | null;
  updated_by: string | null;
}

const AdminEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'edit'>('list');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      // Transform data to ensure content is always an object
      const transformedData = (data || []).map(template => ({
        ...template,
        content: (template.content as Record<string, any>) || {},
        is_active: template.is_active ?? true
      }));
      setTemplates(transformedData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Error al cargar los templates de email');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditedTemplate(JSON.parse(JSON.stringify(template)));
    setActiveView('edit');
  };

  const handleSave = async () => {
    if (!editedTemplate) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: editedTemplate.subject,
          content: editedTemplate.content,
          is_active: editedTemplate.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editedTemplate.id);

      if (error) throw error;

      toast.success('Template guardado correctamente');
      await loadTemplates();
      setSelectedTemplate(editedTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error al guardar el template');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTemplate(selectedTemplate ? JSON.parse(JSON.stringify(selectedTemplate)) : null);
  };

  const handleBack = () => {
    setActiveView('list');
    setSelectedTemplate(null);
    setEditedTemplate(null);
  };

  const updateContentField = (key: string, value: any) => {
    if (!editedTemplate) return;
    setEditedTemplate({
      ...editedTemplate,
      content: {
        ...editedTemplate.content,
        [key]: value
      }
    });
  };

  const getCategoryBadge = (id: string) => {
    if (['magic-link', 'confirm-signup', 'reset-password'].includes(id)) {
      return <Badge variant="outline" className="text-blue-600 border-blue-300">Autenticación</Badge>;
    }
    if (['welcome-talent', 'welcome-business'].includes(id)) {
      return <Badge variant="outline" className="text-green-600 border-green-300">Bienvenida</Badge>;
    }
    return <Badge variant="outline" className="text-purple-600 border-purple-300">Notificación</Badge>;
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContentEditor = (content: Record<string, any>) => {
    const fields = Object.entries(content);
    
    return (
      <div className="space-y-4">
        {fields.map(([key, value]) => {
          // Skip complex nested objects for now (like steps array)
          if (Array.isArray(value)) {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </Label>
                <div className="space-y-2">
                  {value.map((item, idx) => (
                    <Card key={idx} className="p-3 bg-muted/50">
                      {typeof item === 'object' ? (
                        <div className="space-y-2">
                          {Object.entries(item).map(([itemKey, itemValue]) => (
                            <div key={itemKey}>
                              <Label className="text-xs text-muted-foreground capitalize">
                                {itemKey}
                              </Label>
                              <Input
                                value={String(itemValue)}
                                onChange={(e) => {
                                  const newArray = [...value];
                                  newArray[idx] = { ...item, [itemKey]: e.target.value };
                                  updateContentField(key, newArray);
                                }}
                                className="mt-1"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Input
                          value={String(item)}
                          onChange={(e) => {
                            const newArray = [...value];
                            newArray[idx] = e.target.value;
                            updateContentField(key, newArray);
                          }}
                        />
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          }

          const isLongText = typeof value === 'string' && (
            key.includes('intro') || 
            key.includes('description') || 
            key.includes('text') ||
            key.includes('signature') ||
            value.length > 80
          );

          return (
            <div key={key} className="space-y-2">
              <Label className="text-sm font-medium capitalize">
                {key.replace(/_/g, ' ')}
              </Label>
              {isLongText ? (
                <Textarea
                  value={String(value)}
                  onChange={(e) => updateContentField(key, e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              ) : (
                <Input
                  value={String(value)}
                  onChange={(e) => updateContentField(key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPreview = () => {
    if (!editedTemplate) return null;
    const content = editedTemplate.content;

    return (
      <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
        <div className="bg-white dark:bg-slate-800 max-w-xl mx-auto rounded-lg shadow-lg overflow-hidden">
          {/* Email Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">
              {content.title || '🚀 TalentoDigital'}
            </h1>
          </div>
          
          {/* Email Body */}
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {content.heading || 'Título del email'}
            </h2>
            
            {content.greeting && (
              <p className="text-muted-foreground">{content.greeting}</p>
            )}
            
            {content.intro && (
              <p className="text-muted-foreground">{content.intro}</p>
            )}

            {content.steps && Array.isArray(content.steps) && (
              <div className="space-y-3 my-4">
                <p className="font-medium">{content.steps_title || 'Pasos:'}</p>
                {content.steps.map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {content.benefits && Array.isArray(content.benefits) && (
              <div className="space-y-2 my-4">
                <p className="font-medium">{content.benefits_title || 'Beneficios:'}</p>
                <ul className="list-disc list-inside space-y-1">
                  {content.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {content.button_text && (
              <div className="text-center my-6">
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium">
                  {content.button_text}
                </button>
              </div>
            )}

            {content.security_notice && (
              <p className="text-sm text-muted-foreground">{content.security_notice}</p>
            )}

            {content.expiry_notice && (
              <p className="text-sm text-muted-foreground">{content.expiry_notice}</p>
            )}

            {content.signature && (
              <p className="text-muted-foreground whitespace-pre-line mt-4">
                {content.signature}
              </p>
            )}
          </div>

          {/* Email Footer */}
          <div className="border-t p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {content.footer_text || '© 2024 TalentoDigital'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {activeView === 'edit' && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            {activeView === 'list' ? 'Templates de Email' : editedTemplate?.name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {activeView === 'list' 
              ? 'Gestiona y personaliza los textos de los emails del sistema'
              : editedTemplate?.description
            }
          </p>
        </div>
      </div>

      {activeView === 'list' ? (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                    {template.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    {getCategoryBadge(template.id)}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron templates</p>
            </div>
          )}
        </>
      ) : editedTemplate && (
        <div className="space-y-6">
          {/* Template Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <Label>Asunto del email</Label>
                  <Input
                    value={editedTemplate.subject}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
                    className="max-w-xl"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="is-active">Template activo</Label>
                  <Switch
                    id="is-active"
                    checked={editedTemplate.is_active ?? true}
                    onCheckedChange={(checked) => setEditedTemplate({ ...editedTemplate, is_active: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor and Preview Tabs */}
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="editor" className="gap-2">
                <Edit className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Vista previa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenido del email</CardTitle>
                  <CardDescription>
                    Edita los textos que aparecerán en el email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    {renderContentEditor(editedTemplate.content)}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vista previa</CardTitle>
                  <CardDescription>
                    Así se verá el email (aproximado)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderPreview()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar cambios
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Descartar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplates;
