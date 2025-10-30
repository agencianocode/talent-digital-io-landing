import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Share2, 
  TrendingUp,
  Target,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationsEmptyStateProps {
  opportunityTitle: string;
  opportunityId: string;
  onShareOpportunity?: () => void;
}

export const ApplicationsEmptyState = ({ 
  opportunityTitle, 
  opportunityId,
  onShareOpportunity 
}: ApplicationsEmptyStateProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyInviteLink = async () => {
    try {
      const inviteLink = `${window.location.origin}/opportunity/invite/${opportunityId}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('¡Enlace de invitación copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleShareOpportunity = () => {
    if (onShareOpportunity) {
      onShareOpportunity();
    } else {
      toast.info('Compartiendo oportunidad...');
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Empty State */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no hay postulaciones
            </h3>
            
            <p className="text-gray-600 mb-6">
              Tu oportunidad <strong>"{opportunityTitle}"</strong> está publicada pero aún no ha recibido aplicaciones. 
              Te ayudamos a encontrar los mejores talentos.
            </p>

            <div className="space-y-3">
              <Button 
                onClick={handleShareOpportunity}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir en redes sociales
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCopyInviteLink}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar enlace de invitación
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                💡 Consejos para recibir más aplicaciones
              </h4>
              
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Comparte tu oportunidad en LinkedIn y otras redes profesionales</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Invita directamente a talentos que conozcas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Revisa que la descripción sea clara y atractiva</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Considera ajustar el rango salarial si es necesario</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
