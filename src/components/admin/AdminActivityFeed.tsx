import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserPlus, 
  Building2, 
  Briefcase, 
  ShoppingBag, 
  FileText,
  Clock,
  Users,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'company_created' | 'opportunity_published' | 'service_published' | 'application_submitted' | 'user_upgraded';
  title: string;
  description: string;
  user_name?: string;
  company_name?: string;
  opportunity_title?: string;
  service_title?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface AdminActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({ activities, isLoading = false }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registered':
        return { icon: UserPlus, color: 'bg-green-500', bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'company_created':
        return { icon: Building2, color: 'bg-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'opportunity_published':
        return { icon: Briefcase, color: 'bg-purple-500', bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'service_published':
        return { icon: ShoppingBag, color: 'bg-orange-500', bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
      case 'application_submitted':
        return { icon: FileText, color: 'bg-indigo-500', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' };
      case 'user_upgraded':
        return { icon: Sparkles, color: 'bg-yellow-500', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
      default:
        return { icon: Clock, color: 'bg-gray-500', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registered':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Nuevo Usuario</Badge>;
      case 'company_created':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Nueva Empresa</Badge>;
      case 'opportunity_published':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Nueva Oportunidad</Badge>;
      case 'service_published':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Nuevo Servicio</Badge>;
      case 'application_submitted':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">Nueva Aplicación</Badge>;
      case 'user_upgraded':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Upgrade</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Actividad</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-3 w-1/2 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          Actividad Reciente
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activities.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {activities.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="p-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent"></div>
                
                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const { icon: Icon, bgColor, textColor } = getActivityIcon(activity.type);
                    
                    return (
                      <div 
                        key={activity.id} 
                        className="relative pl-12 pb-4 group"
                        style={{
                          animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        {/* Icon with background */}
                        <div className={`absolute left-0 top-0 h-10 w-10 ${bgColor} rounded-full flex items-center justify-center ring-4 ring-background transition-transform group-hover:scale-110`}>
                          <Icon className={`h-5 w-5 ${textColor}`} />
                        </div>
                        
                        {/* Content card */}
                        <div className="bg-card border rounded-lg p-3 hover:shadow-md transition-all group-hover:border-primary/30">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold leading-tight flex-1">
                              {activity.title}
                            </h4>
                            {getActivityBadge(activity.type)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(activity.created_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminActivityFeed;
