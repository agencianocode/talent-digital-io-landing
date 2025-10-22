// Edge Function to run daily opportunity notifications
// This should be triggered by a cron job (e.g., via Supabase cron or external scheduler)

// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization - check for Authorization header or cron secret
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    // Allow if called with service role key or matching cron secret
    const isAuthorized = 
      authHeader?.includes('Bearer') || 
      (cronSecret && authHeader === `Bearer ${cronSecret}`)
    
    if (!isAuthorized) {
      console.warn('⚠️ Unauthorized access attempt')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Create Supabase client
    // @ts-ignore - Deno global
    const supabaseClient = createClient(
      // @ts-ignore - Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore - Deno global
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Running daily opportunity notifications...')

    // Execute notification functions
    const { error: expiringError } = await supabaseClient.rpc('notify_expiring_opportunities')
    if (expiringError) {
      console.error('Error in notify_expiring_opportunities:', expiringError)
    } else {
      console.log('✓ Expiring opportunities notifications sent')
    }

    const { error: inactiveError } = await supabaseClient.rpc('notify_inactive_opportunities')
    if (inactiveError) {
      console.error('Error in notify_inactive_opportunities:', inactiveError)
    } else {
      console.log('✓ Inactive opportunities notifications sent')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily notifications processed successfully',
        errors: {
          expiring: expiringError?.message || null,
          inactive: inactiveError?.message || null
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

