import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HelpCircle, AlertTriangle, Lightbulb, Loader2, ArrowRight } from 'lucide-react';
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
    help_url: '/help-center',
    report_url: '/reportar-problema',
    ideas_url: '/feedback'
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
        // Only override if admin has set custom links
        if (linksObj.help_url) setLinks(prev => ({ ...prev, help_url: linksObj.help_url }));
        if (linksObj.report_url) setLinks(prev => ({ ...prev, report_url: linksObj.report_url }));
        if (linksObj.ideas_url) setLinks(prev => ({ ...prev, ideas_url: linksObj.ideas_url }));
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-background rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <div className="relative p-6 sm:p-8 pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center">
            ¿Cómo podemos ayudarte hoy?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2 opacity-70">
            Este espacio nos ayuda a mejorar TalentoDigital junto a la comunidad
          </p>
        </div>

        {/* Options Grid */}
        <div className="px-4 sm:px-8 pb-6 sm:pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {/* Centro de ayuda */}
              <button
                onClick={() => handleOptionClick('help')}
                className="group p-4 sm:p-6 rounded-xl border border-border hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left bg-background hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                    <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Centro de ayuda</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Encontrá respuestas rápidas, guías y recursos para usar TalentoDigital
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                      Ir al centro de ayuda <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>

              {/* Reportar un problema */}
              <button
                onClick={() => handleOptionClick('report')}
                className="group p-4 sm:p-6 rounded-xl border border-border hover:border-red-300 hover:shadow-md transition-all duration-200 text-left bg-background hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors">
                    <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Reportar un problema</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Informanos sobre errores, fallos técnicos o algo que no esté funcionando bien
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      Nuestro equipo revisa todos los reportes
                    </p>
                  </div>
                </div>
              </button>

              {/* Sugerir una mejora */}
              <button
                onClick={() => handleOptionClick('ideas')}
                className="group p-4 sm:p-6 rounded-xl border border-border hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left bg-background hover:bg-purple-50 dark:hover:bg-purple-950/30"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                    <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Sugerir una mejora</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Contanos qué funcionalidad te gustaría ver o cómo podemos mejorar la plataforma
                    </p>
                    <p className="text-xs text-purple-600 font-medium">
                      Muchas de nuestras mejoras nacen acá 💜
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
