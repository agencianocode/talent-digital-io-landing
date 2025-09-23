// src/hooks/useAutoSave.ts
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  interval?: number; // en milisegundos
  enabled?: boolean;
  storageKey?: string; // para localStorage como respaldo
}

export const useAutoSave = ({
  data,
  onSave,
  interval = 30000, // 30 segundos por defecto
  enabled = true,
  storageKey
}: UseAutoSaveOptions) => {
  const lastSavedRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChangesRef = useRef(false);

  // Guardar en localStorage como respaldo
  const saveToLocalStorage = useCallback((data: any) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          data,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.warn('Error saving to localStorage:', error);
      }
    }
  }, [storageKey]);

  // Recuperar desde localStorage
  const loadFromLocalStorage = useCallback(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const { data: savedData, timestamp } = JSON.parse(saved);
          // Solo cargar si es reciente (menos de 24 horas)
          const savedDate = new Date(timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            return savedData;
          }
        }
      } catch (error) {
        console.warn('Error loading from localStorage:', error);
      }
    }
    return null;
  }, [storageKey]);

  // Función de guardado
  const performSave = useCallback(async () => {
    if (!enabled || !data) return;

    try {
      await onSave(data);
      lastSavedRef.current = new Date();
      hasUnsavedChangesRef.current = false;
      
      // Limpiar localStorage después de guardar exitosamente
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      
      console.log('Auto-save completed at:', lastSavedRef.current);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Guardar en localStorage como respaldo
      saveToLocalStorage(data);
      toast.error('Error al guardar automáticamente. Los datos se guardaron localmente.');
    }
  }, [data, onSave, enabled, storageKey, saveToLocalStorage]);

  // Configurar intervalo de autoguardado
  useEffect(() => {
    if (!enabled) return;

    // Marcar que hay cambios no guardados
    hasUnsavedChangesRef.current = true;

    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Configurar nuevo intervalo
    intervalRef.current = setInterval(() => {
      if (hasUnsavedChangesRef.current) {
        performSave();
      }
    }, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data, enabled, interval, performSave]);

  // Guardar al desmontar el componente
  useEffect(() => {
    return () => {
      if (hasUnsavedChangesRef.current && data) {
        // Guardado final en localStorage
        saveToLocalStorage(data);
      }
    };
  }, [data, saveToLocalStorage]);

  // Función para guardar manualmente
  const saveNow = useCallback(async () => {
    await performSave();
    toast.success('Guardado exitoso');
  }, [performSave]);

  // Función para cargar datos guardados
  const loadSavedData = useCallback(() => {
    return loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return {
    lastSaved: lastSavedRef.current,
    hasUnsavedChanges: hasUnsavedChangesRef.current,
    saveNow,
    loadSavedData,
    isAutoSaveEnabled: enabled
  };
};
