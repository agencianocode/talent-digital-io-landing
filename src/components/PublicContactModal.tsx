import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PublicContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentUserId: string;
  talentName: string;
  contactType: 'proposal' | 'message';
}

export const PublicContactModal = ({ 
  isOpen, 
  onClose, 
  talentUserId, 
  talentName,
  contactType 
}: PublicContactModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('handle-public-contact', {
        body: {
          talentUserId,
          requesterName: formData.name,
          requesterEmail: formData.email,
          requesterCompany: formData.company || null,
          requesterRole: formData.role || null,
          message: formData.message,
          contactType
        }
      });

      if (error) throw error;

      toast.success(
        contactType === 'proposal' 
          ? '¡Propuesta enviada!' 
          : '¡Mensaje enviado!',
        {
          description: `${talentName} recibirá tu ${contactType === 'proposal' ? 'propuesta' : 'mensaje'} y te contactará pronto.`
        }
      );

      setFormData({ name: '', email: '', company: '', role: '', message: '' });
      onClose();
    } catch (error: any) {
      console.error('Error sending contact request:', error);
      
      if (error.message?.includes('Daily contact limit')) {
        toast.error('Límite alcanzado', {
          description: 'Has alcanzado el límite diario de contactos. Intenta mañana.'
        });
      } else {
        toast.error('Error al enviar', {
          description: 'No se pudo enviar tu mensaje. Intenta nuevamente.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {contactType === 'proposal' ? 'Enviar Propuesta' : 'Enviar Mensaje'}
          </DialogTitle>
          <DialogDescription>
            Contacta a {talentName} directamente. Recibirás una copia en tu email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              maxLength={255}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                placeholder="Nombre de tu empresa"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Tu Rol</Label>
              <Input
                id="role"
                placeholder="ej: Recruiter, CEO"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Mensaje <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder={
                contactType === 'proposal' 
                  ? 'Describe tu propuesta de trabajo o proyecto...'
                  : 'Escribe tu mensaje...'
              }
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.message.length}/1000 caracteres
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 inline mr-1" />
              Tu información será compartida con {talentName} para que pueda responderte.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};