import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Starting opportunity tracking check...');

    // Call the database function to check and create notifications
    const { error } = await supabase.rpc('check_opportunity_tracking_notifications');

    if (error) {
      console.error('❌ Error running tracking check:', error);
      throw error;
    }

    console.log('✅ Opportunity tracking check completed');

    // Now process any pending notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('id')
      .eq('type', 'opportunity_tracking')
      .eq('processed', false)
      .limit(50);

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError);
    } else if (pendingNotifications && pendingNotifications.length > 0) {
      console.log(`📬 Found ${pendingNotifications.length} pending opportunity tracking notifications`);
      
      // Trigger process-notification for each
      for (const notification of pendingNotifications) {
        try {
          await supabase.functions.invoke('process-notification', {
            body: { notificationId: notification.id }
          });
          console.log(`✅ Processed notification ${notification.id}`);
        } catch (processError) {
          console.error(`Error processing notification ${notification.id}:`, processError);
        }
      }
    } else {
      console.log('📭 No pending opportunity tracking notifications');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Opportunity tracking check completed',
        notificationsProcessed: pendingNotifications?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in check-opportunity-tracking:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
