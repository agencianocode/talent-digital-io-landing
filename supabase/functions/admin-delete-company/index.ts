import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the authorization header to verify admin status
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user is an admin
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Only admins can delete companies' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { companyId } = await req.json()
    
    if (!companyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Company ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Admin ${user.id} deleting company ${companyId}`)

    // Delete in order to handle foreign key constraints
    
    // 1. Get opportunities for this company
    const { data: opportunities } = await supabaseAdmin
      .from('opportunities')
      .select('id')
      .eq('company_id', companyId)

    if (opportunities && opportunities.length > 0) {
      const opportunityIds = opportunities.map(o => o.id)
      
      // Delete application ratings
      const { data: applications } = await supabaseAdmin
        .from('applications')
        .select('id')
        .in('opportunity_id', opportunityIds)
      
      if (applications && applications.length > 0) {
        const applicationIds = applications.map(a => a.id)
        await supabaseAdmin
          .from('application_ratings')
          .delete()
          .in('application_id', applicationIds)
      }
      
      // Delete applications
      await supabaseAdmin
        .from('applications')
        .delete()
        .in('opportunity_id', opportunityIds)
      
      // Delete opportunity views
      await supabaseAdmin
        .from('opportunity_views')
        .delete()
        .in('opportunity_id', opportunityIds)
      
      // Delete opportunity shares
      await supabaseAdmin
        .from('opportunity_shares')
        .delete()
        .in('opportunity_id', opportunityIds)
      
      // Delete saved opportunities
      await supabaseAdmin
        .from('saved_opportunities')
        .delete()
        .in('opportunity_id', opportunityIds)
      
      // Delete opportunities
      await supabaseAdmin
        .from('opportunities')
        .delete()
        .eq('company_id', companyId)
    }

    // 2. Delete academy-related data
    // Get academy students first to delete audit logs
    const { data: students } = await supabaseAdmin
      .from('academy_students')
      .select('id')
      .eq('academy_id', companyId)
    
    if (students && students.length > 0) {
      const studentIds = students.map(s => s.id)
      await supabaseAdmin
        .from('academy_student_audit')
        .delete()
        .in('student_id', studentIds)
    }
    
    await supabaseAdmin
      .from('academy_students')
      .delete()
      .eq('academy_id', companyId)
    
    await supabaseAdmin
      .from('academy_courses')
      .delete()
      .eq('academy_id', companyId)

    // 3. Delete marketplace services and related data
    const { data: services } = await supabaseAdmin
      .from('marketplace_services')
      .select('id')
      .eq('company_id', companyId)
    
    if (services && services.length > 0) {
      const serviceIds = services.map(s => s.id)
      
      await supabaseAdmin
        .from('marketplace_service_requests')
        .delete()
        .in('service_id', serviceIds)
      
      await supabaseAdmin
        .from('service_reviews')
        .delete()
        .in('service_id', serviceIds)
    }
    
    await supabaseAdmin
      .from('marketplace_services')
      .delete()
      .eq('company_id', companyId)

    // 4. Delete company user roles
    await supabaseAdmin
      .from('company_user_roles')
      .delete()
      .eq('company_id', companyId)

    // 5. Finally delete the company
    const { error: deleteError } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', companyId)

    if (deleteError) {
      console.error('Error deleting company:', deleteError)
      return new Response(
        JSON.stringify({ success: false, error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Company ${companyId} deleted successfully`)

    return new Response(
      JSON.stringify({ success: true, message: 'Company deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in admin-delete-company:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})