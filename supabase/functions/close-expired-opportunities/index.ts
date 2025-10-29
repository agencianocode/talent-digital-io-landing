import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // CRITICAL SECURITY: Verify CRON_SECRET for all incoming requests
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (!cronSecret) {
      console.error('❌ CRON_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    // Strict validation: MUST provide exact CRON_SECRET
    const providedSecret = authHeader?.replace('Bearer ', '');
    const isAuthorized = providedSecret === cronSecret;
    
    if (!isAuthorized) {
      console.warn('⚠️ Unauthorized access attempt to close-expired-opportunities');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }
    
    console.log('✅ Authorized CRON request verified');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Checking for expired opportunities...');

    // Get current date (without time component)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get all active opportunities with deadline_date that has passed
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        deadline_date,
        company_id,
        companies (
          user_id,
          name
        )
      `)
      .eq('status', 'active')
      .not('deadline_date', 'is', null)
      .lt('deadline_date', todayStr);

    if (oppError) {
      console.error('Error fetching expired opportunities:', oppError);
      throw oppError;
    }

    console.log(`📊 Found ${opportunities?.length || 0} expired opportunities`);

    let opportunitiesClosed = 0;
    let notificationsCreated = 0;

    for (const opp of opportunities || []) {
      // Close the opportunity by setting status to 'closed'
      const { error: updateError } = await supabase
        .from('opportunities')
        .update({ 
          status: 'closed',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', opp.id);

      if (updateError) {
        console.error(`Error closing opportunity ${opp.id}:`, updateError);
        continue;
      }

      opportunitiesClosed++;
      console.log(`✅ Closed opportunity: ${opp.title}`);

      // Create notification for the company owner
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: (opp.companies as any).user_id,
          type: 'opportunity',
          title: '📅 Oportunidad cerrada por fecha límite',
          message: `Tu oportunidad "${opp.title}" se ha cerrado automáticamente al alcanzar su fecha límite. Puedes reabrirla y establecer una nueva fecha desde tu dashboard.`,
          action_url: `/business-dashboard/opportunities/${opp.id}`,
          read: false
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      } else {
        notificationsCreated++;
        console.log(`✅ Notification created for opportunity: ${opp.title}`);
      }
    }

    console.log(`✅ Process complete. Closed ${opportunitiesClosed} opportunities, created ${notificationsCreated} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        opportunitiesClosed,
        notificationsCreated,
        opportunitiesChecked: opportunities?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in close-expired-opportunities:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
