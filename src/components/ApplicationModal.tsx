import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useApplications } from '@/hooks/useCustomHooks';
import { useToast } from '@/hooks/use-toast';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id: string;
    title: string;
    company: string;
    description: string;
  };
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  opportunity
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSupabaseAuth();
  const { applyToJob } = useApplications();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Por favor, escribe un mensaje para tu aplicación",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await applyToJob(opportunity.id, message);
      toast({
        title: "¡Aplicación enviada!",
        description: "Tu aplicación ha sido enviada exitosamente"
      });
      onClose();
      setMessage('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar la aplicación",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aplicar a {opportunity.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opportunity Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{opportunity.title}</h3>
              <p className="text-muted-foreground text-sm">{opportunity.company}</p>
              <p className="text-sm mt-2">{opportunity.description}</p>
            </CardContent>
          </Card>

          {/* Applicant Profile Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.email}</h3>
                  <p className="text-muted-foreground">Profesional</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Mensaje personalizado *
            </label>
            <Textarea
              placeholder="Explica por qué eres el candidato ideal para esta posición..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Máximo 500 caracteres ({message.length}/500)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Aplicación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;