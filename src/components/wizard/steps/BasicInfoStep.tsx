import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Phone, Eye, EyeOff } from 'lucide-react';
import { WizardData } from '../TalentProfileWizard';

const basicInfoSchema = z.object({
  country: z.string().min(1, 'El país es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  hide_location: z.boolean(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoStepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      country: data.country,
      city: data.city,
      phone: data.phone,
      hide_location: data.hide_location,
    },
  });

  const onSubmit = (formData: BasicInfoFormData) => {
    updateData(formData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Información Personal
        </h2>
        <p className="text-muted-foreground">
          Ayúdanos a conectarte con oportunidades en tu zona
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: México, Colombia, España..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ciudad de México, Bogotá..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono de Contacto
                </FormLabel>
                <FormControl>
                  <Input placeholder="+52 55 1234 5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {form.watch('hide_location') ? (
                  <EyeOff className="h-5 w-5 text-orange-500" />
                ) : (
                  <Eye className="h-5 w-5 text-green-500" />
                )}
                Privacidad de Ubicación
              </CardTitle>
              <CardDescription>
                Controla quién puede ver tu ubicación exacta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="hide_location"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Ocultar ubicación específica
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Solo mostrar el país en lugar de ciudad específica
                      </div>
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
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Continuar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};