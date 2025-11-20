import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUpgradeRequests, CreateUpgradeRequestData } from '@/hooks/useUpgradeRequests';
import { useSupabaseAuth, isBusinessRole, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { Crown, Building, GraduationCap } from 'lucide-react';

const upgradeRequestSchema = z.object({
  requested_role: z.enum(['premium_talent', 'premium_business', 'premium_academy']),
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres').optional(),
});

type UpgradeRequestFormData = z.infer<typeof upgradeRequestSchema>;

interface UpgradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeRequestModal: React.FC<UpgradeRequestModalProps> = ({ isOpen, onClose }) => {
  const { userRole } = useSupabaseAuth();
  const { createUpgradeRequest, userRequest } = useUpgradeRequests();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verificar si ya hay una solicitud pendiente
  const hasPendingRequest = userRequest && userRequest.status === 'pending';

  const form = useForm<UpgradeRequestFormData>({
    resolver: zodResolver(upgradeRequestSchema),
    defaultValues: {
      requested_role: isBusinessRole(userRole) ? 'premium_business' : 'premium_talent',
      reason: '',
    },
  });

  const onSubmit = async (data: UpgradeRequestFormData) => {
    // Validar nuevamente antes de enviar (por si acaso el estado cambió)
    if (hasPendingRequest) {
      toast.error('Ya tienes una solicitud pendiente. Por favor espera a que sea revisada.');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createUpgradeRequest(data as CreateUpgradeRequestData);
      if (success) {
        form.reset();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const getRoleOptions = () => {
    if (isBusinessRole(userRole)) {
      return [
        { value: 'premium_business', label: 'Premium Business', icon: Building },
        { value: 'premium_academy', label: 'Premium Academy', icon: GraduationCap },
      ];
    } else if (isTalentRole(userRole)) {
      return [
        { value: 'premium_talent', label: 'Premium Talent', icon: Crown },
      ];
    }
    return [];
  };

  const roleOptions = getRoleOptions();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Solicitar Upgrade Premium
          </DialogTitle>
          <DialogDescription>
            Solicita acceso a funcionalidades premium. Nuestro equipo revisará tu solicitud.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requested_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plan Premium</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid gap-4"
                    >
                      {roleOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label 
                              htmlFor={option.value} 
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <IconComponent className="h-4 w-4" />
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón de la Solicitud (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explica por qué necesitas el upgrade premium..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeRequestModal;