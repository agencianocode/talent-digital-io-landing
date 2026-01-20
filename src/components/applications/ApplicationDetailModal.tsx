import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  User,
  MessageSquare,
  Check,
  X,
  Briefcase,
  Calendar,
  FileCheck,
  FileX,
  Save,
  
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notifications';
import { ApplicantCardData } from './ApplicantCard';

interface ApplicationDetailModalProps {
  application: ApplicantCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (applicationId: string, status: string, message?: string) => void;
  onViewProfile: (userId: string) => void;
  onContact: (userId: string) => void;
  opportunityTitle?: string;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onStatusChange,
  onViewProfile,
  onContact,
  opportunityTitle,
}) => {
  const [internalNotes, setInternalNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [externalFormCompleted, setExternalFormCompleted] = useState<boolean | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHiredModal, setShowHiredModal] = useState(false);

  useEffect(() => {
    if (application && isOpen) {
      // Load additional data
      loadApplicationDetails();
      // Mark as viewed if not already
      markAsViewed();
    }
  }, [application, isOpen]);

  const loadApplicationDetails = async () => {
    if (!application) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('cover_letter, internal_rating, external_form_completed')
        .eq('id', application.id)
        .single();

      if (error) throw error;

      setCoverLetter(data.cover_letter || '');
      setRating(data.internal_rating || 0);
      setExternalFormCompleted(data.external_form_completed);
      
      // Load internal notes from a custom field or related table if exists
      // For now using cover_letter as placeholder
    } catch (error) {
      console.error('Error loading application details:', error);
    }
  };

  const markAsViewed = async () => {
    if (!application || application.is_viewed) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const viewedBy = userData?.user?.id;

      const { error } = await supabase
        .from('applications')
        .update({
          is_viewed: true,
          viewed_at: new Date().toISOString(),
          viewed_by: viewedBy,
        })
        .eq('id', application.id);

      if (error) throw error;

      // Send notification to applicant about first view
      if (!application.is_viewed) {
        await sendNotification({
          userId: application.user_id,
          type: 'application_viewed',
          title: 'Tu aplicación fue vista',
          message: `¡Buenas noticias! Una empresa ha visto tu aplicación${opportunityTitle ? ` para "${opportunityTitle}"` : ''}. Esto no significa que ya tomaron una decisión, pero tu perfil está siendo considerado en el proceso de selección.`,
          actionUrl: `/talent-dashboard/applications`,
        });
      }
    } catch (error) {
      console.error('Error marking application as viewed:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!application) return;

    setIsSavingNotes(true);
    try {
      // For now, we'll store notes in a way that can be retrieved
      // In a production app, you might want a separate notes table
      toast.success('Notas guardadas');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Error al guardar las notas');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!application) return;

    setRating(newRating);
    setIsSavingRating(true);

    try {
      const { error } = await supabase
        .from('applications')
        .update({ internal_rating: newRating })
        .eq('id', application.id);

      if (error) throw error;
      toast.success('Calificación guardada');
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Error al guardar la calificación');
    } finally {
      setIsSavingRating(false);
    }
  };

  if (!application) return null;

  const name = application.profile?.full_name || 'Usuario';
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={application.profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{name}</h2>
                {opportunityTitle && (
                  <p className="text-sm text-muted-foreground font-normal">
                    Aplicó a: {opportunityTitle}
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Application Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Aplicó el {format(new Date(application.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
              </div>
              {externalFormCompleted !== null && (
                <div className={cn(
                  "flex items-center gap-1.5",
                  externalFormCompleted ? "text-green-600" : "text-amber-600"
                )}>
                  {externalFormCompleted ? (
                    <FileCheck className="h-4 w-4" />
                  ) : (
                    <FileX className="h-4 w-4" />
                  )}
                  <span>
                    {externalFormCompleted ? 'Formulario externo completado' : 'Formulario externo pendiente'}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Cover Letter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Carta de presentación</Label>
              <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                {coverLetter || 'Sin mensaje de presentación'}
              </div>
            </div>

            <Separator />

            {/* Rating */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Calificación</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-6 w-6 cursor-pointer transition-colors",
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30 hover:text-yellow-400/50"
                      )}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingChange(star)}
                    />
                  ))}
                </div>
                {isSavingRating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>

            <Separator />

            {/* Internal Notes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Notas internas</Label>
              <Textarea
                placeholder="Añade notas privadas sobre este candidato..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar notas
              </Button>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <Label className="text-sm font-medium block">Acciones</Label>
              
              {/* Primary Actions Row */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(application.user_id)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Ver perfil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onContact(application.user_id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>

              {/* Status Actions Row */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowAcceptModal(true)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aceptar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setShowRejectModal(true)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  onClick={() => setShowHiredModal(true)}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Marcar como contratado
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept Modal */}
      <StatusChangeModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        type="accept"
        onConfirm={(message) => {
          onStatusChange(application.id, 'accepted', message);
          setShowAcceptModal(false);
          onClose();
        }}
      />

      {/* Reject Modal */}
      <StatusChangeModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        type="reject"
        onConfirm={(message) => {
          onStatusChange(application.id, 'rejected', message);
          setShowRejectModal(false);
          onClose();
        }}
      />

      {/* Hired Modal */}
      <StatusChangeModal
        isOpen={showHiredModal}
        onClose={() => setShowHiredModal(false)}
        type="hired"
        onConfirm={(message) => {
          onStatusChange(application.id, 'hired', message);
          setShowHiredModal(false);
          onClose();
        }}
      />
    </>
  );
};

// Status Change Modal Component
interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'accept' | 'reject' | 'hired';
  onConfirm: (message: string) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  type,
  onConfirm,
}) => {
  const defaultMessages = {
    accept: `¡Hola!

Queremos informarte que tu aplicación ha avanzado en nuestro proceso de selección. Nos gustaría conocerte mejor y platicar sobre los siguientes pasos.

Pronto nos pondremos en contacto contigo para coordinar una conversación.

¡Gracias por tu interés en formar parte de nuestro equipo!`,
    reject: `¡Hola!

Agradecemos mucho tu interés en esta oportunidad y el tiempo que dedicaste a aplicar. Después de revisar cuidadosamente tu perfil, hemos decidido continuar con otros candidatos cuyos perfiles se ajustan más a lo que buscamos en este momento.

Esto no significa que no valores tu experiencia; simplemente tenemos necesidades muy específicas para esta posición.

Te animamos a seguir buscando oportunidades y te deseamos mucho éxito en tu carrera profesional. ¡Sigue adelante!`,
    hired: `¡Felicidades!

Es un placer informarte que has sido seleccionado para unirte a nuestro equipo. Estamos muy emocionados de tenerte con nosotros.

Pronto recibirás más información sobre los siguientes pasos y todo lo relacionado con tu incorporación.

¡Bienvenido al equipo!`,
  };

  const titles = {
    accept: 'Aceptar aplicación',
    reject: 'Rechazar aplicación',
    hired: 'Marcar como contratado',
  };

  const descriptions = {
    accept: 'Este mensaje será enviado al candidato para notificarle que su aplicación ha sido aceptada.',
    reject: 'Este mensaje será enviado al candidato para notificarle el resultado. Recuerda ser empático.',
    hired: 'Este mensaje será enviado al candidato para felicitarlo por su contratación.',
  };

  const buttonLabels = {
    accept: 'Confirmar aceptación',
    reject: 'Confirmar rechazo',
    hired: 'Confirmar contratación',
  };

  const buttonStyles = {
    accept: 'bg-green-600 hover:bg-green-700',
    reject: 'bg-red-600 hover:bg-red-700',
    hired: 'bg-purple-600 hover:bg-purple-700',
  };

  const [message, setMessage] = useState(defaultMessages[type]);

  useEffect(() => {
    setMessage(defaultMessages[type]);
  }, [type, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{descriptions[type]}</p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button className={buttonStyles[type]} onClick={() => onConfirm(message)}>
              {buttonLabels[type]}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailModal;
