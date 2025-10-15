import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Users, 
  Play, 
  Pause, 
  Copy,
  Link,
  Eye as EyeIcon,
  AlertTriangle,
  Mail,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useOpportunityDashboard } from '@/hooks/useOpportunityDashboard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityListProps {
  onApplicationsView?: (opportunityId: string) => void;
  useMockData?: boolean;
}

export const OpportunityList = ({ onApplicationsView, useMockData = false }: OpportunityListProps) => {
  const navigate = useNavigate();
  const { 
    opportunities, 
    isLoading, 
    deleteOpportunity,
    toggleOpportunityStatus,
    applicationCounts: hookApplicationCounts,
    viewCounts
  } = useOpportunityDashboard(useMockData);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<any>(null);
  // Usar applicationCounts del hook
  const applicationCounts = hookApplicationCounts;


  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'draft': return 'Borrador';
      case 'paused': return 'Pausada';
      case 'closed': return 'Cerrada';
      default: return status;
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opp.category && opp.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (opp.category && opp.category === categoryFilter);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDuplicate = async (opportunity: any) => {
    try {
      navigate('/business-dashboard/opportunities/new', { 
        state: { template: opportunity } 
      });
      toast.success('Oportunidad duplicada como borrador');
    } catch (error) {
      toast.error('Error al duplicar la oportunidad');
    }
  };

  const handleCopyInvitationLink = async (opportunity: any) => {
    try {
      // Generar enlace de invitación si no existe
      let invitationLink = (opportunity as any).invitation_link;
      
      if (!invitationLink) {
        invitationLink = `${window.location.origin}/opportunity/invite/${opportunity.id}`;
        
        // Actualizar la oportunidad con el enlace generado
        await supabase
          .from('opportunities')
          .update({ invitation_link: invitationLink } as any)
          .eq('id', opportunity.id);
      }
      
      // Copiar al portapapeles
      await navigator.clipboard.writeText(invitationLink);
      toast.success('¡Enlace de invitación copiado al portapapeles!');
    } catch (error) {
      console.error('Error copying invitation link:', error);
      toast.error('Error al copiar el enlace de invitación');
    }
  };

  const handleToggleStatus = async (opportunityId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await toggleOpportunityStatus(opportunityId, newStatus === 'active');
      toast.success(`Oportunidad ${newStatus === 'active' ? 'activada' : 'pausada'} exitosamente`);
    } catch (error) {
      toast.error('Error al cambiar el estado de la oportunidad');
    }
  };

  const handleDeleteClick = (opportunity: any) => {
    setOpportunityToDelete(opportunity);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!opportunityToDelete) return;
    
    try {
      await deleteOpportunity(opportunityToDelete.id);
      toast.success('Oportunidad eliminada exitosamente');
      setDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar la oportunidad');
    }
  };

  const categories = [...new Set(opportunities.map(opp => opp.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-full sm:w-40">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Estado</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="paused">Pausada</SelectItem>
              <SelectItem value="closed">Cerrada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-40">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Rol</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category || ''}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No se encontraron oportunidades</h3>
                  <p className="text-gray-500">Intenta ajustar los filtros o crear una nueva oportunidad</p>
                </div>
                <Button onClick={() => navigate('/business-dashboard/opportunities/new')}>
                  Crear Nueva Oportunidad
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Company Logo Placeholder - Hidden on mobile */}
                  <div className="hidden sm:flex w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with Title and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start flex-wrap gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer flex-1"
                              onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}`)}>
                            {opportunity.title}
                          </h3>
                          {/* Status Badge */}
                          <Badge className={`text-xs font-medium px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                            opportunity.status === 'active' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : opportunity.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : opportunity.status === 'closed'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {getStatusText(opportunity.status || 'draft')}
                          </Badge>
                          
                          {/* Academia Exclusiva Badge */}
                          {(opportunity as any).is_academy_exclusive && (
                            <Badge className="text-xs font-medium px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 bg-purple-100 text-purple-800 border-purple-200">
                              Exclusiva Academia
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm text-gray-600">
                            {(opportunity as any).company_name || 'Mi Empresa'}
                          </p>
                          {opportunity.category && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs sm:text-sm text-gray-600">{opportunity.category}</span>
                            </>
                          )}
                          <span className="text-gray-400">•</span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {formatDistanceToNow(new Date(opportunity.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{viewCounts[opportunity.id] || 0} vistas</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{applicationCounts[opportunity.id] || 0} Postulantes</span>
                      </div>
                      
                      {(applicationCounts[opportunity.id] || 0) > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{Math.floor((applicationCounts[opportunity.id] || 0) / 3) + 1} Postulaciones sin revisar</span>
                          <span className="sm:hidden">{Math.floor((applicationCounts[opportunity.id] || 0) / 3) + 1} sin revisar</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-blue-600">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{Math.floor(Math.random() * 3) + 1} Mensaje sin leer</span>
                        <span className="sm:hidden">{Math.floor(Math.random() * 3) + 1} sin leer</span>
                      </div>
                    </div>

                    {/* Action Buttons - Mobile */}
                    <div className="flex sm:hidden items-center gap-2 mt-3">
                      <Button
                        onClick={() => onApplicationsView?.(opportunity.id)}
                        className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg text-xs h-8"
                      >
                        Ver Postulantes
                      </Button>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles Completos
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onApplicationsView?.(opportunity.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Ver Postulantes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(opportunity.id, opportunity.status || 'draft')}
                          >
                            {opportunity.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          {opportunity.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleCopyInvitationLink(opportunity)}>
                              <Link className="h-4 w-4 mr-2" />
                              Copiar enlace de invitación
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicate(opportunity)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(opportunity)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Action Buttons - Desktop */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => onApplicationsView?.(opportunity.id)}
                      className="bg-black hover:bg-gray-800 text-white rounded-lg"
                    >
                      Ver Postulantes
                    </Button>
                    
                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles Completos
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onApplicationsView?.(opportunity.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Ver Postulantes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(opportunity.id, opportunity.status || 'draft')}
                        >
                          {opportunity.status === 'active' ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        {opportunity.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleCopyInvitationLink(opportunity)}>
                            <Link className="h-4 w-4 mr-2" />
                            Copiar enlace de invitación
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicate(opportunity)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(opportunity)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar oportunidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la oportunidad{' '}
              <span className="font-semibold">"{opportunityToDelete?.title}"</span>
              {opportunityToDelete?.status === 'draft' 
                ? ' (en borrador)' 
                : ' y todas las postulaciones asociadas'}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
