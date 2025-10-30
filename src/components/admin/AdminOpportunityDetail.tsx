import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users,
  Edit,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Tag,
  Clock,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FormattedOpportunityText } from '@/lib/markdown-formatter';

interface OpportunityDetail {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  category: string;
  type: string;
  contract_type: string;
  duration_type?: string | null;
  duration_value?: number | null;
  duration_unit?: string | null;
  location: string;
  timezone_preference?: string | null;
  deadline_date?: string | null;
  payment_type: string;
  salary_min?: number | null;
  salary_max?: number | null;
  currency: string;
  commission_percentage?: number | null;
  salary_is_public: boolean;
  skills: string[];
  experience_levels: string[];
  is_active: boolean;
  status: string;
  is_academy_exclusive: boolean;
  is_public: boolean;
  public_url?: string | null;
  created_at: string;
  updated_at: string;
  company_id: string;
  company_name: string;
  company_logo?: string;
  applications_count: number;
  views_count: number;
  priority: string;
  admin_notes?: string;
}

interface AdminOpportunityDetailProps {
  opportunityId: string;
  isOpen: boolean;
  onClose: () => void;
  onOpportunityUpdate: () => void;
}

const AdminOpportunityDetail: React.FC<AdminOpportunityDetailProps> = ({
  opportunityId,
  isOpen,
  onClose,
  onOpportunityUpdate
}) => {
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<OpportunityDetail>>({});
  const [adminNotes, setAdminNotes] = useState('');

  const loadOpportunityDetail = async () => {
    if (!opportunityId) return;
    
    setIsLoading(true);
    try {
      // Load opportunity data
      const { data: opportunityData, error: opportunityError } = await supabase
        .from('opportunities')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url
          )
        `)
        .eq('id', opportunityId)
        .single();

      if (opportunityError) throw opportunityError;

      // Load applications count
      const { count: applicationsCount, error: applicationsError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', opportunityId);

      if (applicationsError) throw applicationsError;

      const opportunityDetail: OpportunityDetail = {
        id: opportunityData.id,
        title: opportunityData.title,
        description: opportunityData.description,
        requirements: opportunityData.requirements || '',
        category: opportunityData.category,
        type: opportunityData.type || 'remote',
        contract_type: opportunityData.contract_type || 'full-time',
        duration_type: opportunityData.duration_type || 'indefinite',
        duration_value: opportunityData.duration_value,
        duration_unit: opportunityData.duration_unit,
        location: opportunityData.location || '',
        timezone_preference: opportunityData.timezone_preference,
        deadline_date: opportunityData.deadline_date,
        payment_type: opportunityData.payment_type || 'fixed',
        salary_min: opportunityData.salary_min,
        salary_max: opportunityData.salary_max,
        currency: opportunityData.currency || 'USD',
        commission_percentage: opportunityData.commission_percentage,
        salary_is_public: opportunityData.salary_is_public ?? true,
        skills: opportunityData.skills || [],
        experience_levels: opportunityData.experience_levels || [],
        is_active: opportunityData.is_active || false,
        status: opportunityData.status || 'draft',
        is_academy_exclusive: opportunityData.is_academy_exclusive || false,
        is_public: opportunityData.is_public ?? true,
        public_url: opportunityData.public_url,
        created_at: opportunityData.created_at,
        updated_at: opportunityData.updated_at,
        company_id: opportunityData.company_id,
        company_name: (opportunityData.companies as any)?.name || 'Empresa desconocida',
        company_logo: (opportunityData.companies as any)?.logo_url,
        applications_count: applicationsCount || 0,
        views_count: 0, // TODO: Implement views tracking
        priority: (opportunityData as any).priority || 'medium',
        admin_notes: (opportunityData as any).admin_notes
      };

      setOpportunity(opportunityDetail);
      setEditData(opportunityDetail);
      setAdminNotes((opportunityData as any).admin_notes || '');
    } catch (error) {
      console.error('Error loading opportunity detail:', error);
      toast.error('Error al cargar los detalles de la oportunidad');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && opportunityId) {
      loadOpportunityDetail();
    }
  }, [isOpen, opportunityId]);

  const handleSaveChanges = async () => {
    if (!opportunity) return;

    setIsUpdating(true);
    try {
      // Validate salary range
      if (editData.salary_min && editData.salary_max && editData.salary_min > editData.salary_max) {
        toast.error('El salario mínimo no puede ser mayor que el máximo');
        return;
      }

      // Validate duration
      if (editData.duration_type !== 'indefinite' && editData.duration_value && editData.duration_value <= 0) {
        toast.error('La duración debe ser un valor positivo');
        return;
      }

      const { error } = await supabase
        .from('opportunities')
        .update({
          title: editData.title,
          description: editData.description,
          requirements: editData.requirements,
          category: editData.category,
          type: editData.type,
          contract_type: editData.contract_type,
          duration_type: editData.duration_type,
          duration_value: editData.duration_value,
          duration_unit: editData.duration_unit,
          location: editData.location,
          timezone_preference: editData.timezone_preference,
          deadline_date: editData.deadline_date,
          payment_type: editData.payment_type,
          salary_min: editData.salary_min,
          salary_max: editData.salary_max,
          currency: editData.currency,
          commission_percentage: editData.commission_percentage,
          salary_is_public: editData.salary_is_public,
          is_academy_exclusive: editData.is_academy_exclusive,
          is_public: editData.is_public,
          skills: editData.skills,
          experience_levels: editData.experience_levels,
          admin_notes: adminNotes
        })
        .eq('id', opportunityId);

      if (error) throw error;

      toast.success('Oportunidad actualizada correctamente');
      setIsEditing(false);
      onOpportunityUpdate();
      loadOpportunityDetail();
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Error al actualizar la oportunidad');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!opportunity) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          status: newStatus as any,
          is_active: newStatus === 'active'
        })
        .eq('id', opportunityId);

      if (error) throw error;

      toast.success(`Oportunidad ${newStatus === 'active' ? 'activada' : 'pausada'} correctamente`);
      onOpportunityUpdate();
      loadOpportunityDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al cambiar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!opportunity) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ priority: newPriority as any } as any)
        .eq('id', opportunityId);

      if (error) throw error;

      toast.success('Prioridad actualizada correctamente');
      onOpportunityUpdate();
      loadOpportunityDetail();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Error al actualizar la prioridad');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOpportunity = async () => {
    if (!opportunity || !confirm('¿Estás seguro de que deseas dar de baja esta oportunidad?')) return;

    setIsUpdating(true);
    try {
      // Soft delete: set status to closed
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          status: 'closed' as any,
          is_active: false
        })
        .eq('id', opportunityId);

      if (error) throw error;

      toast.success('Oportunidad dada de baja correctamente');
      onOpportunityUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Error al dar de baja la oportunidad');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pausada</Badge>;
      case 'closed':
        return <Badge variant="destructive">Cerrada</Badge>;
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      case 'review-required':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Revisión Requerida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-100 text-green-800">Baja</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      ventas: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      'atencion-cliente': 'bg-purple-100 text-purple-800',
      operaciones: 'bg-orange-100 text-orange-800',
      creativo: 'bg-pink-100 text-pink-800',
      tecnologia: 'bg-indigo-100 text-indigo-800',
      'soporte-profesional': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="secondary" className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-0 p-2 sm:p-6">
          <DialogHeader className="px-3 sm:px-6">
            <DialogTitle className="text-lg sm:text-xl">Cargando oportunidad...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!opportunity) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-0 p-2 sm:p-6">
          <DialogHeader className="px-3 sm:px-6">
            <DialogTitle className="text-lg sm:text-xl">Oportunidad no encontrada</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-sm sm:text-base">No se pudo cargar la información de la oportunidad</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-0 p-2 sm:p-6">
        <DialogHeader className="px-2 sm:px-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Detalles de la Oportunidad</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
          {/* Header con acciones */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(opportunity.status)}
              {getPriorityBadge(opportunity.priority)}
              {getCategoryBadge(opportunity.category)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
              {opportunity.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('paused')}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pausar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('active')}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Activar
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteOpportunity}
                disabled={isUpdating}
                className="text-xs"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Dar de Baja
              </Button>
            </div>
          </div>

          {/* Información Básica */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Título</Label>
                  {isEditing ? (
                    <Input
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium text-sm sm:text-base mt-1">{opportunity.title}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Descripción</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={4}
                      className="mt-1 resize-none w-full"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs sm:text-sm text-muted-foreground break-words max-h-32 overflow-y-auto">
                      <FormattedOpportunityText 
                        text={opportunity.description} 
                        className=""
                      />
                    </div>
                  )}
                </div>

                  <div>
                    <Label>Categoría</Label>
                    {isEditing ? (
                      <Select
                        value={editData.category || ''}
                        onValueChange={(value) => setEditData({ ...editData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ventas">Ventas</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="atencion-cliente">Atención Cliente</SelectItem>
                          <SelectItem value="operaciones">Operaciones</SelectItem>
                          <SelectItem value="creativo">Creativo</SelectItem>
                          <SelectItem value="tecnologia">Tecnología</SelectItem>
                          <SelectItem value="soporte-profesional">Soporte Profesional</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{opportunity.category}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo de Contrato</Label>
                    {isEditing ? (
                      <Select
                        value={editData.contract_type || ''}
                        onValueChange={(value) => setEditData({ ...editData, contract_type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="commission">Por Comisión</SelectItem>
                          <SelectItem value="fixed-commission">Fijo + Comisión</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium text-sm sm:text-base mt-1">{opportunity.contract_type}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tipo de Oportunidad</Label>
                    {isEditing ? (
                      <Select
                        value={editData.type || ''}
                        onValueChange={(value) => setEditData({ ...editData, type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remoto</SelectItem>
                          <SelectItem value="on-site">Presencial</SelectItem>
                          <SelectItem value="hybrid">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium text-sm sm:text-base mt-1">{opportunity.type}</p>
                    )}
                  </div>

                  <div>
                    <Label>Duración</Label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Select
                          value={editData.duration_type || 'indefinite'}
                          onValueChange={(value) => setEditData({ ...editData, duration_type: value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indefinite">Indefinido</SelectItem>
                            <SelectItem value="temporary">Temporal</SelectItem>
                            <SelectItem value="project">Por proyecto</SelectItem>
                          </SelectContent>
                        </Select>
                        {editData.duration_type !== 'indefinite' && (
                          <>
                            <Input
                              type="number"
                              className="w-20"
                              value={editData.duration_value || ''}
                              onChange={(e) => setEditData({ ...editData, duration_value: parseInt(e.target.value) || undefined })}
                              placeholder="0"
                            />
                            <Select
                              value={editData.duration_unit || 'months'}
                              onValueChange={(value) => setEditData({ ...editData, duration_unit: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="days">Días</SelectItem>
                                <SelectItem value="weeks">Semanas</SelectItem>
                                <SelectItem value="months">Meses</SelectItem>
                                <SelectItem value="years">Años</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {opportunity.duration_type === 'indefinite' 
                            ? 'Indefinido' 
                            : `${opportunity.duration_value} ${opportunity.duration_unit}`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Ubicación</Label>
                    {isEditing ? (
                      <Input
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        placeholder="Remoto, Ciudad, País"
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm sm:text-base break-words min-w-0 flex-1">{opportunity.location}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Zona Horaria Preferida</Label>
                    {isEditing ? (
                      <Input
                        value={editData.timezone_preference || ''}
                        onChange={(e) => setEditData({ ...editData, timezone_preference: e.target.value })}
                        placeholder="Ej: GMT-5, UTC-3"
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm sm:text-base break-words min-w-0 flex-1">{opportunity.timezone_preference || 'No especificada'}</span>
                      </div>
                    )}
                  </div>

                  {(opportunity.deadline_date || isEditing) && (
                    <div>
                      <Label>Fecha Límite</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editData.deadline_date || ''}
                          onChange={(e) => setEditData({ ...editData, deadline_date: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{opportunity.deadline_date ? new Date(opportunity.deadline_date).toLocaleDateString('es') : 'Sin fecha límite'}</span>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Requisitos */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Requisitos</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              {isEditing ? (
                <Textarea
                  value={editData.requirements || ''}
                  onChange={(e) => setEditData({ ...editData, requirements: e.target.value })}
                  rows={4}
                  placeholder="Describe los requisitos para esta oportunidad..."
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  {opportunity.requirements ? (
                    <FormattedOpportunityText 
                      text={opportunity.requirements} 
                      className=""
                    />
                  ) : (
                    'No especificados'
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Salarial */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Salarial
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Tipo de Pago</Label>
                  {isEditing ? (
                    <Select
                      value={editData.payment_type || ''}
                      onValueChange={(value) => setEditData({ ...editData, payment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fijo</SelectItem>
                        <SelectItem value="commission">Por Comisión</SelectItem>
                        <SelectItem value="fixed_commission">Fijo + Comisión</SelectItem>
                        <SelectItem value="hourly">Por Hora</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{opportunity.payment_type}</p>
                  )}
                </div>

                <div>
                  <Label>Moneda</Label>
                  {isEditing ? (
                    <Select
                      value={editData.currency || 'USD'}
                      onValueChange={(value) => setEditData({ ...editData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="CLP">CLP</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{opportunity.currency}</p>
                  )}
                </div>

                <div>
                  <Label>Salario Mínimo</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.salary_min || ''}
                      onChange={(e) => setEditData({ ...editData, salary_min: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                    />
                  ) : (
                    <p className="font-medium text-sm sm:text-base break-words">
                      {opportunity.salary_min 
                        ? `${opportunity.currency} ${opportunity.salary_min.toLocaleString()}`
                        : 'No especificado'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <Label>Salario Máximo</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.salary_max || ''}
                      onChange={(e) => setEditData({ ...editData, salary_max: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                    />
                  ) : (
                    <p className="font-medium text-sm sm:text-base break-words">
                      {opportunity.salary_max 
                        ? `${opportunity.currency} ${opportunity.salary_max.toLocaleString()}`
                        : 'No especificado'
                      }
                    </p>
                  )}
                </div>

                {(opportunity.commission_percentage || isEditing) && (
                  <div>
                    <Label>Comisión (%)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.commission_percentage || ''}
                        onChange={(e) => setEditData({ ...editData, commission_percentage: parseInt(e.target.value) || undefined })}
                        placeholder="0"
                        max="100"
                      />
                    ) : (
                      <p className="font-medium">{opportunity.commission_percentage}%</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Label>Mostrar Salario Públicamente</Label>
                  {isEditing ? (
                    <Switch
                      checked={editData.salary_is_public ?? true}
                      onCheckedChange={(checked) => setEditData({ ...editData, salary_is_public: checked })}
                    />
                  ) : (
                    <p className="font-medium">{opportunity.salary_is_public ? 'Sí' : 'No'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills y Experiencia */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Skills y Experiencia
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className="space-y-4">
                <div>
                  <Label>Skills Requeridas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opportunity.skills.length > 0 ? (
                      opportunity.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No especificadas</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Niveles de Experiencia</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opportunity.experience_levels.length > 0 ? (
                      opportunity.experience_levels.map((level, index) => (
                        <Badge key={index} variant="secondary">{level}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No especificados</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Visibilidad */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Configuración de Visibilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Oportunidad Pública</Label>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.is_public 
                        ? 'Visible en búsquedas públicas' 
                        : 'Solo visible para usuarios autenticados'
                      }
                    </p>
                  </div>
                  {isEditing ? (
                    <Switch
                      checked={editData.is_public ?? true}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_public: checked })}
                    />
                  ) : (
                    <Badge variant={opportunity.is_public ? 'default' : 'secondary'}>
                      {opportunity.is_public ? 'Pública' : 'Privada'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exclusivo para Academias</Label>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.is_academy_exclusive 
                        ? 'Solo visible para estudiantes de academias' 
                        : 'Visible para todos los usuarios'
                      }
                    </p>
                  </div>
                  {isEditing ? (
                    <Switch
                      checked={editData.is_academy_exclusive ?? false}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_academy_exclusive: checked })}
                    />
                  ) : (
                    <Badge variant={opportunity.is_academy_exclusive ? 'default' : 'outline'}>
                      {opportunity.is_academy_exclusive ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>

                {opportunity.public_url && (
                  <div>
                    <Label>URL Pública</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-xs bg-muted p-2 rounded">
                        {opportunity.public_url}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(opportunity.public_url!);
                          toast.success('URL copiada al portapapeles');
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg sm:text-2xl font-bold">{opportunity.applications_count}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Postulaciones</p>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-lg sm:text-2xl font-bold">{opportunity.views_count}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Visualizaciones</p>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg sm:col-span-2 lg:col-span-1">
                  <Building className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-lg sm:text-2xl font-bold break-words">{opportunity.company_name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Empresa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones de Moderación */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Acciones de Moderación</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="w-32">Prioridad:</Label>
                  <Select value={opportunity.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <Label className="w-32">Estado:</Label>
                  <Select value={opportunity.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="closed">Cerrada</SelectItem>
                      <SelectItem value="review-required">Revisión Requerida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Notas Administrativas:</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Agregar notas sobre esta oportunidad..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveChanges} disabled={isUpdating}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOpportunityDetail;
