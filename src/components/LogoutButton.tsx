import { useState } from 'react';
import { Button } from "@/components/ui/button";
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
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    console.log('LogoutButton: Iniciando logout...');
    try {
      await signOut();
      // No need to navigate since signOut will handle the redirect
      console.log('LogoutButton: Logout exitoso');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect even if there's an error
      window.location.replace('/');
    } finally {
      setIsLoading(false);
    }
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