import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, GraduationCap } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

const createCompanySchema = z.object({
  name: z.string().min(1, 'El nombre de la empresa es requerido'),
  isAcademy: z.boolean().default(false),
  programType: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
});

type CreateCompanyFormData = z.infer<typeof createCompanySchema>;

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated?: () => void;
}

const CreateCompanyDialog: React.FC<CreateCompanyDialogProps> = ({
  open,
  onOpenChange,
  onCompanyCreated
}) => {
  const { createCompany } = useSupabaseAuth();
  const { refreshCompanies } = useCompany();
  const [isCreating, setIsCreating] = useState(false);
  // Ref para prevenir doble-clic
  const isSubmittingRef = useRef(false);

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      isAcademy: false,
      programType: '',
      website: '',
      location: '',
    },
  });

  const isAcademy = form.watch('isAcademy');

  const onSubmit = async (data: CreateCompanyFormData) => {
    // Prevenir doble-clic
    if (isSubmittingRef.current || isCreating) {
      console.log('⚠️ Form submission already in progress, ignoring...');
      return;
    }
    
    isSubmittingRef.current = true;
    setIsCreating(true);
    try {
      const companyData = {
        name: data.name,
        business_type: (data.isAcademy ? 'academy' : 'company') as 'academy' | 'company',
        description: data.isAcademy && data.programType
          ? `Academia especializada en ${data.programType}`
          : 'Empresa registrada en TalentDigital',
        website: data.website || undefined,
        location: data.location || undefined,
      };

      const result = await createCompany(companyData);
      
      if (result.error) {
        console.error('Error creating company:', result.error);
        const errorMessage = result.error.message || 'Error al crear la empresa. Intenta nuevamente.';
        toast.error(errorMessage);
        return;
      }

      // Refresh companies to update the context
      await refreshCompanies();
      
      toast.success('¡Empresa creada exitosamente!');
      form.reset();
      onOpenChange(false);
      onCompanyCreated?.();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error inesperado. Intenta nuevamente.');
    } finally {
      setIsCreating(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Crear Nueva Empresa
          </DialogTitle>
          <DialogDescription>
            Completa la información básica para crear tu nueva empresa
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isAcademy ? 'Nombre de la institución' : 'Nombre de la empresa'} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={isAcademy ? "Nombre de tu institución educativa" : "Nombre de tu empresa"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAcademy"
                checked={isAcademy}
                onCheckedChange={(checked) => 
                  form.setValue('isAcademy', !!checked)
                }
              />
              <Label htmlFor="isAcademy" className="text-sm font-normal flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                Es una academia o institución educativa
              </Label>
            </div>

            {isAcademy && (
              <FormField
                control={form.control}
                name="programType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de programa</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: Bootcamp, Curso universitario, Certificación"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ciudad, País"
                    />
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
                  <FormLabel>Sitio web</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://miempresa.com"
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Empresa'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;