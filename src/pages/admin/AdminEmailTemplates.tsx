import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Save, 
  ArrowLeft,
  Search,
  Loader2,
  Eye,
  Edit,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailTemplateCard } from '@/components/admin/EmailTemplateCard';
import { EmailRichTextEditor } from '@/components/admin/EmailTemplateEditor';
import { EmailPreview } from '@/components/admin/EmailPreview';

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

interface UnifiedContent {
  header_enabled: boolean;
  header_title: string;
  header_color1: string;
  header_color2: string;
  body_content: string;
  button_enabled: boolean;
  button_text: string;
  button_link: string;
  secondary_enabled: boolean;
  secondary_content: string;
  footer_text: string;
  footer_link: string;
}

// Convert legacy content to unified format
const convertToUnifiedContent = (content: Record<string, any>): UnifiedContent => {
  // Try to extract body content from various legacy fields
  let bodyContent = '';
  if (content.intro) bodyContent += `<p>${content.intro}</p>`;
  if (content.greeting) bodyContent = `<p>${content.greeting}</p>` + bodyContent;
  if (content.steps && Array.isArray(content.steps)) {
    bodyContent += content.steps.map((s: any) => 
      `<p><strong>${s.icon || '✓'} ${s.title}:</strong> ${s.description}</p>`
    ).join('');
  }
  if (content.benefits && Array.isArray(content.benefits)) {
    bodyContent += content.benefits.map((b: string) => `<p>✓ ${b}</p>`).join('');
  }
  if (content.signature) bodyContent += `<p>${content.signature}</p>`;

  // Check for secondary content
  let secondaryContent = '';
  if (content.security_notice) secondaryContent += `<p>${content.security_notice}</p>`;
  if (content.expiry_notice) secondaryContent += `<p>${content.expiry_notice}</p>`;
  if (content.help_text) secondaryContent += `<p>${content.help_text}</p>`;

  return {
    header_enabled: content.header_enabled ?? true,
    header_title: content.header_title || content.title || 'TalentoDigital',
    header_color1: content.header_color1 || '#8B5CF6',
    header_color2: content.header_color2 || '#D946EF',
    body_content: content.body_content || bodyContent || '<p>Contenido del email...</p>',
    button_enabled: content.button_enabled ?? !!(content.button_text),
    button_text: content.button_text || '',
    button_link: content.button_link || '{{action_url}}',
    secondary_enabled: content.secondary_enabled ?? !!(secondaryContent),
    secondary_content: content.secondary_content || secondaryContent,
    footer_text: content.footer_text || '© 2025 TalentoDigital - Conectamos talento con oportunidades',
    footer_link: content.footer_link || 'https://app.talentodigital.io',
  };
};

const AdminEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'edit'>('list');
  
  // Editor state
  const [subject, setSubject] = useState('');
  const [unifiedContent, setUnifiedContent] = useState<UnifiedContent>({
    header_enabled: true,
    header_title: 'TalentoDigital',
    header_color1: '#8B5CF6',
    header_color2: '#D946EF',
    body_content: '',
    button_enabled: false,
    button_text: '',
    button_link: '',
    secondary_enabled: false,
    secondary_content: '',
    footer_text: '© 2025 TalentoDigital - Conectamos talento con oportunidades',
    footer_link: 'https://app.talentodigital.io',
  });

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
    setSubject(template.subject);
    setUnifiedContent(convertToUnifiedContent(template.content));
    setActiveView('edit');
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      
      // Save the unified content format
      const newContent = {
        ...unifiedContent,
        // Keep some legacy fields for backwards compatibility with edge functions
        greeting: unifiedContent.body_content.match(/<p>([^<]*)<\/p>/)?.[1] || '',
        button_text: unifiedContent.button_text,
        footer_text: unifiedContent.footer_text,
      };

      const { error } = await supabase
        .from('email_templates')
        .update({
          subject,
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      toast.success('Template guardado correctamente');
      await loadTemplates();
      
      // Update local state
      setSelectedTemplate({
        ...selectedTemplate,
        subject,
        content: newContent,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error al guardar el template');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setActiveView('list');
    setSelectedTemplate(null);
  };

  const updateContent = (key: keyof UnifiedContent, value: any) => {
    setUnifiedContent(prev => ({ ...prev, [key]: value }));
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // List View
  if (activeView === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Templates de Email
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y personaliza los templates de email de la plataforma
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Templates Grid */}
        <div className="grid gap-3">
          {filteredTemplates.map((template) => (
            <EmailTemplateCard
              key={template.id}
              id={template.id}
              name={template.name}
              subject={template.subject}
              description={template.description}
              isActive={template.is_active || false}
              onClick={() => handleSelectTemplate(template)}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron templates que coincidan con la búsqueda
          </div>
        )}
      </div>
    );
  }

  // Edit View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{selectedTemplate?.name}</h1>
            <p className="text-sm text-muted-foreground">{selectedTemplate?.description}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Cambios
        </Button>
      </div>

      {/* Editor Tabs */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="editor" className="gap-2">
            <Edit className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <div className="space-y-6 max-w-3xl">
            {/* Subject */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Asunto del Email</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Asunto del email..."
                />
              </CardContent>
            </Card>

            {/* Header Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Header con Gradiente</CardTitle>
                  <Switch
                    checked={unifiedContent.header_enabled}
                    onCheckedChange={(v) => updateContent('header_enabled', v)}
                  />
                </div>
              </CardHeader>
              {unifiedContent.header_enabled && (
                <CardContent className="space-y-4">
                  <div>
                    <Label>Título del Header</Label>
                    <Input
                      value={unifiedContent.header_title}
                      onChange={(e) => updateContent('header_title', e.target.value)}
                      placeholder="TalentoDigital"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Color 1 (Inicio)</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={unifiedContent.header_color1}
                          onChange={(e) => updateContent('header_color1', e.target.value)}
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={unifiedContent.header_color1}
                          onChange={(e) => updateContent('header_color1', e.target.value)}
                          placeholder="#8B5CF6"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Color 2 (Fin)</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={unifiedContent.header_color2}
                          onChange={(e) => updateContent('header_color2', e.target.value)}
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={unifiedContent.header_color2}
                          onChange={(e) => updateContent('header_color2', e.target.value)}
                          placeholder="#D946EF"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Body Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cuerpo del Email</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailRichTextEditor
                  value={unifiedContent.body_content}
                  onChange={(v) => updateContent('body_content', v)}
                  placeholder="Escribe el contenido principal del email..."
                  minHeight={200}
                />
              </CardContent>
            </Card>

            {/* Button Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Botón de Acción</CardTitle>
                  <Switch
                    checked={unifiedContent.button_enabled}
                    onCheckedChange={(v) => updateContent('button_enabled', v)}
                  />
                </div>
              </CardHeader>
              {unifiedContent.button_enabled && (
                <CardContent className="space-y-4">
                  <div>
                    <Label>Texto del Botón</Label>
                    <Input
                      value={unifiedContent.button_text}
                      onChange={(e) => updateContent('button_text', e.target.value)}
                      placeholder="Confirmar mi cuenta"
                    />
                  </div>
                  <div>
                    <Label>Link del Botón</Label>
                    <Input
                      value={unifiedContent.button_link}
                      onChange={(e) => updateContent('button_link', e.target.value)}
                      placeholder="{{action_url}}"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usa {"{{action_url}}"} para el enlace dinámico
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Secondary Content */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Segunda Sección de Texto</CardTitle>
                  <Switch
                    checked={unifiedContent.secondary_enabled}
                    onCheckedChange={(v) => updateContent('secondary_enabled', v)}
                  />
                </div>
              </CardHeader>
              {unifiedContent.secondary_enabled && (
                <CardContent>
                  <EmailRichTextEditor
                    value={unifiedContent.secondary_content}
                    onChange={(v) => updateContent('secondary_content', v)}
                    placeholder="Contenido secundario (avisos, notas, etc.)..."
                    minHeight={120}
                  />
                </CardContent>
              )}
            </Card>

            {/* Footer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Texto del Footer</Label>
                  <Input
                    value={unifiedContent.footer_text}
                    onChange={(e) => updateContent('footer_text', e.target.value)}
                    placeholder="© 2025 TalentoDigital..."
                  />
                </div>
                <div>
                  <Label>Link del Footer</Label>
                  <Input
                    value={unifiedContent.footer_link}
                    onChange={(e) => updateContent('footer_link', e.target.value)}
                    placeholder="https://app.talentodigital.io"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <EmailPreview
            subject={subject}
            headerEnabled={unifiedContent.header_enabled}
            headerTitle={unifiedContent.header_title}
            headerColor1={unifiedContent.header_color1}
            headerColor2={unifiedContent.header_color2}
            bodyContent={unifiedContent.body_content}
            buttonEnabled={unifiedContent.button_enabled}
            buttonText={unifiedContent.button_text}
            buttonLink={unifiedContent.button_link}
            secondaryEnabled={unifiedContent.secondary_enabled}
            secondaryContent={unifiedContent.secondary_content}
            footerText={unifiedContent.footer_text}
            footerLink={unifiedContent.footer_link}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmailTemplates;
