import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell,
  Check,
  X,
  MoreHorizontal,
  Clock,
  Users,
  Briefcase,
  ShoppingBag,
  Building,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface CategorizedNotification {
  id: string;
  type: 'company_activity' | 'opportunity_status' | 'application' | 'service_inquiry' | 'inactivity_reminder';
  category: '🟤 Empresarial' | '🟠 Oportunidades' | '🟢 Aplicaciones' | '🟣 Servicios' | '⚪ Recordatorios';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  suggestedActions?: {
    label: string;
    action: () => void;
    icon: React.ReactNode;
  }[];
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    opportunity_id?: string;
    application_id?: string;
    service_id?: string;
    user_id?: string;
  };
}

const AdvancedNotificationCenter = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();

  // Estados para filtros
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Procesar notificaciones con categorización
  const categorizedNotifications = useMemo(() => {
    return notifications.map(notification => {
      let category: CategorizedNotification['category'] = '⚪ Recordatorios';
      let type: CategorizedNotification['type'] = 'inactivity_reminder';
      let suggestedActions: CategorizedNotification['suggestedActions'] = [];

      // Determinar categoría basada en el contenido
      if (notification.title.includes('empresa') || notification.title.includes('equipo') || notification.title.includes('miembro')) {
        category = '🟤 Empresarial';
        type = 'company_activity';
        suggestedActions = [
          {
            label: 'Ver equipo',
            action: () => navigate('/business-dashboard/team'),
            icon: <Users className="h-4 w-4" />
          }
        ];
      } else if (notification.title.includes('oportunidad') || notification.title.includes('publicación') || notification.title.includes('vence')) {
        category = '🟠 Oportunidades';
        type = 'opportunity_status';
        suggestedActions = [
          {
            label: 'Ver oportunidad',
            action: () => navigate('/business-dashboard/opportunities'),
            icon: <Briefcase className="h-4 w-4" />
          },
          {
            label: 'Renovar',
            action: () => toast.info('Funcionalidad de renovación próximamente'),
            icon: <Calendar className="h-4 w-4" />
          }
        ];
      } else if (notification.title.includes('aplicó') || notification.title.includes('aplicación') || notification.title.includes('candidato')) {
        category = '🟢 Aplicaciones';
        type = 'application';
        suggestedActions = [
          {
            label: 'Revisar perfil',
            action: () => navigate('/business-dashboard/applications'),
            icon: <Eye className="h-4 w-4" />
          },
          {
            label: 'Responder',
            action: () => navigate('/business-dashboard/messages'),
            icon: <MessageSquare className="h-4 w-4" />
          },
          {
            label: 'Agendar entrevista',
            action: () => toast.info('Funcionalidad de agendar próximamente'),
            icon: <Calendar className="h-4 w-4" />
          }
        ];
      } else if (notification.title.includes('servicio') || notification.title.includes('consulta') || notification.title.includes('funnel')) {
        category = '🟣 Servicios';
        type = 'service_inquiry';
        suggestedActions = [
          {
            label: 'Responder mensaje',
            action: () => navigate('/business-dashboard/messages'),
            icon: <MessageSquare className="h-4 w-4" />
          },
          {
            label: 'Agendar llamada',
            action: () => toast.info('Funcionalidad de agendar próximamente'),
            icon: <Calendar className="h-4 w-4" />
          }
        ];
      }

      // Determinar prioridad
      let priority: CategorizedNotification['priority'] = 'medium';
      if (notification.title.includes('urgente') || notification.title.includes('vence') || notification.title.includes('crítico')) {
        priority = 'high';
      } else if (notification.title.includes('recordatorio') || notification.title.includes('sugerencia')) {
        priority = 'low';
      }

      return {
        ...notification,
        category,
        type,
        suggestedActions,
        priority,
        created_at: (notification as any).created_at || new Date().toISOString()
      } as CategorizedNotification;
    });
  }, [notifications, navigate]);

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    let filtered = categorizedNotifications;

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(notif => notif.category === categoryFilter);
    }

    // Filtrar por prioridad
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(notif => notif.priority === priorityFilter);
    }

    // Filtrar por estado
    if (statusFilter === 'unread') {
      filtered = filtered.filter(notif => !notif.read);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(notif => notif.read);
    }

    // Ordenar por prioridad y fecha
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [categorizedNotifications, categoryFilter, priorityFilter, statusFilter]);

  // Obtener icono para categoría
  const getCategoryIcon = (category: CategorizedNotification['category']) => {
    switch (category) {
      case '🟤 Empresarial':
        return <Building className="h-4 w-4 text-amber-600" />;
      case '🟠 Oportunidades':
        return <Briefcase className="h-4 w-4 text-orange-600" />;
      case '🟢 Aplicaciones':
        return <Users className="h-4 w-4 text-green-600" />;
      case '🟣 Servicios':
        return <ShoppingBag className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Obtener color de badge para prioridad
  const getPriorityBadgeColor = (priority: CategorizedNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Manejar clic en notificación
  const handleNotificationClick = (notification: CategorizedNotification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  // Manejar acción sugerida
  const handleSuggestedAction = (action: () => void) => {
    action();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h1>
            <p className="text-gray-600">
              {filteredNotifications.length} notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 text-purple-600 font-medium">
                  • {unreadCount} sin leer
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="🟤 Empresarial">🟤 Empresarial</SelectItem>
              <SelectItem value="🟠 Oportunidades">🟠 Oportunidades</SelectItem>
              <SelectItem value="🟢 Aplicaciones">🟢 Aplicaciones</SelectItem>
              <SelectItem value="🟣 Servicios">🟣 Servicios</SelectItem>
              <SelectItem value="⚪ Recordatorios">⚪ Recordatorios</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">No leídas</SelectItem>
              <SelectItem value="read">Leídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600">
                Las notificaciones de actividad aparecerán aquí
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-0 rounded-none hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icono de categoría */}
                    <div className="flex-shrink-0">
                      {getCategoryIcon(notification.category)}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <Badge className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}>
                            {notification.priority === 'high' ? 'Alta' : 
                             notification.priority === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Marcar como leída
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {notification.message}
                      </p>

                      {/* Acciones sugeridas */}
                      {notification.suggestedActions && notification.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {notification.suggestedActions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuggestedAction(action.action);
                              }}
                            >
                              {action.icon}
                              <span className="ml-1">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Fecha */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedNotificationCenter;
