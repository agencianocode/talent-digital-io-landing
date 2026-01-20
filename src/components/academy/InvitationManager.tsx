import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDraftProtection } from '@/hooks/useDraftProtection';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Plus, 
  Send,
  Copy,
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface InvitationManagerProps {
  academyId: string;
}

// Helper to format a student display name
const formatStudentName = (email: string, name?: string | null): string => {
  // If name exists and is different from the email prefix, use it
  const emailPrefix = email.split('@')[0] || '';
  if (name && name !== emailPrefix) {
    return name;
  }
  // Otherwise, format email prefix nicely
  // Capitalize words and replace underscores/dots with spaces
  return emailPrefix
    .replace(/[._-]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || email;
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InvitationManager: React.FC<InvitationManagerProps> = ({ academyId }) => {
  const [emailList, setEmailList] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [copiedActive, setCopiedActive] = useState(false);
  const [copiedGraduated, setCopiedGraduated] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Draft protection - saves form data when switching windows
  const { hasStoredDraft, restoreDraft, clearDraft, draftChecked } = useDraftProtection({
    storageKey: `invitation-manager-draft-${academyId}`,
    data: { emailList, message },
    onRestore: (data) => {
      setEmailList(data.emailList);
      setMessage(data.message);
    },
  });

  // Show restore prompt when draft is detected
  useEffect(() => {
    if (draftChecked && hasStoredDraft) {
      setShowRestorePrompt(true);
    }
  }, [draftChecked, hasStoredDraft]);

  // Generate invitation links
  const activeInviteLink = `${window.location.origin}/accept-academy-invitation?academy=${academyId}&status=enrolled`;
  const graduatedInviteLink = `${window.location.origin}/accept-academy-invitation?academy=${academyId}&status=graduated`;

  useEffect(() => {
    loadInvitations();
  }, [academyId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_students')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'active' | 'graduated') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'active') {
        setCopiedActive(true);
        setTimeout(() => setCopiedActive(false), 2000);
      } else {
        setCopiedGraduated(true);
        setTimeout(() => setCopiedGraduated(false), 2000);
      }
      toast.success('Link copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el link');
    }
  };

  const parseEmails = (text: string): { valid: string[]; invalid: string[] } => {
    const allEmails = text
      .split(/[,;\n\r\t]+/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);

    // Remove duplicates
    const uniqueEmails = [...new Set(allEmails)];

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const email of uniqueEmails) {
      if (EMAIL_REGEX.test(email)) {
        valid.push(email);
      } else {
        invalid.push(email);
      }
    }

    return { valid, invalid };
  };

  const handleSendInvitations = async () => {
    if (!emailList.trim()) return;

    const { valid: emails, invalid: invalidEmails } = parseEmails(emailList);

    if (invalidEmails.length > 0) {
      toast.warning(
        `${invalidEmails.length} email(s) con formato inválido`,
        {
          description: invalidEmails.slice(0, 3).join(', ') + (invalidEmails.length > 3 ? '...' : ''),
          duration: 5000
        }
      );
    }

    if (emails.length === 0) {
      toast.error('No se encontraron emails válidos');
      return;
    }

    try {
      setIsSending(true);
      setSendProgress(10);

      // First, check which emails already exist in this academy
      const { data: existingStudents } = await supabase
        .from('academy_students')
        .select('student_email')
        .eq('academy_id', academyId)
        .in('student_email', emails);

      const existingEmails = new Set(existingStudents?.map(s => s.student_email.toLowerCase()) || []);
      const newEmails = emails.filter(email => !existingEmails.has(email.toLowerCase()));
      const duplicateCount = emails.length - newEmails.length;

      setSendProgress(20);

      // Only insert new emails
      if (newEmails.length > 0) {
        const studentsToInsert = newEmails.map(email => ({
          academy_id: academyId,
          student_email: email,
          student_name: null,
          status: 'enrolled',
          enrollment_date: new Date().toISOString().split('T')[0]
        }));

        const { error: dbError } = await supabase
          .from('academy_students')
          .insert(studentsToInsert);

        if (dbError) {
          throw dbError;
        }
      }

      // Show info about duplicates
      if (duplicateCount > 0) {
        toast.info(`${duplicateCount} email(s) ya estaban registrados`, { duration: 3000 });
      }

      setSendProgress(40);

      // If no new emails to send, just reload and finish
      if (newEmails.length === 0) {
        setSendProgress(100);
        toast.warning('Todos los emails ya estaban registrados en la academia');
        setEmailList('');
        loadInvitations();
        return;
      }

      // Get academy name for the email
      const { data: academyData } = await supabase
        .from('companies')
        .select('name')
        .eq('id', academyId)
        .single();

      setSendProgress(50);

      // Send invitation emails via Edge Function (only to new emails)
      console.log('📧 Calling send-academy-invitations edge function...', {
        emailCount: newEmails.length,
        academyId,
        academyName: academyData?.name
      });

      const { data, error: emailError } = await supabase.functions.invoke(
        'send-academy-invitations',
        {
          body: {
            emails: newEmails,
            academyId,
            academyName: academyData?.name || 'Tu Academia',
            customMessage: message.trim() || undefined
          }
        }
      );

      setSendProgress(90);

      console.log('📧 Edge function response:', { data, emailError });

      if (emailError) {
        console.error('❌ Error sending emails:', emailError);
        toast.error(
          `Error al enviar emails`,
          {
            description: 'Los estudiantes fueron agregados a la base de datos, pero no se enviaron los emails de invitación.',
            duration: 6000
          }
        );
      } else if (data) {
        setSendProgress(100);
        
        if (data.failed > 0) {
          // Partial success
          toast.warning(
            `${data.sent}/${data.total} emails enviados`,
            {
              description: `${data.failed} email(s) no pudieron ser enviados. Los estudiantes fueron agregados a la base de datos.`,
              duration: 6000
            }
          );
        } else {
          // Full success
          toast.success(
            `🎉 ¡${data.sent} invitación(es) enviada(s)!`,
            {
              description: newEmails.length > 3 
                ? `Enviado a: ${newEmails.slice(0, 3).join(', ')}... y ${newEmails.length - 3} más`
                : `Enviado a: ${newEmails.join(', ')}`,
              duration: 5000
            }
          );
        }
      }

      setEmailList('');
      setMessage('');
      loadInvitations();
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      toast.error(
        'Error al enviar invitaciones',
        {
          description: error.message || 'Ocurrió un error al procesar las invitaciones. Por favor, intenta de nuevo.',
          duration: 6000
        }
      );
    } finally {
      setIsSending(false);
      setSendProgress(0);
    }
  };

  const openDeleteDialog = (id: string, email: string) => {
    setStudentToDelete({ id, email });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('academy_students')
        .delete()
        .eq('id', studentToDelete.id);

      if (error) throw error;

      toast.success(
        `Estudiante eliminado`,
        {
          description: `${studentToDelete.email} ha sido eliminado de tu academia.`,
          duration: 4000
        }
      );
      loadInvitations();
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    } catch (error: any) {
      toast.error(
        'Error al eliminar estudiante',
        {
          description: error.message || 'No se pudo eliminar el estudiante.',
          duration: 5000
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Count parsed emails for display
  const { valid: validEmailsPreview } = parseEmails(emailList);
  const emailCount = validEmailsPreview.length;

  return (
    <div className="space-y-6">
      {/* Draft Restore Prompt */}
      {showRestorePrompt && (
        <div className="bg-muted border border-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Se encontró un borrador guardado</p>
            <p className="text-sm text-muted-foreground">¿Deseas restaurar tu trabajo anterior?</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearDraft();
                setShowRestorePrompt(false);
              }}
            >
              Descartar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                restoreDraft();
                setShowRestorePrompt(false);
              }}
            >
              Restaurar
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Invitaciones</h2>
          <p className="text-muted-foreground">
            Invita estudiantes a unirse a tu academia
          </p>
        </div>
      </div>

      {/* Invitation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Links de Invitación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Estudiante Activo</TabsTrigger>
              <TabsTrigger value="graduated">Graduado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              <div className="space-y-2">
                <Label>Link para Estudiantes Activos</Label>
                <p className="text-sm text-muted-foreground">
                  Comparte este link con estudiantes que están cursando actualmente
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={activeInviteLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(activeInviteLink, 'active')}
                    className="flex-shrink-0"
                  >
                    {copiedActive ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Nota:</strong> Los estudiantes que usen este link serán registrados con el estado "Activo"
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="graduated" className="space-y-4">
              <div className="space-y-2">
                <Label>Link para Graduados</Label>
                <p className="text-sm text-muted-foreground">
                  Comparte este link con estudiantes que ya se graduaron
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={graduatedInviteLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(graduatedInviteLink, 'graduated')}
                    className="flex-shrink-0"
                  >
                    {copiedGraduated ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Nota:</strong> Los estudiantes que usen este link serán registrados con el estado "Graduado"
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Send Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Enviar Invitaciones por Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="emails">Emails de Estudiantes</Label>
              {emailCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {emailCount} email{emailCount !== 1 ? 's' : ''} válido{emailCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <Textarea
              id="emails"
              placeholder="Ingresa los emails separados por comas, punto y coma, o líneas nuevas...&#10;&#10;Ejemplo:&#10;estudiante1@email.com&#10;estudiante2@email.com, estudiante3@email.com"
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Puedes pegar listas de emails directamente desde Excel o Google Sheets
            </p>
          </div>
          
          <div>
            <Label htmlFor="message">Mensaje Personalizado (Opcional)</Label>
            <Textarea
              id="message"
              placeholder="Escribe un mensaje personalizado para las invitaciones..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {isSending && sendProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enviando invitaciones...</span>
                <span className="font-medium">{sendProgress}%</span>
              </div>
              <Progress value={sendProgress} className="h-2" />
            </div>
          )}
          
          <Button 
            onClick={handleSendInvitations}
            disabled={!emailList.trim() || isSending || emailCount === 0}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando {emailCount} invitación{emailCount !== 1 ? 'es' : ''}...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar {emailCount > 0 ? `${emailCount} ` : ''}Invitación{emailCount !== 1 ? 'es' : ''}
              </>
            )}
          </Button>

          {emailCount > 50 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Estás enviando {emailCount} invitaciones. El proceso puede tomar algunos minutos debido a límites de envío.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Estudiantes Invitados ({invitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay estudiantes invitados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatStudentName(invitation.student_email, invitation.student_name)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invitation.student_email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${
                      invitation.status === 'enrolled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      invitation.status === 'graduated' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {invitation.status === 'enrolled' ? 'Activo' : 
                       invitation.status === 'graduated' ? 'Graduado' : 
                       invitation.status}
                    </Badge>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteDialog(invitation.id, invitation.student_email)}
                      disabled={isDeleting}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar estudiante?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{studentToDelete?.email}</strong> de tu academia?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvitationManager;
