// ⚠️ CRÍTICO: La VAPID Public Key DEBE estar configurada en variables de entorno
// NUNCA incluir keys hardcodeadas en el código

export const VAPID_CONFIG = {
  publicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  // La private key NUNCA debe estar en el frontend, solo en el backend
  // privateKey se configura en Supabase Edge Functions
};

// Verificación estricta - falla inmediatamente si no está configurada
if (!VAPID_CONFIG.publicKey) {
  throw new Error(
    '❌ VAPID_PUBLIC_KEY no está configurada. ' +
    'Configura VITE_VAPID_PUBLIC_KEY en tu archivo .env. ' +
    'Consulta .env.example para más información.'
  );
}

