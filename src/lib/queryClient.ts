// React Query Client Configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Caché de 5 minutos por defecto
      staleTime: 5 * 60 * 1000,
      // Mantener en memoria 10 minutos
      gcTime: 10 * 60 * 1000,
      // Reintentar queries fallidas 1 vez
      retry: 1,
      // Refetch automático al re-enfocar ventana (solo si data está stale)
      refetchOnWindowFocus: false,
      // Refetch automático al reconectar internet
      refetchOnReconnect: true,
    },
  },
});

