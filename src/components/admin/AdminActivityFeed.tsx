import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Building2, 
  Briefcase, 
  ShoppingBag, 
  FileText,
  Clock,
  Users,
  TrendingUp
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
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'company_created':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'opportunity_published':
        return <Briefcase className="h-4 w-4 text-purple-600" />;
      case 'service_published':
        return <ShoppingBag className="h-4 w-4 text-orange-600" />;
      case 'application_submitted':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'user_upgraded':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registered':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Nuevo Usuario</Badge>;
      case 'company_created':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Nueva Empresa</Badge>;
      case 'opportunity_published':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Nueva Oportunidad</Badge>;
      case 'service_published':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Nuevo Servicio</Badge>;
      case 'application_submitted':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Nueva Aplicación</Badge>;
      case 'user_upgraded':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Upgrade</Badge>;
      default:
        return <Badge variant="outline">Actividad</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay actividad reciente</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                    {getActivityBadge(activity.type)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminActivityFeed;
