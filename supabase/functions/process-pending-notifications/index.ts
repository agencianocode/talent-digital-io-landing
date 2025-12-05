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

    console.log('Processing pending notifications...');

    // Get unprocessed notifications from the last hour
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, created_at')
      .eq('processed', false)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      throw error;
    }

    console.log(`Found ${notifications?.length || 0} pending notifications`);

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each notification
    for (const notification of notifications) {
      try {
        console.log(`Processing notification ${notification.id}`);
        
        const { error: processError } = await supabase.functions.invoke(
          'process-notification',
          {
            body: { notification_id: notification.id },
          }
        );

        if (processError) {
          console.error(`Error processing notification ${notification.id}:`, processError);
          errorCount++;
          results.push({
            id: notification.id,
            success: false,
            error: processError.message,
          });
        } else {
          console.log(`Successfully processed notification ${notification.id}`);
          successCount++;
          results.push({
            id: notification.id,
            success: true,
          });
        }
      } catch (error: any) {
        console.error(`Exception processing notification ${notification.id}:`, error);
        errorCount++;
        results.push({
          id: notification.id,
          success: false,
          error: error.message,
        });
      }
    }

    console.log(`Processed ${successCount} notifications successfully, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications.length,
        successful: successCount,
        errors: errorCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-pending-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
