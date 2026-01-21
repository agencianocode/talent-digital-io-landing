import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Test notification data based on type with complete data for variable substitution
    const testNotifications: Record<string, any> = {
      application: {
        title: '🎯 Nueva aplicación de prueba',
        message: 'María González aplicó a tu oportunidad "Desarrollador Full Stack Senior"',
        action_url: '/business-dashboard/applications',
        data: {
          application_id: 'test-app-id',
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          candidate_name: 'María González',
        },
      },
      application_reviewed: {
        title: 'Aplicación en revisión',
        message: 'Tu aplicación para Desarrollador Full Stack Senior está siendo revisada por TechCorp Internacional',
        action_url: '/talent-dashboard/applications',
        data: {
          application_id: 'test-app-id',
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          old_status: 'pending',
          new_status: 'reviewed',
        },
      },
      application_accepted: {
        title: '¡Felicidades! Aplicación aceptada',
        message: 'TechCorp Internacional ha aceptado tu aplicación para Desarrollador Full Stack Senior',
        action_url: '/talent-dashboard/applications',
        data: {
          application_id: 'test-app-id',
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          old_status: 'reviewed',
          new_status: 'accepted',
        },
      },
      application_rejected: {
        title: 'Actualización de aplicación',
        message: 'Tu aplicación para Desarrollador Full Stack Senior no ha sido seleccionada en esta ocasión',
        action_url: '/talent-dashboard/applications',
        data: {
          application_id: 'test-app-id',
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          old_status: 'reviewed',
          new_status: 'rejected',
        },
      },
      application_hired: {
        title: '¡Contratado!',
        message: '¡Felicidades! Has sido contratado para Desarrollador Full Stack Senior en TechCorp Internacional',
        action_url: '/talent-dashboard/applications',
        data: {
          application_id: 'test-app-id',
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          old_status: 'accepted',
          new_status: 'hired',
        },
      },
      opportunity_closed_manual: {
        title: '🔒 Oportunidad cerrada',
        message: 'La oportunidad "Desarrollador Full Stack Senior" de TechCorp Internacional ha sido cerrada',
        action_url: '/talent-dashboard/applications',
        data: {
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          new_status: 'closed',
        },
      },
      opportunity_closed_auto: {
        title: '⏰ Oportunidad expirada',
        message: 'La oportunidad "Desarrollador Full Stack Senior" de TechCorp Internacional ha expirado automáticamente',
        action_url: '/talent-dashboard/applications',
        data: {
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          new_status: 'closed',
        },
      },
      opportunity: {
        title: '💼 Oportunidad cerrada (prueba)',
        message: 'Tu oportunidad "Marketing Manager" ha sido cerrada automáticamente',
        action_url: '/business-dashboard/opportunities',
        data: {
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Marketing Manager',
        },
      },
      milestone: {
        title: '🎯 ¡Nuevo milestone alcanzado!',
        message: 'Tu oportunidad "Desarrollador Full Stack Senior" ha recibido 25 aplicantes',
        action_url: '/business-dashboard/applications',
        data: {
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Desarrollador Full Stack Senior',
          company_name: 'TechCorp Internacional',
          milestone: 25,
        },
      },
      message: {
        title: '💬 Nuevo mensaje de prueba',
        message: 'Tienes un nuevo mensaje de Juan Pérez sobre el proyecto de desarrollo',
        action_url: '/messages',
        data: {
          sender_id: 'test-sender-id',
          sender_name: 'Juan Pérez',
          message_preview: 'Hola, me gustaría discutir los detalles del proyecto...',
        },
      },
      team: {
        title: '👥 Nueva solicitud de equipo (prueba)',
        message: 'Carlos Rodríguez solicitó unirse a tu empresa como Viewer',
        action_url: '/business-dashboard/users',
        data: {
          company_id: 'test-company-id',
          company_name: 'TechCorp Internacional',
          candidate_name: 'Carlos Rodríguez',
        },
      },
      marketplace: {
        title: '🛍️ Consulta sobre tu servicio (prueba)',
        message: 'Ana Martínez consultó por tu servicio "Desarrollo Web Profesional"',
        action_url: '/talent-dashboard/marketplace',
        data: {
          service_title: 'Desarrollo Web Profesional',
          requester_name: 'Ana Martínez',
        },
      },
      moderation: {
        title: '⚠️ Contenido en revisión (prueba)',
        message: 'Tu oportunidad "Diseñador UX/UI" está siendo revisada por el equipo de moderación',
        action_url: '/business-dashboard/opportunities',
        data: {
          opportunity_id: 'test-opp-id',
          opportunity_title: 'Diseñador UX/UI',
        },
      },
      'welcome-talent': {
        title: '👋 ¡Bienvenido a TalentoDigital!',
        message: 'Estamos emocionados de tenerte en nuestra plataforma. Completa tu perfil para comenzar.',
        action_url: '/talent/edit-profile',
        data: {},
      },
      'welcome-business': {
        title: '🏢 ¡Bienvenido a TalentoDigital!',
        message: 'Tu empresa se unió exitosamente. Completa el perfil y publica tu primera oportunidad.',
        action_url: '/business/profile',
        data: {},
      },
      'welcome-academy': {
        title: '🎓 ¡Bienvenido a TalentoDigital!',
        message: 'Tu academia está lista. Invita a tus estudiantes y gestiona tu directorio.',
        action_url: '/academy/dashboard',
        data: {},
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

    // Create notification in database with complete data for variable substitution
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        type: notificationType,
        title: testData.title,
        message: testData.message,
        action_url: testData.action_url,
        data: testData.data || {},  // Include enriched data for email variable substitution
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
