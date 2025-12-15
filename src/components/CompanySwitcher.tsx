import React, { useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Plus, ChevronDown, Users, FileText, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateCompanyDialog from '@/components/CreateCompanyDialog';

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
    isLoading,
    refreshCompanies 
  } = useCompany();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getCompanyTypeIcon = (businessType?: string) => {
    if (businessType === 'academy') {
      return <GraduationCap className="h-3 w-3 text-muted-foreground" />;
    }
    return <Building className="h-3 w-3 text-muted-foreground" />;
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
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Crear Empresa
            </Button>
            <CreateCompanyDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onCompanyCreated={async () => {
                await refreshCompanies();
              }}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-purple-50 hover:text-slate-900">
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeCompany?.logo_url} alt={activeCompany?.name} />
                <AvatarFallback className="text-xs">
                  {activeCompany?.name?.substring(0, 2).toUpperCase() || 'EM'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{activeCompany?.name || 'Seleccionar empresa'}</p>
                {currentUserRole && (
                  <div className="flex items-center gap-1">
                    {getCompanyTypeIcon(activeCompany?.business_type)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {currentUserRole.role}
                    </span>
                  </div>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {/* Company Selection - Only show other companies */}
          {userCompanies.filter(company => company.id !== activeCompany?.id).map((company) => {
            const userRole = company.user_id === activeCompany?.user_id ? 'owner' : 
              currentUserRole?.company_id === company.id ? currentUserRole.role : 'viewer';
            
            return (
              <DropdownMenuItem 
                key={company.id} 
                onClick={() => switchCompany(company.id)}
                className="p-3"
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={company.logo_url} alt={company.name} />
                    <AvatarFallback className="text-xs">
                      {company.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {company.name}
                    </div>
                    <div className="flex items-center gap-1">
                      {getCompanyTypeIcon(company.business_type)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {userRole}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          {showCreateButton && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar empresa
              </DropdownMenuItem>
            </>
          )}
          
          {/* Company Management Options */}
          {activeCompany && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/business-dashboard/company-details')}>
                <FileText className="h-4 w-4 mr-2" />
                Detalles del negocio
              </DropdownMenuItem>
              {currentUserRole && (currentUserRole.role === 'owner' || currentUserRole.role === 'admin') && (
                <DropdownMenuItem onClick={() => navigate('/business-dashboard/users')}>
                  <Users className="h-4 w-4 mr-2" />
                  Gestión de usuarios
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showCreateButton && (
        <CreateCompanyDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCompanyCreated={async () => {
            await refreshCompanies();
          }}
        />
      )}
    </div>
  );
};

export default CompanySwitcher;