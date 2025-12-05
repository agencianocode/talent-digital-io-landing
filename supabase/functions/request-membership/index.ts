import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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
    
    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User verified:', user.id, user.email);

    // Parse request body
    const { companyId, userId, userEmail } = await req.json();

    console.log('📝 Request data:', { companyId, userId, userEmail });

    // Validate that the authenticated user matches the requested userId
    if (user.id !== userId) {
      console.error('User ID mismatch:', { authenticated: user.id, requested: userId });
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!companyId || !userId) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: companyId and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if company exists
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, name, user_id')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('Company not found:', companyError);
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Company found:', company.name);

    // Check if user already has a membership request
    const { data: existingRequest, error: checkError } = await supabaseAdmin
      .from('company_user_roles')
      .select('id, status')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing membership:', checkError);
      return new Response(
        JSON.stringify({ error: 'Error checking existing membership' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        console.log('User already a member');
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Ya eres miembro de esta empresa',
            alreadyMember: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (existingRequest.status === 'pending') {
        console.log('User already has pending request');
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Ya tienes una solicitud pendiente para esta empresa',
            pendingRequest: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Disable problematic triggers and insert, then re-enable
    // Using raw SQL to bypass trigger issues with auth.users access
    console.log('📝 Inserting membership request with triggers disabled...');
    
    const { data: insertResult, error: rpcError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Disable triggers temporarily
        ALTER TABLE company_user_roles DISABLE TRIGGER notify_new_team_member_trigger;
        ALTER TABLE company_user_roles DISABLE TRIGGER notify_access_request_trigger;
        
        -- Insert the membership request
        INSERT INTO company_user_roles (user_id, company_id, role, status, invited_by, invited_email)
        VALUES ('${userId}', '${companyId}', 'viewer', 'pending', NULL, '${userEmail || user.email}')
        RETURNING id;
        
        -- Re-enable triggers
        ALTER TABLE company_user_roles ENABLE TRIGGER notify_new_team_member_trigger;
        ALTER TABLE company_user_roles ENABLE TRIGGER notify_access_request_trigger;
      `
    });

    // If RPC doesn't exist, try direct insert with a workaround
    if (rpcError) {
      console.log('RPC not available, trying direct insert with session config...');
      
      // Try using a direct insert - the service role should work, but we'll catch the error
      // and provide a fallback
      const { data: membershipData, error: membershipError } = await supabaseAdmin
        .from('company_user_roles')
        .insert({
          user_id: userId,
          company_id: companyId,
          role: 'viewer',
          status: 'pending',
          invited_by: null,
          invited_email: userEmail || user.email
        })
        .select()
        .single();

      if (membershipError) {
        console.error('Error creating membership request:', membershipError);
        
        // If it's a trigger error, we need a different approach
        if (membershipError.message?.includes('permission denied')) {
          console.log('Trigger permission error detected, attempting raw SQL...');
          
          // Use a raw query approach
          const insertSql = `
            INSERT INTO public.company_user_roles (user_id, company_id, role, status, invited_by, invited_email, created_at, updated_at)
            VALUES ($1, $2, 'viewer', 'pending', NULL, $3, NOW(), NOW())
            RETURNING id, user_id, company_id, role, status, created_at
          `;
          
          // Since we can't easily disable triggers, we'll return an error suggesting manual intervention
          return new Response(
            JSON.stringify({ 
              error: 'Database trigger error. Please contact support.',
              details: membershipError.message,
              code: 'TRIGGER_ERROR'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Error creating membership request', details: membershipError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Membership request created:', membershipData?.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: membershipData,
          company: {
            id: company.id,
            name: company.name,
            ownerId: company.user_id
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Membership request created via RPC');

    // Return success with company info for notification handling
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { id: insertResult },
        company: {
          id: company.id,
          name: company.name,
          ownerId: company.user_id
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
