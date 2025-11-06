import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface InvitationManagerProps {
  academyId: string;
}

export const InvitationManager: React.FC<InvitationManagerProps> = ({ academyId }) => {
  const [emailList, setEmailList] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedActive, setCopiedActive] = useState(false);
  const [copiedGraduated, setCopiedGraduated] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSendInvitations = async () => {
    if (!emailList.trim()) return;

    try {
      setIsSending(true);
      
      // Parse emails (split by comma, semicolon, or new line)
      const emails = emailList
        .split(/[,;\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        toast.error('No se encontraron emails válidos');
        return;
      }

      // Insert students into academy_students table
      const studentsToInsert = emails.map(email => ({
        academy_id: academyId,
        student_email: email,
        student_name: email.split('@')[0], // Temporary name
        status: 'enrolled',
        enrollment_date: new Date().toISOString().split('T')[0]
      }));

      const { error: dbError } = await supabase
        .from('academy_students')
        .insert(studentsToInsert);

      if (dbError) throw dbError;

      // Get academy name for the email
      const { data: academyData } = await supabase
        .from('companies')
        .select('name')
        .eq('id', academyId)
        .single();

      // Send invitation emails via Edge Function
      console.log('📧 Calling send-academy-invitations edge function...', {
        emails,
        academyId,
        academyName: academyData?.name
      });

      const { data, error: emailError } = await supabase.functions.invoke(
        'send-academy-invitations',
        {
          body: {
            emails,
            academyId,
            academyName: academyData?.name || 'Tu Academia',
            customMessage: message.trim() || undefined
          }
        }
      );

      console.log('📧 Edge function response:', { data, emailError });

      if (emailError) {
        console.error('❌ Error sending emails:', emailError);
        toast.error(
          `Error al enviar emails: ${emailError.message}`,
          {
            description: 'Los estudiantes fueron agregados a la base de datos, pero no se enviaron los emails de invitación.',
            duration: 6000
          }
        );
      } else {
        console.log('✅ Emails sent successfully:', data);
        toast.success(
          `🎉 ¡Invitaciones enviadas correctamente!`,
          {
            description: `Se enviaron ${emails.length} email(s) de invitación a: ${emails.slice(0, 3).join(', ')}${emails.length > 3 ? '...' : ''}`,
            duration: 5000
          }
        );
      }

      setEmailList('');
      setMessage('');
      loadInvitations(); // Reload the list
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
      console.log('🗑️ Deleting student:', studentToDelete.id);
      
      const { error } = await supabase
        .from('academy_students')
        .delete()
        .eq('id', studentToDelete.id);

      if (error) {
        console.error('❌ Error deleting student:', error);
        throw error;
      }

      console.log('✅ Student deleted successfully');
      toast.success(
        `🗑️ Estudiante eliminado`,
        {
          description: `${studentToDelete.email} ha sido eliminado de tu academia correctamente.`,
          duration: 4000
        }
      );
      loadInvitations();
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    } catch (error: any) {
      console.error('❌ Error al eliminar estudiante:', error);
      toast.error(
        'Error al eliminar estudiante',
        {
          description: error.message || 'No se pudo eliminar el estudiante. Por favor, intenta de nuevo.',
          duration: 5000
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-green-800">
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
            <Label htmlFor="emails">Emails de Estudiantes</Label>
            <Textarea
              id="emails"
              placeholder="Ingresa los emails separados por comas o líneas nuevas..."
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Separa múltiples emails con comas o líneas nuevas
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
          
          <Button 
            onClick={handleSendInvitations}
            disabled={!emailList.trim() || isSending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Enviando...' : 'Enviar Invitaciones'}
          </Button>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Estudiantes Invitados
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
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{invitation.student_email}</p>
                      <p className="text-sm text-muted-foreground">
                        Agregado: {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${
                      invitation.status === 'enrolled' ? 'bg-blue-100 text-blue-800' :
                      invitation.status === 'graduated' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
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
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
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
