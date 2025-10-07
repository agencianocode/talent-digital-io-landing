// ⚠️ IMPORTANTE: En producción, estas keys deben estar en variables de entorno
// Este archivo es temporal para desarrollo. NO subir a repositorio público.

export const VAPID_CONFIG = {
  publicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BOEKW3QP-LfleNFqh2ug5Ax1hniociI7C3ZHZifBljNwVYj4nWtUlliSQrL2hDoi7dgNYuon-CA0caVLecMCebI',
  // La private key NUNCA debe estar en el frontend, solo en el backend
  // privateKey se configura en Supabase Edge Functions
};

// Verificar que la key esté configurada
if (!VAPID_CONFIG.publicKey || VAPID_CONFIG.publicKey.includes('YOUR_')) {
  console.warn('⚠️ VAPID Public Key no configurada. Las notificaciones push no funcionarán.');
}

