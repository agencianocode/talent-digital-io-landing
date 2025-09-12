import React from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Crown, Shield, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CompanySwitcherProps {
  className?: string;
  showCreateButton?: boolean;
}

const CompanySwitcher: React.FC<CompanySwitcherProps> = ({ 
  className = "", 
  showCreateButton = false 
}) => {
  const { 
    activeCompany, 
    userCompanies, 
    currentUserRole,
    switchCompany, 
    isLoading 
  } = useCompany();
  const navigate = useNavigate();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-3 w-3 text-gray-500" />;
      default:
        return <Building className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-full"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Don't show create button if we have no companies but are still loading
  // This prevents flashing the button during initial load after registration
  if (userCompanies.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-sm text-muted-foreground">
          No hay empresas disponibles
        </div>
        {showCreateButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/register-business')}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Crear Empresa
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select 
        value={activeCompany?.id || ""} 
        onValueChange={switchCompany}
      >
        <SelectTrigger className="w-[280px] h-auto p-2">
          <SelectValue placeholder="Seleccionar empresa">
            {activeCompany && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activeCompany.logo_url} alt={activeCompany.name} />
                  <AvatarFallback className="text-xs">
                    {activeCompany.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0">
                  <div className="font-medium text-sm truncate max-w-[150px]">
                    {activeCompany.name}
                  </div>
                  {currentUserRole && (
                    <div className="flex items-center gap-1">
                      {getRoleIcon(currentUserRole.role)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {currentUserRole.role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="w-[280px] bg-background border shadow-md z-50">
          {userCompanies.map((company) => {
            // Find user's role in this company
            const userRole = company.user_id === activeCompany?.user_id ? 'owner' : 
              currentUserRole?.company_id === company.id ? currentUserRole.role : 'viewer';
            
            return (
              <SelectItem key={company.id} value={company.id} className="p-3">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={company.logo_url} alt={company.name} />
                    <AvatarFallback className="text-xs">
                      {company.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <div className="font-medium text-sm truncate max-w-[150px]">
                      {company.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getRoleIcon(userRole)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {userRole}
                        </span>
                      </div>
                      {company.business_type && (
                        <Badge variant="outline" className="text-xs">
                          {company.business_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
          
          {showCreateButton && (
            <>
              <div className="border-t my-1"></div>
              <SelectItem value="create-new" className="p-3">
                <div 
                  className="flex items-center gap-3 w-full text-primary cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register-business');
                  }}
                >
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Crear Nueva Empresa</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanySwitcher;