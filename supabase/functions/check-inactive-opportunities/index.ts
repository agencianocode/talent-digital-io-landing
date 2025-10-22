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
      console.warn('⚠️ Unauthorized access attempt to check-inactive-opportunities');
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

    console.log('🔍 Checking for inactive opportunities...');

    // Get opportunities that are 5 days old and have no applications
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        created_at,
        company_id,
        companies (
          user_id
        )
      `)
      .eq('status', 'active')
      .lte('created_at', fiveDaysAgo.toISOString());

    if (oppError) {
      console.error('Error fetching opportunities:', oppError);
      throw oppError;
    }

    console.log(`📊 Found ${opportunities?.length || 0} opportunities older than 5 days`);

    let notificationsCreated = 0;

    for (const opp of opportunities || []) {
      // Check if opportunity has any applications
      const { count: appCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', opp.id);

      if (appCount === 0) {
        // Check if notification already sent today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', (opp.companies as any).user_id)
          .eq('type', 'opportunity')
          .ilike('message', `%${opp.title}%sin postulantes%`)
          .gte('created_at', today.toISOString())
          .single();

        if (!existingNotif) {
          // Create notification
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: (opp.companies as any).user_id,
              type: 'opportunity',
              title: '📊 Oportunidad sin postulantes',
              message: `Tu oportunidad "${opp.title}" lleva 5 días publicada sin postulantes. ¿Necesitas ajustarla?`,
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
      }
    }

    console.log(`✅ Process complete. Created ${notificationsCreated} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        opportunitiesChecked: opportunities?.length || 0,
        notificationsCreated
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in check-inactive-opportunities:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});