import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HelpCircle, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HelpFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpLinks {
  help_url: string;
  report_url: string;
  ideas_url: string;
}

const HelpFeedbackModal = ({ isOpen, onClose }: HelpFeedbackModalProps) => {
  const [links, setLinks] = useState<HelpLinks>({
    help_url: 'mailto:support@talent-digital.io?subject=Solicitud de Ayuda',
    report_url: 'mailto:support@talent-digital.io?subject=Reporte de Problema',
    ideas_url: 'mailto:feedback@talent-digital.io?subject=Ideas y Sugerencias'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHelpLinks();
    }
  }, [isOpen]);

  const loadHelpLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .eq('category', 'help_links');

      if (error) throw error;

      if (data && data.length > 0) {
        const linksObj: any = {};
        data.forEach((setting) => {
          linksObj[setting.key] = setting.value as string;
        });
        setLinks(linksObj as HelpLinks);
      }
    } catch (error) {
      console.error('Error loading help links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (type: 'help' | 'report' | 'ideas') => {
    let url = '';
    switch (type) {
      case 'help':
        url = links.help_url;
        break;
      case 'report':
        url = links.report_url;
        break;
      case 'ideas':
        url = links.ideas_url;
        break;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-white rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            ¿En qué podemos ayudarte?
          </h2>
        </div>

        {/* Options Grid */}
        <div className="px-8 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpFeedbackModal;
