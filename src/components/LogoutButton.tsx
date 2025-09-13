import { useState } from 'react';
// import { Button } from "@/components/ui/button"; // No utilizado directamente
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
// import { useNavigate } from 'react-router-dom'; // No utilizado
import { logger } from '@/lib/logger';

const LogoutButton = () => {
  const { signOut } = useSupabaseAuth();
  // const navigate = useNavigate(); // No utilizado
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    logger.debug('LogoutButton: Iniciando logout...');
    try {
      await signOut();
      logger.debug('LogoutButton: Logout exitoso');
      // signOut will handle the redirect immediately
    } catch (error) {
      logger.error('Error signing out', error);
      // Force redirect even if there's an error
      window.location.replace('/');
    }
    // Don't set loading to false since we're redirecting
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <LogOut className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
          <AlertDialogDescription>
            Serás redirigido a la página principal y tendrás que iniciar sesión nuevamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Cerrando...' : 'Cerrar sesión'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;