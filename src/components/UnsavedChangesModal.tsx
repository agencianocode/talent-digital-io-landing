import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Save, X, AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  message?: string;
  isSaving?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDiscard,
  message = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
  isSaving = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Cambios sin guardar
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-center pt-4">
          <Button 
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar y salir
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onDiscard}
            className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-2" />
            Salir sin guardar
          </Button>
          
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
