import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { record } = await req.json();
    console.log('New user created:', record.id);

    // Get user profile to send personalized message
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', record.id)
      .single();

    const userName = profile?.full_name || 'Usuario';

    // Create welcome message - use a system admin user or create a special support user
    const welcomeMessage = {
      sender_id: '00000000-0000-0000-0000-000000000000', // System/Admin user ID
      recipient_id: record.id,
      conversation_id: `welcome_${record.id}`,
      content: `¡Hola ${userName}! 👋

Bienvenido/a a TalentoDigital. Estamos muy contentos de tenerte con nosotros.

Nuestro equipo está aquí para ayudarte en todo lo que necesites. Si tienes alguna pregunta o necesitas asistencia, no dudes en escribirnos.

Algunos recursos que pueden interesarte:
• Completa tu perfil para destacar ante reclutadores
• Explora las oportunidades disponibles
• Descubre el marketplace de servicios

¿En qué podemos ayudarte hoy?

Saludos,
Equipo TalentoDigital`,
      message_type: 'text',
      label: 'welcome',
      is_read: false,
      delivered_at: new Date().toISOString()
    };

    const { error: messageError } = await supabase
      .from('messages')
      .insert(welcomeMessage);

    if (messageError) {
      console.error('Error sending welcome message:', messageError);
      throw messageError;
    }

    console.log('Welcome message sent successfully to user:', record.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome message sent' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-welcome-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
