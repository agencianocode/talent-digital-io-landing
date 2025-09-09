import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Briefcase, DollarSign, MapPin, Clock, Target, Star } from 'lucide-react';

const preferencesSchema = z.object({
  availability_status: z.enum(['actively_looking', 'open_to_offers', 'not_available']),
  work_modality: z.array(z.enum(['remote', 'hybrid', 'onsite'])),
  preferred_locations: z.string(),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  salary_currency: z.enum(['USD', 'EUR', 'MXN', 'ARS', 'COP', 'CLP']),
  contract_types: z.array(z.enum(['full_time', 'part_time', 'freelance', 'contract'])),
  notice_period: z.enum(['immediate', '2_weeks', '1_month', '2_months', '3_months']),
  auto_apply_enabled: z.boolean(),
  auto_apply_criteria: z.string().optional(),
  preferred_company_size: z.array(z.enum(['startup', 'small', 'medium', 'large', 'enterprise'])),
  preferred_industries: z.string(),
  career_goals: z.string().optional(),
  deal_breakers: z.string().optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const workModalityOptions = [
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'onsite', label: 'Presencial' },
];

const contractTypeOptions = [
  { value: 'full_time', label: 'Tiempo Completo' },
  { value: 'part_time', label: 'Medio Tiempo' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Por Contrato' },
];

const companySizeOptions = [
  { value: 'startup', label: 'Startup (1-10)' },
  { value: 'small', label: 'Pequeña (11-50)' },
  { value: 'medium', label: 'Mediana (51-200)' },
  { value: 'large', label: 'Grande (201-1000)' },
  { value: 'enterprise', label: 'Empresa (1000+)' },
];

const ProfessionalPreferences = () => {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      availability_status: 'open_to_offers',
      work_modality: ['remote', 'hybrid'],
      preferred_locations: '',
      salary_currency: 'USD',
      contract_types: ['full_time'],
      notice_period: '2_weeks',
      auto_apply_enabled: false,
      preferred_company_size: ['small', 'medium'],
      preferred_industries: '',
    }
  });

  const toggleArrayValue = (currentValues: string[], value: string, onChange: (values: string[]) => void) => {
    const updated = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onChange(updated);
  };

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      // TODO: Implement professional preferences update
      console.log('Professional preferences:', data);
      toast.success('Preferencias profesionales actualizadas');
    } catch (error) {
      toast.error('Error al actualizar las preferencias');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Preferencias Profesionales</h2>
          <p className="text-muted-foreground">Configura tus preferencias para el matching con oportunidades</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Availability Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Estado de Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="availability_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Estás buscando trabajo actualmente?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="actively_looking">Búsqueda Activa - Estoy buscando trabajo activamente</SelectItem>
                        <SelectItem value="open_to_offers">Abierto a Ofertas - Evaluaré buenas oportunidades</SelectItem>
                        <SelectItem value="not_available">No Disponible - No estoy buscando en este momento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Esto afecta cómo las empresas ven tu perfil y la frecuencia de oportunidades
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Work Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Preferencias de Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="work_modality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidad de trabajo preferida</FormLabel>
                    <FormDescription>Selecciona todas las modalidades que te interesan</FormDescription>
                    <div className="flex flex-wrap gap-2">
                      {workModalityOptions.map((option) => (
                        <Badge
                          key={option.value}
                          variant={field.value.includes(option.value as any) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleArrayValue(field.value, option.value, field.onChange)}
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contract_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipos de contrato</FormLabel>
                    <FormDescription>Selecciona los tipos de contrato que te interesan</FormDescription>
                    <div className="flex flex-wrap gap-2">
                      {contractTypeOptions.map((option) => (
                        <Badge
                          key={option.value}
                          variant={field.value.includes(option.value as any) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleArrayValue(field.value, option.value, field.onChange)}
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notice_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período de aviso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="¿Cuándo puedes empezar?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Inmediato</SelectItem>
                        <SelectItem value="2_weeks">2 semanas</SelectItem>
                        <SelectItem value="1_month">1 mes</SelectItem>
                        <SelectItem value="2_months">2 meses</SelectItem>
                        <SelectItem value="3_months">3 meses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tiempo que necesitas para dejar tu trabajo actual
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location & Salary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Compensación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="preferred_locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicaciones preferidas</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ej: Ciudad de México, Barcelona, Remoto..."
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ciudades o países donde te gustaría trabajar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salary_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario mínimo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="50000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario máximo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="80000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="MXN">MXN</SelectItem>
                          <SelectItem value="ARS">ARS</SelectItem>
                          <SelectItem value="COP">COP</SelectItem>
                          <SelectItem value="CLP">CLP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Preferencias de Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="preferred_company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamaño de empresa preferido</FormLabel>
                    <FormDescription>Selecciona los tamaños de empresa que te interesan</FormDescription>
                    <div className="flex flex-wrap gap-2">
                      {companySizeOptions.map((option) => (
                        <Badge
                          key={option.value}
                          variant={field.value.includes(option.value as any) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleArrayValue(field.value, option.value, field.onChange)}
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_industries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industrias de interés</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ej: Tecnología, Fintech, E-commerce..."
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Industrias donde te gustaría trabajar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Career Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivos y Dealbreakers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="career_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivos profesionales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe tus objetivos profesionales a corto y largo plazo..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ayuda a las empresas a entender qué buscas en tu próximo rol
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deal_breakers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal breakers</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="ej: No disponible para viajes constantes, no trabajo fines de semana..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Condiciones que no estás dispuesto a aceptar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Auto-Apply Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Aplicación Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="auto_apply_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activar aplicación automática</FormLabel>
                      <FormDescription>
                        Aplicar automáticamente a oportunidades que coinciden con tus criterios
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('auto_apply_enabled') && (
                <FormField
                  control={form.control}
                  name="auto_apply_criteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criterios para aplicación automática</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Define criterios específicos para la aplicación automática..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Especifica qué tipos de oportunidades quieres que se apliquen automáticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Restablecer
            </Button>
            <Button type="submit">
              Guardar Preferencias
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfessionalPreferences;