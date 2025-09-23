import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Users, 
  Play, 
  Pause, 
  Archive, 
  Copy,
  MapPin,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useOpportunityDashboard } from '@/hooks/useOpportunityDashboard';
import { toast } from 'sonner';

interface OpportunityListProps {
  onApplicationsView?: (opportunityId: string) => void;
  useMockData?: boolean;
}

export const OpportunityList = ({ onApplicationsView, useMockData = true }: OpportunityListProps) => {
  const navigate = useNavigate();
  const { 
    opportunities, 
    isLoading, 
    deleteOpportunity,
    toggleOpportunityStatus,
    applicationCounts: hookApplicationCounts
  } = useOpportunityDashboard(useMockData);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  // Usar applicationCounts del hook
  const applicationCounts = hookApplicationCounts;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  const handleToggleStatus = async (opportunityId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await toggleOpportunityStatus(opportunityId, newStatus === 'active');
      toast.success(`Oportunidad ${newStatus === 'active' ? 'activada' : 'pausada'} exitosamente`);
    } catch (error) {
      toast.error('Error al cambiar el estado de la oportunidad');
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
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
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

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
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
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}`)}>
                          {opportunity.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {opportunity.category || 'Sin categoría'}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(opportunity.status || 'draft')}`}>
                            {getStatusText(opportunity.status || 'draft')}
                          </Badge>
                          {(opportunity as any).is_academy_exclusive && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                              [exclusiva academia]
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Applications Count */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => onApplicationsView?.(opportunity.id)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {applicationCounts[opportunity.id] || 0}
                          {(applicationCounts[opportunity.id] || 0) > 5 && (
                            <Badge variant="destructive" className="ml-1 text-xs">
                              {Math.floor((applicationCounts[opportunity.id] || 0) / 3)} sin revisar
                            </Badge>
                          )}
                        </Button>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
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
                            <DropdownMenuItem onClick={() => handleDuplicate(opportunity)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteOpportunity(opportunity.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Cerrar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {opportunity.location || 
                           (opportunity as any).location_type === 'remote' ? 'Remoto' :
                           (opportunity as any).location_type === 'onsite' ? 'Presencial' :
                           (opportunity as any).location_type === 'hybrid' ? 'Híbrido' :
                           'No especificado'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {opportunity.salary_min && opportunity.salary_max 
                            ? `$${opportunity.salary_min} - $${opportunity.salary_max}${
                                (opportunity as any).salary_period ? 
                                  ` (${(opportunity as any).salary_period === 'hourly' ? 'por hora' :
                                       (opportunity as any).salary_period === 'weekly' ? 'semanal' :
                                       (opportunity as any).salary_period === 'monthly' ? 'mensual' :
                                       (opportunity as any).salary_period === 'yearly' ? 'anual' : ''})` 
                                : ''
                              }`
                            : (opportunity as any).payment_type === 'commission' ? 'Por comisión' :
                              (opportunity as any).payment_type === 'mixed' ? 'Fijo + Comisión' :
                              'A convenir'
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Publicado {formatDistanceToNow(new Date(opportunity.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    {opportunity.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {opportunity.description.substring(0, 150)}
                        {opportunity.description.length > 150 && '...'}
                      </p>
                    )}

                    {/* Skills Tags */}
                    {(opportunity as any).skills && (opportunity as any).skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(opportunity as any).skills.slice(0, 4).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(opportunity as any).skills.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(opportunity as any).skills.length - 4} más
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Deadline Warning */}
                    {(opportunity as any).deadline_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600">
                          Fecha límite: {new Date((opportunity as any).deadline_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
