import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Plus, 
  Send
} from 'lucide-react';

interface InvitationManagerProps {
  academyId: string;
}

export const InvitationManager: React.FC<InvitationManagerProps> = () => {
  const [emailList, setEmailList] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

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

      {/* Send Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Enviar Invitaciones
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
