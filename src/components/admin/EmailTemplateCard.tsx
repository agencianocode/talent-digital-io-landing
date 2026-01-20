import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, ChevronRight } from 'lucide-react';

interface EmailTemplateCardProps {
  id: string;
  name: string;
  subject: string;
  description?: string | null;
  isActive: boolean;
  onClick: () => void;
}

export const EmailTemplateCard: React.FC<EmailTemplateCardProps> = ({
  id,
  name,
  subject,
  description,
  isActive,
  onClick,
}) => {
  const getCategoryInfo = (templateId: string) => {
    if (['magic-link', 'confirm-signup', 'reset-password'].includes(templateId)) {
      return { label: 'Autenticación', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    }
    if (['welcome-talent', 'welcome-business'].includes(templateId)) {
      return { label: 'Bienvenida', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    }
    if (['company-invitation', 'membership-request', 'membership-approved'].includes(templateId)) {
      return { label: 'Empresa', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
    }
    return { label: 'Notificación', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
  };

  const category = getCategoryInfo(id);

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg shrink-0">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{name}</h3>
              <Badge 
                variant={isActive ? "default" : "secondary"} 
                className={isActive ? "bg-green-600 hover:bg-green-600" : ""}
              >
                {isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 truncate">
              {description || 'Sin descripción'}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={category.color}>
                {category.label}
              </Badge>
              <span className="text-xs text-muted-foreground truncate flex-1">
                Asunto: {subject}
              </span>
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
