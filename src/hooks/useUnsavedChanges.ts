import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
  message?: string;
}

export const useUnsavedChanges = ({
  hasUnsavedChanges,
  onSave,
  onDiscard,
  message = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
}: UseUnsavedChangesOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Prevenir salida de la página cuando hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Interceptar navegación interna
  useEffect(() => {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const handleNavigation = (url: string) => {
      if (hasUnsavedChanges && url !== location.pathname) {
        setPendingNavigation(url);
        setShowModal(true);
        return false; // Bloquear navegación
      }
      return true;
    };

    // Interceptar pushState
    history.pushState = function(state, title, url) {
      if (url && typeof url === 'string') {
        if (!handleNavigation(url)) {
          return; // Bloquear si hay cambios sin guardar
        }
      }
      return originalPushState.call(this, state, title, url);
    };

    // Interceptar replaceState
    history.replaceState = function(state, title, url) {
      if (url && typeof url === 'string') {
        if (!handleNavigation(url)) {
          return; // Bloquear si hay cambios sin guardar
        }
      }
      return originalReplaceState.call(this, state, title, url);
    };

    // Interceptar popstate (botón atrás/adelante)
    const handlePopState = () => {
      if (hasUnsavedChanges) {
        setPendingNavigation(location.pathname);
        setShowModal(true);
        // Prevenir la navegación
        history.pushState(null, '', location.pathname);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, location.pathname]);

  const handleSaveAndContinue = useCallback(async () => {
    try {
      if (onSave) {
        await onSave();
      }
      setShowModal(false);
      
      // Navegar a la URL pendiente si existe
      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }, [onSave, navigate, pendingNavigation]);

  const handleDiscardAndContinue = useCallback(() => {
    if (onDiscard) {
      onDiscard();
    }
    setShowModal(false);
    
    // Navegar a la URL pendiente si existe
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [onDiscard, navigate, pendingNavigation]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPendingNavigation(null);
  }, []);

  // Limpiar estado cuando se guardan los cambios
  useEffect(() => {
    if (!hasUnsavedChanges && showModal) {
      setShowModal(false);
    }
  }, [hasUnsavedChanges, showModal]);

  return {
    showModal,
    message,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    handleCancel,
    isBlocked: showModal
  };
};
