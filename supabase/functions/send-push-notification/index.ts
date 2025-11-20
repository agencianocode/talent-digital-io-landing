// Supabase Edge Function para enviar Web Push Notifications
// Deploy: supabase functions deploy send-push-notification
// 
// Configurar secretos en Supabase:
// supabase secrets set VAPID_PUBLIC_KEY=BOEKW3QP-LfleNFqh2ug5Ax1hniociI7C3ZHZifBljNwVYj4nWtUlliSQrL2hDoi7dgNYuon-CA0caVLecMCebI
// supabase secrets set VAPID_PRIVATE_KEY=2oRKfbj19zWW6wB1BlhhLv56NRnhJM_XgNyVcrpVYd8
// supabase secrets set VAPID_SUBJECT=mailto:tu-email@talentdigital.io

// @ts-ignore - Deno imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';
// @ts-ignore - Deno imports
import webpush from 'npm:web-push@3.6.6';

// VAPID Keys - Configurar como secretos en Supabase
// @ts-ignore - Deno global
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BOEKW3QP-LfleNFqh2ug5Ax1hniociI7C3ZHZifBljNwVYj4nWtUlliSQrL2hDoi7dgNYuon-CA0caVLecMCebI';
// @ts-ignore - Deno global
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '2oRKfbj19zWW6wB1BlhhLv56NRnhJM_XgNyVcrpVYd8';
// @ts-ignore - Deno global
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@talentdigital.io';

// Configurar VAPID
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, title, message, actionUrl, notificationId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Crear cliente de Supabase con service role
    // @ts-ignore - Deno global
    const supabaseClient = createClient(
      // @ts-ignore - Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore - Deno global
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obtener suscripciones push del usuario
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription, endpoint')
      .eq('user_id', userId);

    if (subsError) throw subsError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No push subscriptions found for user',
        sent: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Enviar notificación a cada suscripción
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        // El objeto subscription ya contiene endpoint + keys completo
        const subscription = typeof sub.subscription === 'string' 
          ? JSON.parse(sub.subscription) 
          : sub.subscription;

        // Asegurar que el endpoint esté presente (usar el de la BD si falta en el objeto)
        if (!subscription.endpoint && sub.endpoint) {
          subscription.endpoint = sub.endpoint;
        }

        const payload = JSON.stringify({
          title: title || 'Talent Digital IO',
          body: message || 'Tienes una nueva notificación',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: {
            url: actionUrl || '/',
            notificationId: notificationId || null,
          },
        });

        try {
          // Usar web-push para enviar la notificación
          await webpush.sendNotification(subscription, payload);

          return {
            endpoint: subscription.endpoint || sub.endpoint,
            success: true,
          };
        } catch (error: any) {
          console.error('Error sending to endpoint:', error);
          
          // Si el endpoint falló (410 Gone), eliminar suscripción
          if (error.statusCode === 410) {
            await supabaseClient
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint || sub.endpoint);
          }

          return {
            endpoint: subscription.endpoint || sub.endpoint,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return new Response(JSON.stringify({
      message: 'Push notifications sent',
      sent: successCount,
      total: subscriptions.length,
      results: results,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

