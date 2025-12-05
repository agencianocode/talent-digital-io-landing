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
  const { completeness, breakdown } = useProfileCompleteness();
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

        <div className="space-y-6 py-4">
          {/* Progress indicator - Destacado */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-4 border-orange-200">
              <span className="text-3xl font-bold text-orange-600">
                {completeness}%
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Completitud de tu perfil
            </p>
          </div>

          <Progress value={completeness} className="h-3" />

          {/* Mensaje motivacional */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              {minCompletenessRequired === 100 
                ? '¡Completa tu perfil al 100% para aplicar! 🚀'
                : '¡Completa tu perfil para aplicar a oportunidades! 🚀'
              }
            </p>
            <p className="text-sm text-gray-700">
              {minCompletenessRequired === 100 ? (
                <>
                  Para aplicar a oportunidades, necesitas un <strong className="text-blue-600">perfil 100% completo</strong>. 
                  Esto incluye: foto, nombre, ubicación, categorías, título, experiencia, skills y bio.
                </>
              ) : (
                <>
                  Necesitas al menos <strong className="text-blue-600">{minCompletenessRequired}%</strong> de tu perfil completo. 
                  Un perfil completo aumenta tus chances de hacer match con las mejores empresas.
                </>
              )}
            </p>
          </div>

          {/* Missing sections */}
          {breakdown.missing_fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Lo que falta por completar:</p>
              <ul className="space-y-2">
                {breakdown.missing_fields.slice(0, 5).map((field, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {breakdown.suggestions.length > 0 && breakdown.suggestions.length < 3 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Tips para destacar:</p>
              <ul className="space-y-2">
                {breakdown.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Ahora no
          </Button>
          <Button 
            onClick={handleCompleteProfile} 
            className="flex-1 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Completar mi perfil
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletenessModal;