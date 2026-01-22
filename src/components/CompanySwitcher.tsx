import React, { useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Plus, ChevronDown, Users, FileText, GraduationCap, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Determine subscription badge based on company status
  const getSubscriptionBadge = (company?: { status?: string; business_type?: string }) => {
    if (!company) return null;
    
    const isAcademy = company.business_type === 'academy';
    const isPremium = company.status === 'premium' || company.status === 'active';
    
    if (isPremium) {
      if (isAcademy) {
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-[10px] px-1.5 py-0 h-4 font-medium gap-1">
            <GraduationCap className="h-2.5 w-2.5" />
            Premium
          </Badge>
        );
      }
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px] px-1.5 py-0 h-4 font-medium gap-1">
          <Building className="h-2.5 w-2.5" />
          Premium
        </Badge>
      );
    }
    
    // Freemium
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-[10px] px-1.5 py-0 h-4 font-medium">
        Free
      </Badge>
    );
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

  const otherCompanies = userCompanies.filter(company => company.id !== activeCompany?.id);

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
                {activeCompany && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {getSubscriptionBadge(activeCompany)}
                  </div>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {/* Company Management Options - First */}
          {activeCompany && (
            <>
              <DropdownMenuItem onClick={() => navigate('/business-dashboard/company-profile')}>
                <FileText className="h-4 w-4 mr-2" />
                Detalles del negocio
              </DropdownMenuItem>
              {currentUserRole && (currentUserRole.role === 'owner' || currentUserRole.role === 'admin') && (
                <DropdownMenuItem onClick={() => navigate('/business-dashboard/users')}>
                  <Users className="h-4 w-4 mr-2" />
                  Gestión de usuarios
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsSubscriptionModalOpen(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Suscripción
              </DropdownMenuItem>
            </>
          )}
          
          {/* Company Selection - Other companies */}
          {otherCompanies.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Empresas
              </DropdownMenuLabel>
              {otherCompanies.map((company) => {
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
                        <div className="flex items-center gap-1 mt-0.5">
                          {getSubscriptionBadge(company)}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
          
          {/* Add Company - Last */}
          {showCreateButton && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar empresa
              </DropdownMenuItem>
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

      {/* Subscription Coming Soon Modal */}
      <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Próximamente
            </DialogTitle>
            <DialogDescription className="pt-2">
              Próximamente nuevas funcionalidades y planes Premium para empresas y academias.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsSubscriptionModalOpen(false)}>
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySwitcher;
