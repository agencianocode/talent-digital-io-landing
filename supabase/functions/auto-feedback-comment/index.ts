import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_USER_ID = '857b3dbb-a215-4beb-82b7-9ee9044b5b2e' // wendy@talentodigital.io
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
    
    const { suggestion_id } = await req.json()
    
    if (!suggestion_id) {
      console.error('No suggestion_id provided')
      return new Response(
        JSON.stringify({ error: 'suggestion_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Scheduling auto-comment for feedback suggestion: ${suggestion_id}`)

    // Use EdgeRuntime.waitUntil for background processing
    const backgroundTask = async () => {
      try {
        // Wait 1 minute before posting the comment
        console.log(`Waiting ${DELAY_MS}ms before posting auto-comment...`)
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
        
        console.log(`Using admin user ID: ${ADMIN_USER_ID}`)

        // Check if the suggestion still exists
        const { data: suggestion, error: suggestionError } = await supabase
          .from('feedback_suggestions')
          .select('id, title')
          .eq('id', suggestion_id)
          .single()

        if (suggestionError || !suggestion) {
          console.log('Suggestion not found, skipping auto-comment')
          return
        }

        // Check if an auto-comment already exists (to prevent duplicates)
        const { data: existingComment } = await supabase
          .from('feedback_comments')
          .select('id')
          .eq('suggestion_id', suggestion_id)
          .eq('user_id', ADMIN_USER_ID)
          .eq('is_admin_reply', true)
          .limit(1)
          .single()

        if (existingComment) {
          console.log('Auto-comment already exists, skipping')
          return
        }

        // Create the automated comment
        const commentContent = `Gracias por la sugerencia 💜

El equipo de TalentoDigital la va a revisar.`

        const { error: insertError } = await supabase
          .from('feedback_comments')
          .insert({
            suggestion_id: suggestion_id,
            user_id: ADMIN_USER_ID,
            content: commentContent,
            is_admin_reply: true
          })

        if (insertError) {
          console.error('Error inserting auto-comment:', insertError)
          return
        }

        console.log(`Auto-comment posted successfully for feedback suggestion: ${suggestion_id}`)
        
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
    console.error('Error in auto-feedback-comment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
