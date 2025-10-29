import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Plus, 
  Send,
  Copy,
  CheckCircle2,
  Link as LinkIcon
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

  // Generate invitation links
  const activeInviteLink = `${window.location.origin}/accept-invitation?academy=${academyId}&status=enrolled`;
  const graduatedInviteLink = `${window.location.origin}/accept-invitation?academy=${academyId}&status=graduated`;

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

  // Mock data for invitations
  const invitations = [
    {
      id: '1',
      email: 'estudiante1@example.com',
      status: 'pending',
      invited_at: '2024-01-20T10:00:00Z',
      expires_at: '2024-01-27T10:00:00Z'
    },
    {
      id: '2',
      email: 'estudiante2@example.com',
      status: 'accepted',
      invited_at: '2024-01-18T10:00:00Z',
      accepted_at: '2024-01-19T14:00:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'declined': return 'Declinada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };

  const handleSendInvitations = async () => {
    setIsSending(true);
    // TODO: Implement send invitations
    console.log('Sending invitations to:', emailList);
    setTimeout(() => {
      setIsSending(false);
      setEmailList('');
      setMessage('');
    }, 2000);
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
            Invitaciones Enviadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay invitaciones enviadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Enviada: {new Date(invitation.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(invitation.status)} text-xs`}>
                      {getStatusText(invitation.status)}
                    </Badge>
                    
                    {invitation.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationManager;
