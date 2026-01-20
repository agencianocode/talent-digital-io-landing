import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkRate: (rating: number) => void;
  onBulkMessage: (message: string) => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkRate,
  onBulkMessage,
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');

  if (selectedCount === 0) return null;

  const handleRate = () => {
    if (rating > 0) {
      onBulkRate(rating);
      setShowRatingModal(false);
      setRating(0);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onBulkMessage(message);
      setShowMessageModal(false);
      setMessage('');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="bg-primary text-primary-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {selectedCount}
            </Badge>
            <span className="text-sm font-medium">
              {selectedCount === 1 ? 'aplicación seleccionada' : 'aplicaciones seleccionadas'}
            </span>
          </div>

          <div className="h-4 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowRatingModal(true)}
            >
              <Star className="h-4 w-4 mr-1.5" />
              Calificar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowMessageModal(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Enviar mensaje
            </Button>
          </div>

          <div className="h-4 w-px bg-white/30" />

          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 p-1"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Calificar {selectedCount} aplicaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona una calificación para aplicar a todas las aplicaciones seleccionadas.
            </p>
            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-10 w-10 cursor-pointer transition-all",
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400 scale-110"
                      : "text-muted-foreground/30 hover:text-yellow-400/50"
                  )}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRatingModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRate} disabled={rating === 0}>
                Aplicar calificación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar mensaje a {selectedCount} candidatos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este mensaje será enviado a todos los candidatos seleccionados.
            </p>
            <div>
              <Label className="text-sm font-medium mb-2 block">Mensaje</Label>
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                Enviar mensaje
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkActionsBar;
