import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, Edit2, ArrowLeft, Building2, GraduationCap, User, Briefcase, Megaphone, ChevronDown, Info, Eye, Send } from 'lucide-react';
import { MESSAGE_VARIABLES, VARIABLES_BY_TRIGGER, RECIPIENT_NOTES, generatePreview } from '@/utils/messageVariables';
import { TestAutomatedMessageModal } from './TestAutomatedMessageModal';
interface AutomatedMessage {
  id: string;
  trigger_type: string;
  sender_id: string;
  message_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

const TRIGGER_OPTIONS = [
  { value: 'new_company', label: 'Nueva empresa', icon: Building2, description: 'Cuando una nueva empresa se registra' },
  { value: 'new_academy', label: 'Nueva Academia', icon: GraduationCap, description: 'Cuando una nueva academia se registra' },
  { value: 'new_talent', label: 'Nuevo talento', icon: User, description: 'Cuando un nuevo talento se registra' },
  { value: 'first_opportunity', label: 'Primera oportunidad publicada', icon: Briefcase, description: 'Cuando una empresa publica su primera oportunidad' },
  { value: 'new_opportunity', label: 'Nueva oportunidad publicada', icon: Megaphone, description: 'Cuando se publica cualquier nueva oportunidad' },
];

interface AutomatedMessagesConfigProps {
  onClose: () => void;
}

export const AutomatedMessagesConfig = ({ onClose }: AutomatedMessagesConfigProps) => {
  const [messages, setMessages] = useState<AutomatedMessage[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AutomatedMessage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [variablesOpen, setVariablesOpen] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [testingMessage, setTestingMessage] = useState<AutomatedMessage | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    trigger_type: '',
    sender_id: '',
    message_content: '',
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load automated messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('automated_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Load admin users
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      if (adminRoles && adminRoles.length > 0) {
        const adminIds = adminRoles.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', adminIds);

        if (profilesError) throw profilesError;
        setAdminUsers(
          (profiles || []).map(p => ({
            id: p.user_id,
            full_name: p.full_name || 'Admin',
            avatar_url: p.avatar_url || undefined,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenForm = (message?: AutomatedMessage) => {
    if (message) {
      setEditingMessage(message);
      setFormData({
        trigger_type: message.trigger_type,
        sender_id: message.sender_id,
        message_content: message.message_content,
        is_active: message.is_active,
      });
    } else {
      setEditingMessage(null);
      setFormData({
        trigger_type: '',
        sender_id: '',
        message_content: '',
        is_active: true,
      });
    }
    setShowPreview(false);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMessage(null);
    setShowPreview(false);
    setFormData({
      trigger_type: '',
      sender_id: '',
      message_content: '',
      is_active: true,
    });
  };

  const handleSave = async () => {
    if (!formData.trigger_type || !formData.sender_id || !formData.message_content.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingMessage) {
        const { error } = await supabase
          .from('automated_messages')
          .update({
            trigger_type: formData.trigger_type,
            sender_id: formData.sender_id,
            message_content: formData.message_content,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMessage.id);

        if (error) throw error;
        toast.success('Mensaje automatizado actualizado');
      } else {
        const { error } = await supabase
          .from('automated_messages')
          .insert({
            trigger_type: formData.trigger_type,
            sender_id: formData.sender_id,
            message_content: formData.message_content,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast.success('Mensaje automatizado creado');
      }

      handleCloseForm();
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error al guardar el mensaje automatizado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automated_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Mensaje automatizado eliminado');
      setDeleteConfirmId(null);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleToggleActive = async (message: AutomatedMessage) => {
    try {
      const { error } = await supabase
        .from('automated_messages')
        .update({ 
          is_active: !message.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const getTriggerInfo = (triggerType: string) => {
    return TRIGGER_OPTIONS.find(t => t.value === triggerType);
  };

  const getSenderName = (senderId: string) => {
    const admin = adminUsers.find(a => a.id === senderId);
    return admin?.full_name || 'Admin';
  };

  const insertVariable = (variableKey: string) => {
    const variable = MESSAGE_VARIABLES[variableKey as keyof typeof MESSAGE_VARIABLES];
    if (!variable) return;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.message_content;
      const newText = text.substring(0, start) + variable.key + text.substring(end);
      setFormData(prev => ({ ...prev, message_content: newText }));
      
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.key.length, start + variable.key.length);
      }, 0);
    } else {
      setFormData(prev => ({ ...prev, message_content: prev.message_content + variable.key }));
    }
  };

  const getAvailableVariables = () => {
    if (!formData.trigger_type) return [];
    return VARIABLES_BY_TRIGGER[formData.trigger_type] || [];
  };

  const getRecipientNote = () => {
    if (!formData.trigger_type) return null;
    return RECIPIENT_NOTES[formData.trigger_type];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Mensajes Automatizados</h2>
            <p className="text-sm text-muted-foreground">Configura mensajes que se envían automáticamente</p>
          </div>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Crear nuevo
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No hay mensajes automatizados</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer mensaje automatizado para dar la bienvenida a nuevos usuarios
            </p>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear nuevo
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.map((message) => {
              const triggerInfo = getTriggerInfo(message.trigger_type);
              const TriggerIcon = triggerInfo?.icon || Megaphone;
              const recipientNote = RECIPIENT_NOTES[message.trigger_type];
              
              return (
                <Card key={message.id} className={!message.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <TriggerIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{triggerInfo?.label || message.trigger_type}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {triggerInfo?.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={message.is_active ? 'default' : 'secondary'}>
                          {message.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Switch
                          checked={message.is_active}
                          onCheckedChange={() => handleToggleActive(message)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recipientNote && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{recipientNote}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Remitente</p>
                        <p className="text-sm font-medium">{getSenderName(message.sender_id)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Mensaje</p>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                          {message.message_content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setTestingMessage(message)}
                          disabled={!message.is_active}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Probar
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(message.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenForm(message)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMessage ? 'Editar mensaje automatizado' : 'Nuevo mensaje automatizado'}
            </DialogTitle>
            <DialogDescription>
              Configura cuándo y qué mensaje se enviará automáticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger (Evento)</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cuándo enviar el mensaje" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Recipient Note */}
              {getRecipientNote() && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/50 border border-border p-2.5 rounded-md">
                  <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                  <span>{getRecipientNote()}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Remitente</Label>
              <Select
                value={formData.sender_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sender_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="¿Quién enviará el mensaje?" />
                </SelectTrigger>
                <SelectContent>
                  {adminUsers.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                ref={textareaRef}
                value={formData.message_content}
                onChange={(e) => setFormData(prev => ({ ...prev, message_content: e.target.value }))}
                placeholder="Escribe el mensaje que se enviará automáticamente..."
                rows={5}
              />
              
              {/* Variables Section */}
              {formData.trigger_type && (
                <Collapsible open={variablesOpen} onOpenChange={setVariablesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                      <span className="text-xs">Variables disponibles</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${variablesOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <p className="text-xs text-muted-foreground mb-2">
                        Haz clic en una variable para insertarla en el mensaje:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableVariables().map((varKey) => {
                          const variable = MESSAGE_VARIABLES[varKey];
                          return (
                            <Button
                              key={varKey}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-auto py-1.5 px-2 text-xs"
                              onClick={() => insertVariable(varKey)}
                            >
                              <code className="bg-primary/10 px-1 rounded mr-1.5">{variable.key}</code>
                              <span className="text-muted-foreground">{variable.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Preview Toggle */}
              {formData.message_content && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    {showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
                  </Button>
                  
                  {showPreview && (
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <p className="text-xs text-muted-foreground mb-2">Vista previa con datos de ejemplo:</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {generatePreview(formData.message_content)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Activar inmediatamente</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingMessage ? 'Guardar cambios' : 'Crear mensaje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar mensaje automatizado?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El mensaje dejará de enviarse automáticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Automated Message Modal */}
      {testingMessage && (
        <TestAutomatedMessageModal
          isOpen={!!testingMessage}
          onClose={() => setTestingMessage(null)}
          message={testingMessage}
        />
      )}
    </div>
  );
};
