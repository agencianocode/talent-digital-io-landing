import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, type } = await req.json();

    if (!user_id) {
      throw new Error('user_id is required');
    }

    // Verify user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData?.user) {
      throw new Error('User not found');
    }

    const notificationType = type || 'application';

    // Test notification data based on type
    const testNotifications: Record<string, any> = {
      application: {
        title: '🎯 Nueva aplicación de prueba',
        message: 'María González aplicó a tu oportunidad "Desarrollador Full Stack Senior"',
        action_url: '/business-dashboard/applications',
      },
      opportunity: {
        title: '💼 Oportunidad cerrada (prueba)',
        message: 'Tu oportunidad "Marketing Manager" ha sido cerrada automáticamente',
        action_url: '/business-dashboard/opportunities',
      },
      message: {
        title: '💬 Nuevo mensaje de prueba',
        message: 'Tienes un nuevo mensaje de Juan Pérez sobre el proyecto de desarrollo',
        action_url: '/messages',
      },
      team: {
        title: '👥 Nueva solicitud de equipo (prueba)',
        message: 'Carlos Rodríguez solicitó unirse a tu empresa como Viewer',
        action_url: '/business-dashboard/team/requests',
      },
      marketplace: {
        title: '🛍️ Consulta sobre tu servicio (prueba)',
        message: 'Ana Martínez consultó por tu servicio "Desarrollo Web Profesional"',
        action_url: '/talent-dashboard/marketplace',
      },
      moderation: {
        title: '⚠️ Contenido en revisión (prueba)',
        message: 'Tu oportunidad "Diseñador UX/UI" está siendo revisada por el equipo de moderación',
        action_url: '/business-dashboard/opportunities',
      },
    };

    const testData = testNotifications[notificationType] || testNotifications.application;

    console.log('Creating test notification for user:', user_id, 'type:', notificationType);

    // Create notification in database
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        type: notificationType,
        title: testData.title,
        message: testData.message,
        action_url: testData.action_url,
        read: false,
      })
      .select()
      .single();

    if (notificationError) {
      throw new Error(`Failed to create notification: ${notificationError.message}`);
    }

    console.log('Notification created:', notification.id);

    // Process the notification (sends email, push, etc.)
    const { data: processResult, error: processError } = await supabase.functions.invoke(
      'process-notification',
      {
        body: {
          notification_id: notification.id,
        },
      }
    );

    if (processError) {
      console.error('Error processing notification:', processError);
      throw new Error(`Failed to process notification: ${processError.message}`);
    }

    console.log('Notification processed:', processResult);

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notification.id,
        type: notificationType,
        process_result: processResult,
        message: 'Test notification created and sent successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending test notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
