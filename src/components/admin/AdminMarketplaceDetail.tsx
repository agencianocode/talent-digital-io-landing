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
  ShoppingBag, 
  Building, 
  MapPin, 
  Users,
  Edit,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Tag,
  Star,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  delivery_time: string;
  location: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company_id?: string;
  company_name?: string;
  company_logo?: string;
  user_name: string;
  user_avatar?: string;
  views_count: number;
  orders_count: number;
  rating: number;
  reviews_count: number;
  priority: string;
  admin_notes?: string;
  tags: string[];
  portfolio_url?: string;
  demo_url?: string;
}

interface AdminMarketplaceDetailProps {
  serviceId: string;
  isOpen: boolean;
  onClose: () => void;
  onServiceUpdate: () => void;
}

const AdminMarketplaceDetail: React.FC<AdminMarketplaceDetailProps> = ({
  serviceId,
  isOpen,
  onClose,
  onServiceUpdate
}) => {
  const [service, setService] = useState<MarketplaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<MarketplaceDetail>>({});
  const [adminNotes, setAdminNotes] = useState('');

  const loadServiceDetail = async () => {
    if (!serviceId) return;
    
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockServices: MarketplaceDetail[] = [
        {
          id: '1',
          title: 'Diseño de Logo Profesional',
          description: 'Creación de logos únicos y profesionales para tu marca. Incluye 3 conceptos iniciales y 2 revisiones.',
          category: 'diseno-grafico',
          price: 150,
          currency: 'USD',
          delivery_time: '3-5 días',
          location: 'Remoto',
          is_active: true,
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          user_id: 'user1',
          company_id: 'company1',
          company_name: 'Design Studio',
          company_logo: undefined,
          user_name: 'María García',
          user_avatar: undefined,
          views_count: 45,
          orders_count: 12,
          rating: 4.8,
          reviews_count: 8,
          priority: 'medium',
          admin_notes: '',
          tags: ['logo', 'branding', 'diseño'],
          portfolio_url: 'https://portfolio.com/maria',
          demo_url: 'https://demo.com/logo'
        },
        {
          id: '2',
          title: 'Desarrollo de Sitio Web',
          description: 'Desarrollo completo de sitios web responsivos con React y Node.js. Incluye diseño y funcionalidades personalizadas.',
          category: 'desarrollo-web',
          price: 2500,
          currency: 'USD',
          delivery_time: '2-3 semanas',
          location: 'Remoto',
          is_active: true,
          status: 'active',
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-10T14:30:00Z',
          user_id: 'user2',
          company_id: 'company2',
          company_name: 'Tech Solutions',
          company_logo: undefined,
          user_name: 'Carlos López',
          user_avatar: undefined,
          views_count: 78,
          orders_count: 5,
          rating: 4.9,
          reviews_count: 3,
          priority: 'high',
          admin_notes: '',
          tags: ['react', 'nodejs', 'web'],
          portfolio_url: 'https://portfolio.com/carlos',
          demo_url: 'https://demo.com/web'
        },
        {
          id: '3',
          title: 'Estrategia de Marketing Digital',
          description: 'Desarrollo de estrategias completas de marketing digital para redes sociales y campañas publicitarias.',
          category: 'marketing-digital',
          price: 800,
          currency: 'USD',
          delivery_time: '1-2 semanas',
          location: 'Remoto',
          is_active: false,
          status: 'paused',
          created_at: '2024-01-05T09:15:00Z',
          updated_at: '2024-01-05T09:15:00Z',
          user_id: 'user3',
          company_id: undefined,
          company_name: undefined,
          company_logo: undefined,
          user_name: 'Ana Rodríguez',
          user_avatar: undefined,
          views_count: 32,
          orders_count: 7,
          rating: 4.6,
          reviews_count: 5,
          priority: 'low',
          admin_notes: 'Servicio pausado temporalmente',
          tags: ['marketing', 'social media', 'estrategia'],
          portfolio_url: 'https://portfolio.com/ana',
          demo_url: undefined
        }
      ];

      const serviceData = mockServices.find(s => s.id === serviceId);
      if (!serviceData) {
        throw new Error('Servicio no encontrado');
      }

      setService(serviceData);
      setEditData(serviceData);
      setAdminNotes(serviceData.admin_notes || '');
    } catch (error) {
      console.error('Error loading service detail:', error);
      toast.error('Error al cargar los detalles del servicio');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && serviceId) {
      loadServiceDetail();
    }
  }, [isOpen, serviceId]);

  const handleSaveChanges = async () => {
    if (!service) return;

    setIsUpdating(true);
    try {
      // Mock update - in real implementation this would update the database
      toast.success('Servicio actualizado correctamente');
      setIsEditing(false);
      onServiceUpdate();
      loadServiceDetail();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Error al actualizar el servicio');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!service) return;

    setIsUpdating(true);
    try {
      // Mock update - in real implementation this would update the database
      toast.success(`Servicio ${newStatus === 'active' ? 'activado' : 'pausado'} correctamente`);
      onServiceUpdate();
      loadServiceDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al cambiar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!service) return;

    setIsUpdating(true);
    try {
      // Mock update - in real implementation this would update the database
      console.log('Priority changed to:', newPriority);
      toast.success('Prioridad actualizada correctamente');
      onServiceUpdate();
      loadServiceDetail();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Error al actualizar la prioridad');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pausado</Badge>;
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
      'diseno-grafico': 'bg-blue-100 text-blue-800',
      'desarrollo-web': 'bg-green-100 text-green-800',
      'marketing-digital': 'bg-purple-100 text-purple-800',
      'consultoria': 'bg-orange-100 text-orange-800',
      'redaccion': 'bg-pink-100 text-pink-800',
      'traduccion': 'bg-indigo-100 text-indigo-800',
      'video-edicion': 'bg-red-100 text-red-800',
      'otros': 'bg-gray-100 text-gray-800'
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
            <DialogTitle>Cargando servicio...</DialogTitle>
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

  if (!service) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Servicio no encontrado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>No se pudo cargar la información del servicio</p>
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
            <ShoppingBag className="h-5 w-5" />
            Detalles del Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusBadge(service.status)}
              {getPriorityBadge(service.priority)}
              {getCategoryBadge(service.category)}
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
              {service.status === 'active' ? (
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
                      <p className="font-medium">{service.title}</p>
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
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{service.description}</p>
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
                          <SelectItem value="diseno-grafico">Diseño Gráfico</SelectItem>
                          <SelectItem value="desarrollo-web">Desarrollo Web</SelectItem>
                          <SelectItem value="marketing-digital">Marketing Digital</SelectItem>
                          <SelectItem value="consultoria">Consultoría</SelectItem>
                          <SelectItem value="redaccion">Redacción</SelectItem>
                          <SelectItem value="traduccion">Traducción</SelectItem>
                          <SelectItem value="video-edicion">Video y Edición</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{service.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Precio</Label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={editData.price || ''}
                          onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                          placeholder="0.00"
                        />
                        <Select
                          value={editData.currency || 'USD'}
                          onValueChange={(value) => setEditData({ ...editData, currency: value })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="ARS">ARS</SelectItem>
                            <SelectItem value="MXN">MXN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <p className="font-medium">{service.currency} {service.price}</p>
                    )}
                  </div>

                  <div>
                    <Label>Tiempo de Entrega</Label>
                    {isEditing ? (
                      <Input
                        value={editData.delivery_time || ''}
                        onChange={(e) => setEditData({ ...editData, delivery_time: e.target.value })}
                        placeholder="Ej: 3-5 días"
                      />
                    ) : (
                      <p className="font-medium">{service.delivery_time}</p>
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
                        <span>{service.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Proveedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {service.user_avatar ? (
                  <img 
                    src={service.user_avatar} 
                    alt={service.user_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{service.user_name}</h3>
                  {service.company_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{service.company_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enlaces y Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Enlaces y Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>URL del Portfolio</Label>
                  {isEditing ? (
                    <Input
                      value={editData.portfolio_url || ''}
                      onChange={(e) => setEditData({ ...editData, portfolio_url: e.target.value })}
                      placeholder="https://portfolio.com"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {service.portfolio_url ? (
                        <a href={service.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {service.portfolio_url}
                        </a>
                      ) : (
                        'No especificado'
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label>URL de Demo</Label>
                  {isEditing ? (
                    <Input
                      value={editData.demo_url || ''}
                      onChange={(e) => setEditData({ ...editData, demo_url: e.target.value })}
                      placeholder="https://demo.com"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {service.demo_url ? (
                        <a href={service.demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {service.demo_url}
                        </a>
                      ) : (
                        'No especificado'
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
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
                <FileText className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{service.views_count}</p>
                  <p className="text-sm text-muted-foreground">Visualizaciones</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{service.orders_count}</p>
                  <p className="text-sm text-muted-foreground">Pedidos</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-2xl font-bold">{service.rating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Calificación</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{service.reviews_count}</p>
                  <p className="text-sm text-muted-foreground">Reseñas</p>
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
                  <Select value={service.priority} onValueChange={handlePriorityChange}>
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
                  <Select value={service.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="review-required">Revisión Requerida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Notas Administrativas:</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Agregar notas sobre este servicio..."
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

export default AdminMarketplaceDetail;
