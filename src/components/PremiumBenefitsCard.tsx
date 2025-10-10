import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  Star,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PremiumBenefitsCard: React.FC = () => {
  const benefits = [
    {
      icon: Package,
      title: 'Publicar Servicios',
      description: 'Crea y gestiona servicios en el Marketplace',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      icon: TrendingUp,
      title: 'Estadísticas Avanzadas',
      description: 'Acceso a métricas detalladas de rendimiento',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      icon: Star,
      title: 'Prioridad en Oportunidades',
      description: 'Acceso anticipado a nuevas oportunidades',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      icon: Zap,
      title: 'Soporte Prioritario',
      description: 'Atención preferencial del equipo',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <Card className="relative overflow-hidden border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-50/50 via-white to-amber-50/50 dark:from-yellow-950/10 dark:via-background dark:to-amber-950/10">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg shadow-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Cuenta Premium Activa
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Disfruta de todos los beneficios exclusivos
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary"
            className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 animate-fade-in"
          >
            Activo
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg",
                "bg-white/50 dark:bg-background/50",
                "border border-border/50",
                "transition-all duration-300",
                "hover:shadow-md hover:scale-[1.02]",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                benefit.bgColor
              )}>
                <benefit.icon className={cn("h-5 w-5", benefit.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium text-foreground">
                ¿Quieres aprovechar al máximo tu cuenta Premium?
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Explora el Marketplace y comienza a publicar tus servicios ahora mismo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumBenefitsCard;
