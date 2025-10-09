import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OpportunityDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  contract_type: string;
  duration?: string;
  location: string;
  timezone?: string;
  deadline?: string;
  salary_type: string;
  salary_amount?: string;
  salary_period?: string;
  commission_percentage?: string;
  show_salary_publicly: boolean;
  skills: string[];
  experience_levels: string[];
  is_active: boolean;
  status: string;
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
        category: opportunityData.category,
        contract_type: opportunityData.contract_type || 'full-time',
        duration: (opportunityData as any).duration,
        location: opportunityData.location || '',
        timezone: (opportunityData as any).timezone,
        deadline: (opportunityData as any).deadline,
        salary_type: (opportunityData as any).salary_type || 'fixed',
        salary_amount: (opportunityData as any).salary_amount || opportunityData.salary_min?.toString(),
        salary_period: (opportunityData as any).salary_period,
        commission_percentage: opportunityData.commission_percentage?.toString(),
        show_salary_publicly: (opportunityData as any).show_salary_publicly || false,
        skills: opportunityData.skills || [],
        experience_levels: opportunityData.experience_levels || [],
        is_active: opportunityData.is_active || false,
        status: opportunityData.status || 'draft',
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
      const { error } = await supabase
        .from('opportunities')
        .update({
          title: editData.title,
          description: editData.description,
          category: editData.category,
          contract_type: editData.contract_type,
          duration: editData.duration,
          location: editData.location,
          timezone: editData.timezone,
          deadline: editData.deadline,
          salary_type: editData.salary_type,
          salary_amount: editData.salary_amount ? parseFloat(editData.salary_amount) : null,
          salary_period: editData.salary_period,
          commission_percentage: editData.commission_percentage ? parseFloat(editData.commission_percentage) : null,
          show_salary_publicly: editData.show_salary_publicly,
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando oportunidad...</DialogTitle>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Oportunidad no encontrada</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>No se pudo cargar la información de la oportunidad</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Detalles de la Oportunidad
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusBadge(opportunity.status)}
              {getPriorityBadge(opportunity.priority)}
              {getCategoryBadge(opportunity.category)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
              {opportunity.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('paused')}
                  disabled={isUpdating}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('active')}
                  disabled={isUpdating}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Activar
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteOpportunity}
                disabled={isUpdating}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Dar de Baja
              </Button>
            </div>
          </div>

          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Título</Label>
                    {isEditing ? (
                      <Input
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{opportunity.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Descripción</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
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
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Contrato</Label>
                    {isEditing ? (
                      <Select
                        value={editData.contract_type || ''}
                        onValueChange={(value) => setEditData({ ...editData, contract_type: value })}
                      >
                        <SelectTrigger>
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
                      <p className="font-medium">{opportunity.contract_type}</p>
                    )}
                  </div>

                  <div>
                    <Label>Duración</Label>
                    {isEditing ? (
                      <Input
                        value={editData.duration || ''}
                        onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                        placeholder="Indefinido o duración específica"
                      />
                    ) : (
                      <p className="font-medium">{opportunity.duration || 'Indefinido'}</p>
                    )}
                  </div>

                  <div>
                    <Label>Ubicación</Label>
                    {isEditing ? (
                      <Input
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        placeholder="Remoto, Ciudad, País"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                  </div>

                  {opportunity.deadline && (
                    <div>
                      <Label>Fecha Límite</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(opportunity.deadline).toLocaleDateString('es')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Salarial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Salarial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Tipo de Pago</Label>
                  <p className="font-medium">{opportunity.salary_type}</p>
                </div>
                {opportunity.salary_amount && (
                  <div>
                    <Label>Monto</Label>
                    <p className="font-medium">
                      {opportunity.salary_amount} {opportunity.salary_period && `por ${opportunity.salary_period}`}
                    </p>
                  </div>
                )}
                {opportunity.commission_percentage && (
                  <div>
                    <Label>Comisión</Label>
                    <p className="font-medium">{opportunity.commission_percentage}%</p>
                  </div>
                )}
                <div>
                  <Label>Mostrar Salario Públicamente</Label>
                  <p className="font-medium">{opportunity.show_salary_publicly ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills y Experiencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Skills y Experiencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Skills Requeridas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opportunity.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Niveles de Experiencia</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opportunity.experience_levels.map((level, index) => (
                      <Badge key={index} variant="secondary">{level}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{opportunity.applications_count}</p>
                  <p className="text-sm text-muted-foreground">Postulaciones</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{opportunity.views_count}</p>
                  <p className="text-sm text-muted-foreground">Visualizaciones</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Building className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{opportunity.company_name}</p>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones de Moderación */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Moderación</CardTitle>
            </CardHeader>
            <CardContent>
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
