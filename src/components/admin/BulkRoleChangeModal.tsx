import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkRoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  onSuccess: () => void;
}

const ROLES = [
  { value: 'freemium_talent', label: 'Talento Freemium' },
  { value: 'premium_talent', label: 'Talento Premium' },
  { value: 'freemium_business', label: 'Empresa Freemium' },
  { value: 'premium_business', label: 'Empresa Premium' },
  { value: 'academy_premium', label: 'Academia Premium' },
  { value: 'admin', label: 'Administrador' },
];

const BulkRoleChangeModal: React.FC<BulkRoleChangeModalProps> = ({
  isOpen,
  onClose,
  selectedUserIds,
  onSuccess,
}) => {
  const [newRole, setNewRole] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const handleSubmit = async () => {
    if (!newRole) {
      toast.error('Selecciona un rol');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-bulk-change-roles', {
        body: {
          userIds: selectedUserIds,
          newRole,
        },
      });

      if (error) throw error;

      setResult({
        success: data.results?.success?.length || 0,
        failed: data.results?.failed?.length || 0,
      });

      if (data.results?.success?.length > 0) {
        toast.success(`${data.results.success.length} usuarios actualizados`);
        onSuccess();
      }

      if (data.results?.failed?.length > 0) {
        toast.error(`${data.results.failed.length} usuarios fallaron`);
      }

    } catch (error: any) {
      console.error('Error changing roles:', error);
      toast.error(error.message || 'Error al cambiar los roles');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setNewRole('');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Rol Masivo</DialogTitle>
          <DialogDescription>
            Cambiar el rol de {selectedUserIds.length} usuario{selectedUserIds.length > 1 ? 's' : ''} seleccionado{selectedUserIds.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Esta acción cambiará los permisos de acceso de los usuarios seleccionados
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="role">Nuevo rol</Label>
            <Select value={newRole} onValueChange={setNewRole} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {result && (
            <Alert variant={result.failed > 0 ? "destructive" : "default"} className={result.failed === 0 ? "bg-green-50 border-green-200" : ""}>
              <CheckCircle2 className={`h-4 w-4 ${result.failed === 0 ? 'text-green-600' : ''}`} />
              <AlertDescription className={result.failed === 0 ? "text-green-800" : ""}>
                {result.success} usuario{result.success !== 1 ? 's' : ''} actualizado{result.success !== 1 ? 's' : ''}
                {result.failed > 0 && `, ${result.failed} fallido${result.failed !== 1 ? 's' : ''}`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button onClick={handleSubmit} disabled={!newRole || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                `Cambiar rol de ${selectedUserIds.length} usuario${selectedUserIds.length > 1 ? 's' : ''}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkRoleChangeModal;
