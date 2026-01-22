import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'wendy@talentodigital.io'
const DELAY_MS = 60000 // 1 minute delay

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { bug_report_id } = await req.json()
    
    if (!bug_report_id) {
      console.error('No bug_report_id provided')
      return new Response(
        JSON.stringify({ error: 'bug_report_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Scheduling auto-comment for bug report: ${bug_report_id}`)

    // Use EdgeRuntime.waitUntil for background processing
    const backgroundTask = async () => {
      try {
        // Wait 1 minute before posting the comment
        console.log(`Waiting ${DELAY_MS}ms before posting auto-comment...`)
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
        
        // Find admin user by email
        const { data: adminAuthData, error: authError } = await supabase.auth.admin.listUsers()
        
        if (authError) {
          console.error('Error listing users:', authError)
          return
        }

        const adminUser = adminAuthData?.users?.find(u => u.email === ADMIN_EMAIL)
        
        if (!adminUser) {
          console.error(`Admin user not found with email: ${ADMIN_EMAIL}`)
          return
        }

        console.log(`Found admin user: ${adminUser.id}`)

        // Get admin profile for name and avatar
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', adminUser.id)
          .single()

        // Check if the bug report still exists
        const { data: bugReport, error: reportError } = await supabase
          .from('bug_reports')
          .select('id, title')
          .eq('id', bug_report_id)
          .single()

        if (reportError || !bugReport) {
          console.log('Bug report not found, skipping auto-comment')
          return
        }

        // Check if an auto-comment already exists (to prevent duplicates)
        const { data: existingComment } = await supabase
          .from('bug_report_comments')
          .select('id')
          .eq('bug_report_id', bug_report_id)
          .eq('user_id', adminUser.id)
          .eq('is_admin_reply', true)
          .limit(1)
          .single()

        if (existingComment) {
          console.log('Auto-comment already exists, skipping')
          return
        }

        // Create the automated comment
        const commentContent = `Gracias por reportarlo 🙌

Ya estamos al tanto del problema y el equipo de TalentoDigital lo va a revisar.`

        const { error: insertError } = await supabase
          .from('bug_report_comments')
          .insert({
            bug_report_id: bug_report_id,
            user_id: adminUser.id,
            content: commentContent,
            is_admin_reply: true
          })

        if (insertError) {
          console.error('Error inserting auto-comment:', insertError)
          return
        }

        console.log(`Auto-comment posted successfully for bug report: ${bug_report_id}`)
        
      } catch (bgError) {
        console.error('Background task error:', bgError)
      }
    }

    // Start background task
    EdgeRuntime.waitUntil(backgroundTask())

    // Return immediate response
    return new Response(
      JSON.stringify({ success: true, message: 'Auto-comment scheduled' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in auto-bug-report-comment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
