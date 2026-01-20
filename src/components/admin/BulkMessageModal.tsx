import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  onSuccess: () => void;
}

const BulkMessageModal: React.FC<BulkMessageModalProps> = ({
  isOpen,
  onClose,
  selectedUserIds,
  onSuccess,
}) => {
  const { user } = useSupabaseAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Send message to each selected user
      let successCount = 0;
      let errorCount = 0;

      for (const recipientId of selectedUserIds) {
        try {
          // Check if conversation already exists
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('user_id', recipientId)
            .maybeSingle();

          let conversationId: string;

          if (existingConv) {
            conversationId = existingConv.id;
          } else {
            // Create new conversation
            const { data: newConv, error: convError } = await supabase
              .from('conversations')
              .insert({
                user_id: recipientId,
                admin_id: user.id,
                subject: 'Mensaje del Administrador',
                status: 'open',
                priority: 'normal',
                last_message_at: new Date().toISOString(),
              })
              .select('id')
              .single();

            if (convError) throw convError;
            conversationId = newConv.id;
          }

          // Get recipient's company_id for proper workspace routing
          const { data: recipientCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', recipientId)
            .maybeSingle();

          let companyId = recipientCompany?.id;
          if (!companyId) {
            const { data: memberRole } = await supabase
              .from('company_user_roles')
              .select('company_id')
              .eq('user_id', recipientId)
              .eq('status', 'accepted')
              .maybeSingle();
            companyId = memberRole?.company_id;
          }

          // Send message
          const { error: msgError } = await supabase
            .from('messages')
            .insert({
              sender_id: user.id,
              recipient_id: recipientId,
              conversation_id: `chat_${user.id}_${recipientId}`,
              conversation_uuid: conversationId,
              content: message.trim(),
              message_type: 'text',
              is_read: false,
              company_id: companyId || null,
            });

          if (msgError) throw msgError;

          // Update conversation's last message timestamp
          await supabase
            .from('conversations')
            .update({
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId);

          successCount++;
        } catch (err) {
          console.error(`Error sending message to user ${recipientId}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Mensaje enviado a ${successCount} usuario${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Error al enviar a ${errorCount} usuario${errorCount > 1 ? 's' : ''}`);
      }

      setMessage('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      toast.error('Error al enviar los mensajes');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Mensaje Masivo</DialogTitle>
          <DialogDescription>
            Este mensaje se enviará a {selectedUserIds.length} usuario{selectedUserIds.length > 1 ? 's' : ''} seleccionado{selectedUserIds.length > 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={!message.trim() || isSending}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkMessageModal;
