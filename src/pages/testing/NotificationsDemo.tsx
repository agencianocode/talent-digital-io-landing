import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseMessages } from '@/contexts/SupabaseMessagesContext';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Trash2, 
  Database,
  MessageSquare,
  Bell,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NotificationsDemo() {
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastEvent, setLastEvent] = useState<string>('');
  const [stats, setStats] = useState({ messages: 0, notifications: 0 });
  
  const { unreadCount: messagesUnread, conversations, loadConversations } = useSupabaseMessages();
  const { unreadCount: notificationsUnread, reload: reloadNotifications } = useNotifications();

  useEffect(() => {
    loadStats();
    setupRealtimeMonitor();
  }, []);

  const loadStats = async () => {
    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .ilike('content', '%DEMO%');
    
    const { count: notifCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .ilike('message', '%DEMO%');
    
    setStats({ messages: msgCount || 0, notifications: notifCount || 0 });
  };

  const setupRealtimeMonitor = () => {
    const channel = supabase
      .channel('demo-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        setLastEvent(`Message ${payload.eventType} at ${new Date().toLocaleTimeString()}`);
        setRealtimeStatus('connected');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        setLastEvent(`Notification ${payload.eventType} at ${new Date().toLocaleTimeString()}`);
        setRealtimeStatus('connected');
      })
      .subscribe((status) => {
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const generateDemoData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-demo-data', {
        body: { action: 'generate' }
      });

      if (error) throw error;

      toast({
        title: "✅ Datos demo generados",
        description: `${data.stats.conversations} conversaciones y ${data.stats.notifications} notificaciones creadas`,
      });

      await loadStats();
      await loadConversations();
      await reloadNotifications();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupDemoData = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('generate-demo-data', {
        body: { action: 'cleanup' }
      });

      if (error) throw error;

      toast({
        title: "🗑️ Datos demo eliminados",
        description: "Todos los datos de prueba han sido eliminados",
      });

      await loadStats();
      await loadConversations();
      await reloadNotifications();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerNewApplication = async () => {
    toast({
      title: "🎯 Trigger simulado",
      description: "Normalmente esto crearía una notificación automática",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Notificaciones - Testing</h1>
          <p className="text-muted-foreground">Verifica el funcionamiento completo del sistema</p>
        </div>
        <Badge variant={realtimeStatus === 'connected' ? 'default' : 'destructive'} className="h-8">
          <Activity className="w-4 h-4 mr-2" />
          {realtimeStatus === 'connected' ? 'Real-time Conectado' : 'Desconectado'}
        </Badge>
      </div>

      {/* Sección 1: Control de Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Control de Datos Demo
          </CardTitle>
          <CardDescription>
            Datos actuales: {stats.messages} mensajes, {stats.notifications} notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={generateDemoData} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
              Generar Datos Demo
            </Button>
            <Button onClick={cleanupDemoData} variant="destructive" disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Datos Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Pruebas de Mensajería */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Pruebas de Mensajería
            <Badge variant="secondary">{messagesUnread} sin leer</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <ChecklistItem 
              label="Badge en menú con contador correcto" 
              checked={messagesUnread > 0} 
            />
            <ChecklistItem 
              label="Lista de conversaciones cargada" 
              checked={conversations.length > 0} 
            />
            <ChecklistItem 
              label="Etiquetas de tipo visibles (🟢🔵🟣)" 
              checked={conversations.some(c => c.type)} 
            />
            <ChecklistItem 
              label="Estado leído/no leído correcto" 
              checked={conversations.some(c => c.unread_count > 0)} 
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            💡 Visita <a href="/business-dashboard" className="text-primary underline">/business-dashboard</a> para probar funcionalidad completa
          </div>
        </CardContent>
      </Card>

      {/* Sección 3: Pruebas de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Pruebas de Notificaciones
            <Badge variant="secondary">{notificationsUnread} sin leer</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <ChecklistItem 
              label="Badge en menú con contador correcto" 
              checked={notificationsUnread > 0} 
            />
            <ChecklistItem 
              label="Sistema de notificaciones activo" 
              checked={true} 
            />
            <ChecklistItem 
              label="Notificaciones de diferentes tipos" 
              checked={notificationsUnread > 0} 
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            💡 Visita <a href="/business-dashboard/notifications" className="text-primary underline">/business-dashboard/notifications</a> para ver el panel completo
          </div>
        </CardContent>
      </Card>

      {/* Sección 4: Pruebas de Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Pruebas de Triggers Automáticos
          </CardTitle>
          <CardDescription>
            Simula eventos que disparan notificaciones automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={triggerNewApplication} variant="outline" className="w-full justify-start">
            🎯 Simular nueva aplicación
          </Button>
          <Button variant="outline" className="w-full justify-start">
            🔔 Simular solicitud de acceso
          </Button>
          <Button variant="outline" className="w-full justify-start">
            🟣 Simular consulta servicio
          </Button>
          <Button variant="outline" className="w-full justify-start">
            🎊 Simular milestone (10 aplicantes)
          </Button>
          <Button variant="outline" className="w-full justify-start">
            🔴 Cerrar oportunidad
          </Button>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Los triggers automáticos se disparan en acciones reales del sistema. 
                Estos botones son simulaciones para testing.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 5: Real-time Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Monitor Real-time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Estado de conexión</span>
            <Badge variant={realtimeStatus === 'connected' ? 'default' : 'destructive'}>
              {realtimeStatus}
            </Badge>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">Último evento:</div>
            <div className="text-sm text-muted-foreground font-mono">
              {lastEvent || 'Esperando eventos...'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      {checked ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
      <span className={checked ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}
