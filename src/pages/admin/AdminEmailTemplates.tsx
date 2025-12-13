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

    // Estilos que replican exactamente los templates de React Email
    const emailStyles = {
      container: { maxWidth: '600px', margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif" },
      headerSection: { padding: '20px 30px', borderBottom: '2px solid #f0f0f0' },
      h1: { color: '#1976d2', fontSize: '28px', fontWeight: 'bold', margin: '0 0 15px 0' },
      h2: { color: '#1a1a1a', fontSize: '20px', fontWeight: '600', margin: '0' },
      contentSection: { padding: '30px' },
      text: { color: '#555', fontSize: '16px', lineHeight: '1.6', margin: '0 0 20px 0' },
      textBold: { color: '#1a1a1a', fontWeight: '600' as const },
      listItem: { color: '#555', fontSize: '16px', lineHeight: '1.8', margin: '0 0 8px 0', paddingLeft: '5px' },
      button: { backgroundColor: '#1976d2', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold' as const, textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '14px 30px', marginTop: '20px', marginBottom: '20px' },
      signature: { color: '#555', fontSize: '16px', lineHeight: '1.6', marginTop: '30px' },
      footer: { padding: '20px 30px', borderTop: '2px solid #f0f0f0', textAlign: 'center' as const },
      footerText: { color: '#888', fontSize: '14px', margin: '0' },
    };

    // Extraer nombre del greeting o heading
    const extractName = () => {
      if (content.greeting) {
        return content.greeting.replace(/^Hola\s*/i, '').replace(/,\s*$/, '').trim() || 'Usuario';
      }
      // Fallback a heading si no hay greeting (para templates de auth)
      if (content.heading) {
        return content.heading;
      }
      return 'Usuario';
    };

    // Determinar si usar greeting o heading como saludo
    const getGreeting = () => {
      if (content.greeting) {
        return `Hola ${extractName()},`;
      }
      if (content.heading) {
        return content.heading;
      }
      return 'Hola Usuario,';
    };

    // Detectar si es un step (step1, step2, etc.) - formato legacy
    const isStepField = (key: string) => /^step\d+$/.test(key);
    
    // Obtener steps en formato legacy (step1, step2, etc.)
    const getLegacySteps = () => {
      return Object.entries(content)
        .filter(([key]) => isStepField(key))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, value]) => value as string);
    };

    // Verificar si hay steps en formato array de objetos
    const hasArraySteps = content.steps && Array.isArray(content.steps);
    const legacySteps = getLegacySteps();

    // Renderizar step en formato legacy (string)
    const renderLegacyStep = (step: string, idx: number) => {
      const parts = step.split(':');
      const title = parts[0];
      const description = parts.slice(1).join(':').trim();
      
      return (
        <p key={idx} style={emailStyles.listItem}>
          <span style={{ color: '#1976d2', marginRight: '8px' }}>✓</span>
          {description ? (
            <>
              <strong>{title}:</strong> {description}
            </>
          ) : (
            <span>{title}</span>
          )}
        </p>
      );
    };

    // Renderizar step en formato array de objetos {title, description, icon}
    const renderArrayStep = (step: { title: string; description: string; icon?: string }, idx: number) => {
      return (
        <p key={idx} style={emailStyles.listItem}>
          <span style={{ color: '#1976d2', marginRight: '8px' }}>{step.icon || '✓'}</span>
          <strong>{step.title}:</strong> {step.description}
        </p>
      );
    };

    // Check if this is the company-invitation template (special layout)
    const isInvitationTemplate = selectedTemplate?.id === 'company-invitation';

    if (isInvitationTemplate) {
      return (
        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
          <div className="bg-white max-w-xl mx-auto rounded-lg shadow-lg overflow-hidden" style={emailStyles.container}>
            {/* Invitation Header with gradient */}
            <div style={{ 
              background: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)', 
              padding: '40px 20px', 
              textAlign: 'center' as const,
              borderRadius: '10px 10px 0 0'
            }}>
              <h1 style={{ color: 'white', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>
                {content.greeting || '¡Has sido invitado!'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: '10px 0 0 0', fontSize: '16px' }}>
                TalentoDigital - Plataforma de Gestión de Talento
              </p>
            </div>
            
            <div style={{ padding: '40px 30px', backgroundColor: 'white' }}>
              <h2 style={{ color: '#333', marginTop: '0', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
                Invitación para unirte como ADMINISTRADOR
              </h2>
              
              <p style={emailStyles.text}>Hola,</p>
              <p style={emailStyles.text}>{content.intro || '{{invited_by}} te ha invitado a unirte...'}</p>
              
              {/* Capabilities Box */}
              <div style={{ 
                margin: '30px 0', 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px', 
                borderLeft: '4px solid #8B5CF6' 
              }}>
                <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
                  {content.admin_title || '¿Qué puedes hacer como Administrador?'}
                </h3>
                <p style={{ margin: '0', color: '#555', fontSize: '14px' }}>
                  {content.admin_intro || 'Tendrás acceso completo, incluyendo:'}
                </p>
                <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#555' }}>
                  {(content.admin_capabilities || [
                    'Crear y gestionar oportunidades de trabajo',
                    'Revisar y gestionar aplicaciones',
                    'Remover miembros del equipo',
                    'Editar permisos de otros usuarios',
                    'Gestionar configuraciones de la empresa',
                    'Acceder a reportes y análisis'
                  ]).map((item: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '4px', fontSize: '14px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <span style={{ 
                  display: 'inline-block', 
                  backgroundColor: '#8B5CF6', 
                  color: 'white', 
                  padding: '15px 30px', 
                  textDecoration: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  marginRight: '10px' 
                }}>
                  {content.button_accept_text || 'Aceptar Invitación'}
                </span>
                <span style={{ 
                  display: 'inline-block', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  padding: '15px 30px', 
                  textDecoration: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 'bold' 
                }}>
                  {content.button_decline_text || 'Rechazar'}
                </span>
              </div>

              <hr style={{ marginTop: '40px', border: 'none', borderTop: '1px solid #e9ecef' }} />

              {/* Help Section */}
              <p style={{ marginTop: '20px', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#6c757d' }}>
                {content.help_title || '¿Necesitas ayuda?'}
              </p>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6c757d' }}>
                {content.help_text || 'Si tienes problemas para aceptar la invitación...'}
              </p>
              <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                {content.footer_text || 'Esta invitación fue enviada desde TalentoDigital...'}
              </p>
            </div>

            {/* Footer */}
            <div style={emailStyles.footer}>
              <p style={emailStyles.footerText}>© 2024 TalentoDigital. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      );
    }

    // Standard template layout
    return (
      <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
        <div className="bg-white max-w-xl mx-auto rounded-lg shadow-lg overflow-hidden" style={emailStyles.container}>
          {/* Email Header - Replica Header.tsx */}
          <div style={emailStyles.headerSection}>
            <h1 style={emailStyles.h1}>TalentoDigital</h1>
            <h2 style={emailStyles.h2}>{getGreeting()}</h2>
          </div>
          
          {/* Email Body */}
          <div style={emailStyles.contentSection}>
            {/* Intro */}
            {content.intro && (
              <p style={emailStyles.text}>{content.intro}</p>
            )}

            {/* Urgency text - para onboarding-reminder */}
            {content.urgency_text && (
              <p style={{ ...emailStyles.text, fontWeight: '600', color: '#e65100' }}>
                ⚠️ {content.urgency_text}
              </p>
            )}

            {/* Steps Title */}
            {content.steps_title && (hasArraySteps || legacySteps.length > 0) && (
              <p style={{ ...emailStyles.text, ...emailStyles.textBold }}>{content.steps_title}</p>
            )}

            {/* Steps - formato array de objetos */}
            {hasArraySteps && (
              <div style={{ marginBottom: '20px' }}>
                {content.steps.map((step: { title: string; description: string; icon?: string }, idx: number) => 
                  renderArrayStep(step, idx)
                )}
              </div>
            )}

            {/* Steps - formato legacy (step1, step2, etc.) */}
            {!hasArraySteps && legacySteps.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                {legacySteps.map((step, idx) => renderLegacyStep(step, idx))}
              </div>
            )}

            {/* Benefits (array format) */}
            {content.benefits && Array.isArray(content.benefits) && (
              <div style={{ marginBottom: '20px' }}>
                {content.benefits_title && (
                  <p style={{ ...emailStyles.text, ...emailStyles.textBold }}>{content.benefits_title}</p>
                )}
                {content.benefits.map((benefit: string, idx: number) => (
                  <p key={idx} style={emailStyles.listItem}>
                    <span style={{ color: '#1976d2', marginRight: '8px' }}>✓</span>
                    {benefit}
                  </p>
                ))}
              </div>
            )}

            {/* Tip - para profile-view */}
            {content.tip && (
              <p style={{ 
                ...emailStyles.text, 
                backgroundColor: '#f5f5f5', 
                padding: '12px 16px', 
                borderRadius: '6px', 
                borderLeft: '3px solid #1976d2' 
              }}>
                💡 {content.tip}
              </p>
            )}

            {/* Botón - Replica NotificationButton.tsx */}
            {content.button_text && (
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <span style={emailStyles.button}>
                  {content.button_text}
                </span>
              </div>
            )}

            {/* Link instruction - para confirm-signup, magic-link, reset-password */}
            {content.link_instruction && (
              <p style={{ ...emailStyles.text, fontSize: '14px', color: '#666' }}>
                {content.link_instruction}
              </p>
            )}

            {/* Closing text */}
            {content.closing && (
              <p style={emailStyles.text}>{content.closing}</p>
            )}

            {/* Signature */}
            {content.signature && (
              <p style={emailStyles.signature}>
                {content.signature.split('\n').map((line: string, idx: number) => (
                  <span key={idx}>
                    {idx === 0 ? <strong>{line}</strong> : line}
                    {idx < content.signature.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            )}

            {/* Security notice */}
            {content.security_notice && (
              <p style={{ ...emailStyles.text, fontSize: '14px', color: '#888' }}>{content.security_notice}</p>
            )}

            {/* Expiry notice */}
            {content.expiry_notice && (
              <p style={{ ...emailStyles.text, fontSize: '14px', color: '#888' }}>{content.expiry_notice}</p>
            )}

            {/* Help text */}
            {content.help_text && (
              <p style={{ ...emailStyles.text, fontSize: '14px', color: '#888', marginTop: '20px' }}>
                {content.help_text}
              </p>
            )}
          </div>

          {/* Email Footer - Replica Footer.tsx */}
          <div style={emailStyles.footer}>
            <p style={emailStyles.footerText}>
              {content.footer_text || '© 2024 TalentoDigital. Todos los derechos reservados.'}
            </p>
            {/* Footer link text */}
            {content.footer_link_text && (
              <p style={{ ...emailStyles.footerText, marginTop: '8px' }}>
                <span style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}>
                  {content.footer_link_text}
                </span>
              </p>
            )}
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
