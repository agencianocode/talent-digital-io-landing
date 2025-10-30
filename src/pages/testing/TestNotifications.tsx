import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type NotificationType = 'application' | 'opportunity' | 'message' | 'team' | 'marketplace' | 'moderation';

const notificationTypes: { value: NotificationType; label: string; description: string }[] = [
  {
    value: 'application',
    label: '🎯 Aplicación',
    description: 'Notificación de nueva aplicación a una oportunidad',
  },
  {
    value: 'opportunity',
    label: '💼 Oportunidad',
    description: 'Notificación sobre cambios en oportunidades',
  },
  {
    value: 'message',
    label: '💬 Mensaje',
    description: 'Notificación de nuevo mensaje',
  },
  {
    value: 'team',
    label: '👥 Equipo',
    description: 'Notificación de solicitud de equipo',
  },
  {
    value: 'marketplace',
    label: '🛍️ Marketplace',
    description: 'Notificación de consulta de servicio',
  },
  {
    value: 'moderation',
    label: '⚠️ Moderación',
    description: 'Notificación de moderación de contenido',
  },
];

export default function TestNotifications() {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<NotificationType>('application');
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const sendTestNotification = async () => {
    try {
      setLoading(true);
      setResult(null);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Sending test notification to user:', user.id);

      // Call test-notification edge function
      const { data, error } = await supabase.functions.invoke('test-notification', {
        body: {
          user_id: user.id,
          type: selectedType,
        },
      });

      if (error) {
        console.error('Error sending test notification:', error);
        throw error;
      }

      console.log('Test notification response:', data);

      setResult(data);

      toast({
        title: '✅ Notificación enviada',
        description: `Se envió una notificación de prueba tipo "${selectedType}". Revisa tu correo electrónico.`,
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error al enviar notificación',
        description: error.message || 'Ocurrió un error al enviar la notificación de prueba',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prueba de Notificaciones</h1>
        <p className="text-muted-foreground">
          Envía notificaciones de prueba para verificar el sistema de emails y notificaciones.
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Notificación</label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as NotificationType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={sendTestNotification} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Notificación de Prueba'
            )}
          </Button>

          {result && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Qué verifica esta prueba:</h2>
        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
          <li>Creación de notificación en la base de datos</li>
          <li>Procesamiento del trigger de notificaciones</li>
          <li>Envío de email usando plantillas React Email</li>
          <li>Configuración de Resend API</li>
          <li>Edge Functions funcionando correctamente</li>
        </ul>

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm">
            <strong>Nota:</strong> La notificación se enviará al email asociado a tu cuenta. 
            Revisa tu bandeja de entrada (y spam) después de enviar.
          </p>
        </div>
      </Card>
    </div>
  );
}
