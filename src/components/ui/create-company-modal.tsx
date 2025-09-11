import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProfessionalData, Industry } from '@/hooks/useProfessionalData';
import { Loader2, Building } from 'lucide-react';

const createCompanySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  industryId: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

type CreateCompanyFormData = z.infer<typeof createCompanySchema>;

interface CreateCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated: (companyId: string, companyName: string) => void;
  initialName?: string;
}

export function CreateCompanyModal({
  open,
  onOpenChange,
  onCompanyCreated,
  initialName = '',
}: CreateCompanyModalProps) {
  const { addCompanyToDirectory, industries } = useProfessionalData();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: initialName,
      industryId: '',
      location: '',
      website: '',
    },
  });

  React.useEffect(() => {
    if (initialName) {
      form.setValue('name', initialName);
    }
  }, [initialName, form]);

  const onSubmit = async (data: CreateCompanyFormData) => {
    setIsCreating(true);
    try {
      const companyId = await addCompanyToDirectory(
        data.name,
        data.industryId || undefined,
        data.location || undefined,
        data.website || undefined
      );
      
      if (companyId) {
        onCompanyCreated(companyId, data.name);
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Agregar Nueva Empresa
          </DialogTitle>
          <DialogDescription>
            Esta empresa se agregará al directorio y podrá ser reclamada por su dueño más tarde.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: TechCorp, Marketing Solutions..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar industria..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Madrid, España" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio Web</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Empresa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}