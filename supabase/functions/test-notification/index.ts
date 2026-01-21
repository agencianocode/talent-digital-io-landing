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
        action_url: '/business-dashboard/users',
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
      'welcome-talent': {
        title: '👋 ¡Bienvenido a TalentoDigital!',
        message: 'Estamos emocionados de tenerte en nuestra plataforma. Completa tu perfil para comenzar.',
        action_url: '/talent/edit-profile',
      },
      'welcome-business': {
        title: '🏢 ¡Bienvenido a TalentoDigital!',
        message: 'Tu empresa se unió exitosamente. Completa el perfil y publica tu primera oportunidad.',
        action_url: '/business/profile',
      },
      'welcome-academy': {
        title: '🎓 ¡Bienvenido a TalentoDigital!',
        message: 'Tu academia está lista. Invita a tus estudiantes y gestiona tu directorio.',
        action_url: '/academy/dashboard',
      },
    };

    const testData = testNotifications[notificationType] || testNotifications.application;

    // Para los tipos de bienvenida, evitamos la inserción en la tabla notifications
    // debido a la restricción del CHECK constraint sobre el campo "type".
    if (notificationType.startsWith('welcome-')) {
      console.log('Sending welcome email directly for user:', user_id, 'type:', notificationType);

      // Obtener email del usuario
      const { data: userData2, error: userError2 } = await supabase.auth.admin.getUserById(user_id);
      if (userError2 || !userData2?.user?.email) {
        throw new Error('User email not found');
      }

      // Obtener nombre del perfil para personalizar
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user_id)
        .single();
      if (profileError) {
        console.warn('Profile fetch error (non-blocking):', profileError.message);
      }

      const userEmail = userData2.user.email as string;
      const userName = (profile?.full_name as string) || userEmail.split('@')[0];

      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          userName,
          type: notificationType,
          title: testData.title,
          message: testData.message,
          actionUrl: testData.action_url,
          actionText: 'Ver detalles',
        },
      });

      if (emailError) {
        throw new Error(`Failed to send welcome email: ${emailError.message}`);
      }

      console.log('Welcome email sent:', emailData);

      return new Response(
        JSON.stringify({
          success: true,
          type: notificationType,
          channel: 'email',
          message: 'Welcome email sent successfully',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Process the notification immediately (sends email, push, etc.)
    // Note: This is the single point of processing for test notifications
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
      // Don't throw - notification was created, just processing failed
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
