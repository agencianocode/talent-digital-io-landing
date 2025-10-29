import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, CheckCircle2, Video, ExternalLink } from 'lucide-react';

interface ProfileImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileImprovementModal = ({ isOpen, onClose }: ProfileImprovementModalProps) => {
  const tips = [
    {
      title: 'Bio Atractiva',
      description: 'Escribe una biografía clara que destaque tu experiencia única y valor diferencial. Enfócate en resultados medibles.',
      icon: '✍️'
    },
    {
      title: 'Portfolio Completo',
      description: 'Agrega al menos 3 proyectos que demuestren tu trabajo. Incluye capturas, enlaces y descripciones detalladas.',
      icon: '💼'
    },
    {
      title: 'Video Presentación',
      description: 'Un video de 60-90 segundos aumenta tus oportunidades hasta 3x. Preséntate con profesionalismo y autenticidad.',
      icon: '🎥'
    },
    {
      title: 'Habilidades Específicas',
      description: 'Lista habilidades técnicas y herramientas concretas. Evita términos genéricos como "trabajo en equipo".',
      icon: '🎯'
    },
    {
      title: 'Experiencia Detallada',
      description: 'Describe logros específicos en cada rol. Usa números: "Aumenté ventas en 45%" vs "Aumenté ventas".',
      icon: '📈'
    },
    {
      title: 'Redes Sociales',
      description: 'Conecta tu LinkedIn, portfolio y GitHub. Muestra tu presencia profesional activa.',
      icon: '🔗'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-6 w-6 text-primary" />
            ¿Cómo mejorar mi perfil?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Tutorial */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Video Tutorial: Cómo crear un perfil destacado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Aprende en 5 minutos las mejores prácticas para que tu perfil destaque ante los reclutadores.
                  </p>
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Ver Tutorial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{tip.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        {tip.title}
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">💡 Tip Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Los perfiles con video, portfolio completo y más de 5 habilidades reciben <strong>5x más contactos</strong> que los perfiles básicos.
              </p>
              <Button onClick={onClose}>
                Entendido, voy a mejorar mi perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
