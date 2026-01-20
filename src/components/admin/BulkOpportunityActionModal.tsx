import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pause, Trash2, Send } from 'lucide-react';

interface BulkOpportunityActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'pause' | 'delete';
  opportunityCount: number;
  onConfirm: (message?: string) => Promise<void>;
  isLoading?: boolean;
}

const BulkOpportunityActionModal: React.FC<BulkOpportunityActionModalProps> = ({
  isOpen,
  onClose,
  action,
  opportunityCount,
  onConfirm,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');

  const handleConfirmWithMessage = async () => {
    await onConfirm(message.trim() || undefined);
    setMessage('');
  };

  const handleConfirmWithoutMessage = async () => {
    await onConfirm(undefined);
    setMessage('');
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const actionConfig = {
    pause: {
      title: 'Pausar Oportunidades',
      description: `Vas a pausar ${opportunityCount} oportunidad${opportunityCount > 1 ? 'es' : ''}. Las empresas serán notificadas.`,
      icon: Pause,
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    delete: {
      title: 'Eliminar Oportunidades',
      description: `Vas a eliminar permanentemente ${opportunityCount} oportunidad${opportunityCount > 1 ? 'es' : ''}. Esta acción no se puede deshacer.`,
      icon: Trash2,
      buttonColor: 'bg-destructive hover:bg-destructive/90',
    },
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje para las empresas (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Escribe un mensaje explicando el motivo de esta acción..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="ghost"
            onClick={handleConfirmWithoutMessage}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Continuar sin mensaje
          </Button>
          <Button
            onClick={handleConfirmWithMessage}
            disabled={isLoading || !message.trim()}
            className={`w-full sm:w-auto ${config.buttonColor} text-white`}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOpportunityActionModal;
