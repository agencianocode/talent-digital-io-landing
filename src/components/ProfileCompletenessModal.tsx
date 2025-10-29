import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  minCompletenessRequired?: number;
}

const ProfileCompletenessModal = ({ 
  isOpen, 
  onClose, 
  minCompletenessRequired = 60 
}: ProfileCompletenessModalProps) => {
  const { completeness, breakdown, getCompletenessColor } = useProfileCompleteness();
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    onClose();
    navigate('/talent-dashboard/profile');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Completa tu perfil para aplicar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Completitud de tu perfil
              </span>
              <span className={`text-sm font-bold ${getCompletenessColor(completeness)}`}>
                {completeness}%
              </span>
            </div>
            <Progress value={completeness} className="h-3" />
          </div>

          {/* Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Para aplicar a oportunidades necesitas tener al menos <strong>{minCompletenessRequired}% de tu perfil completado</strong>. 
              Esto aumenta significativamente tus chances de hacer match con las empresas.
            </p>
          </div>

          {/* Missing sections */}
          {breakdown.missing_fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Campos faltantes:</p>
              <ul className="space-y-1">
                {breakdown.missing_fields.slice(0, 5).map((field, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {breakdown.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Recomendaciones:</p>
              <ul className="space-y-1">
                {breakdown.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleCompleteProfile} className="flex-1 flex items-center gap-2">
            Completar perfil
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletenessModal;