import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Save, 
  Eye, 
  Plus, 
  X, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ServiceFormData } from '@/hooks/useTalentServices';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<boolean>;
  initialData?: Partial<ServiceFormData>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const { categories: marketplaceCategories } = useMarketplaceCategories();
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    currency: 'USD',
    delivery_time: '',
    location: 'Remoto',
    is_available: false,
    portfolio_url: '',
    demo_url: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'MXN', label: 'MXN ($)' },
    { value: 'ARS', label: 'ARS ($)' },
    { value: 'COP', label: 'COP ($)' }
  ];

  const deliveryTimes = [
    { value: '1-2 días', label: '1-2 días' },
    { value: '3-5 días', label: '3-5 días' },
    { value: '1 semana', label: '1 semana' },
    { value: '2 semanas', label: '2 semanas' },
    { value: '1 mes', label: '1 mes' },
    { value: '2-3 meses', label: '2-3 meses' },
    { value: 'Personalizado', label: 'Personalizado' }
  ];

  const locations = [
    { value: 'Remoto', label: 'Remoto' },
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Híbrido', label: 'Híbrido' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 10) {
      newErrors.title = 'El título debe tener al menos 10 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 50) {
      newErrors.description = 'La descripción debe tener al menos 50 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.delivery_time) {
      newErrors.delivery_time = 'El tiempo de entrega es requerido';
    }

    if (!formData.location) {
      newErrors.location = 'La ubicación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario.",
        variant: "destructive",
      });
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      toast({
        title: "Servicio guardado",
        description: mode === 'create' 
          ? "Tu servicio ha sido creado exitosamente." 
          : "Tu servicio ha sido actualizado exitosamente.",
      });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      price: 0,
      currency: 'USD',
      delivery_time: '',
      location: 'Remoto',
      is_available: false,
      portfolio_url: '',
      demo_url: '',
      tags: []
    });
    setErrors({});
    setNewTag('');
    onClose();
  };

  const selectedCategory = marketplaceCategories.find((cat) => cat.name === formData.category);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear Nuevo Servicio' : 'Editar Servicio'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Completa la información para crear tu servicio en el marketplace.'
              : 'Actualiza la información de tu servicio.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Servicio *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Diseño de Logo Profesional"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe detalladamente tu servicio, qué incluye, proceso de trabajo, etc. Puedes usar viñetas (•, -, *) y se mantendrán al publicar."
                  rows={4}
                  className={`whitespace-pre-wrap ${errors.description ? 'border-red-500' : ''}`}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Puedes copiar y pegar texto con viñetas desde Word, Google Docs, etc. El formato se mantendrá.
                </p>
                <div className="flex justify-between items-center">
                  {errors.description ? (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {formData.description.length}/50 caracteres mínimos
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formData.description.length} caracteres
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketplaceCategories.length > 0 ? (
                        marketplaceCategories
                          .filter((c) => ['Atención al Cliente','Creativo','Marketing','Operaciones','Soporte Profesional','Tecnología y Automatizaciones','Ventas'].includes(c.name))
                          .sort((a,b) => ['Atención al Cliente','Creativo','Marketing','Operaciones','Soporte Profesional','Tecnología y Automatizaciones','Ventas'].indexOf(a.name) - ['Atención al Cliente','Creativo','Marketing','Operaciones','Soporte Profesional','Tecnología y Automatizaciones','Ventas'].indexOf(b.name))
                          .map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))
                      ) : (
                        ['Atención al Cliente','Creativo','Marketing','Operaciones','Soporte Profesional','Tecnología y Automatizaciones','Ventas'].map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Ubicación *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => handleInputChange('location', value)}
                  >
                    <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precio y Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tiempo de Entrega *</Label>
                  <Select
                    value={formData.delivery_time}
                    onValueChange={(value) => handleInputChange('delivery_time', value)}
                  >
                    <SelectTrigger className={errors.delivery_time ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryTimes.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.delivery_time && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.delivery_time}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enlaces y Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">URL del Portfolio</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                    placeholder="https://tu-portfolio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo_url">URL de Demo</Label>
                  <Input
                    id="demo_url"
                    type="url"
                    value={formData.demo_url}
                    onChange={(e) => handleInputChange('demo_url', e.target.value)}
                    placeholder="https://demo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Agregar etiqueta"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disponibilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_available">Disponible para solicitudes</Label>
                  <p className="text-sm text-muted-foreground">
                    Los clientes podrán solicitar este servicio
                  </p>
                </div>
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleInputChange('is_available', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {selectedCategory.name}
                    </Badge>
                    <Badge variant="outline">{formData.delivery_time}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{formData.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {formData.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: formData.currency,
                        minimumFractionDigits: 0
                      }).format(formData.price)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {formData.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceForm;
