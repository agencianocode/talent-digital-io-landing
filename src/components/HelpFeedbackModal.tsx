import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, HelpCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface HelpFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpFeedbackModal = ({ isOpen, onClose }: HelpFeedbackModalProps) => {
  const handleOptionClick = (type: 'help' | 'report' | 'ideas') => {
    switch (type) {
      case 'help':
        // Abrir centro de ayuda o contactar soporte
        window.open('mailto:support@talent-digital.io?subject=Solicitud de Ayuda', '_blank');
        break;
      case 'report':
        // Reportar problema
        window.open('mailto:support@talent-digital.io?subject=Reporte de Problema', '_blank');
        break;
      case 'ideas':
        // Ideas y sugerencias
        window.open('mailto:feedback@talent-digital.io?subject=Ideas y Sugerencias', '_blank');
        break;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-white rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            ¿En qué podemos ayudarte?
          </h2>
        </div>

        {/* Options Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ayuda */}
            <button
              onClick={() => handleOptionClick('help')}
              className="group p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-blue-50"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <HelpCircle className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ayuda</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Encontrá respuestas a dudas comunes o contactá a soporte
                  </p>
                </div>
              </div>
            </button>

            {/* Reportar un problema */}
            <button
              onClick={() => handleOptionClick('report')}
              className="group p-6 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-red-50"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reportar un problema</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Informanos sobre errores o fallos técnicos
                  </p>
                </div>
              </div>
            </button>

            {/* Ideas y nuevas funcionalidades */}
            <button
              onClick={() => handleOptionClick('ideas')}
              className="group p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-purple-50"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Lightbulb className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ideas y nuevas funcionalidades</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Contanos qué te gustaría que implementemos en la plataforma
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpFeedbackModal;
