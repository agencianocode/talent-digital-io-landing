import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();

    if (action === 'cleanup') {
      // Limpiar datos demo
      await supabaseClient.from('messages').delete().ilike('content', '%DEMO%');
      await supabaseClient.from('notifications').delete().ilike('message', '%DEMO%');
      await supabaseClient.from('conversation_overrides').delete().eq('force_unread', true);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Demo data cleaned' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener usuario actual
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('Generating demo data for user:', user.id);

    // Crear usuario demo talento (simulado)
    const demoTalentId = '00000000-0000-0000-0000-000000000001';
    const demoCompanyId = crypto.randomUUID();

    // 1. Crear conversaciones demo
    const conversations = [
      {
        id: `demo_app_${user.id}`,
        sender_id: demoTalentId,
        recipient_id: user.id,
        content: 'DEMO: Hola, estoy interesado en la oportunidad de Desarrollador Frontend',
        message_type: 'text',
        label: 'opportunity',
        is_read: false,
        conversation_id: `demo_app_${user.id}`,
      },
      {
        id: `demo_contact_${user.id}`,
        sender_id: demoTalentId,
        recipient_id: user.id,
        content: 'DEMO: Me gustaría conectar para discutir oportunidades',
        message_type: 'text',
        label: 'profile_contact',
        is_read: true,
        conversation_id: `demo_contact_${user.id}`,
      },
      {
        id: `demo_service_${user.id}`,
        sender_id: demoTalentId,
        recipient_id: user.id,
        content: 'DEMO: Tengo algunas preguntas sobre tu servicio de diseño',
        message_type: 'text',
        label: 'marketplace',
        is_read: false,
        conversation_id: `demo_service_${user.id}`,
      },
    ];

    for (const msg of conversations) {
      await supabaseClient.from('messages').insert(msg);
    }

    // 2. Crear notificaciones demo
    const notifications = [
      {
        user_id: user.id,
        type: 'team',
        title: '👥 Nuevo miembro en el equipo',
        message: 'DEMO: Juan Pérez se unió a tu empresa como Administrador',
        action_url: '/business-dashboard/users',
        read: false,
      },
      {
        user_id: user.id,
        type: 'team',
        title: '🔔 Solicitud de acceso',
        message: 'DEMO: María García solicitó unirse a tu empresa como Viewer',
        action_url: '/business-dashboard/users',
        read: false,
      },
      {
        user_id: user.id,
        type: 'opportunity',
        title: '⏰ Oportunidad próxima a vencer',
        message: 'DEMO: Tu oportunidad "Desarrollador Full Stack" vence en 3 días',
        action_url: '/business-dashboard/opportunities',
        read: false,
      },
      {
        user_id: user.id,
        type: 'opportunity',
        title: '📊 Oportunidad sin postulantes',
        message: 'DEMO: Tu oportunidad "Diseñador UI/UX" lleva 5 días sin postulantes',
        action_url: '/business-dashboard/opportunities',
        read: false,
      },
      {
        user_id: user.id,
        type: 'application',
        title: '🎯 Nuevo aplicante',
        message: 'DEMO: Carlos Rodríguez aplicó a "Senior Developer"',
        action_url: '/business-dashboard/applications',
        read: false,
      },
      {
        user_id: user.id,
        type: 'application',
        title: '🎯 ¡Milestone alcanzado!',
        message: 'DEMO: Tu oportunidad "Product Manager" ha alcanzado 10 postulantes',
        action_url: '/business-dashboard/applications',
        read: true,
      },
      {
        user_id: user.id,
        type: 'marketplace',
        title: '🟣 Consulta sobre tu servicio',
        message: 'DEMO: Ana López consultó por tu servicio "Desarrollo Web"',
        action_url: '/talent-dashboard/marketplace',
        read: false,
      },
    ];

    for (const notification of notifications) {
      await supabaseClient.from('notifications').insert(notification);
    }

    console.log('Demo data created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data generated',
        stats: {
          conversations: conversations.length,
          notifications: notifications.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating demo data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
