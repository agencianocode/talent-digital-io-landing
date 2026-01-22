import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the requesting user is an admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || adminRole?.role !== 'admin') {
      console.error('Not admin:', roleError || adminRole);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { companyId, newSubscription } = await req.json();

    if (!companyId || !newSubscription) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: companyId, newSubscription' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate subscription value
    const validSubscriptions = ['freemium', 'premium'];
    if (!validSubscriptions.includes(newSubscription)) {
      return new Response(
        JSON.stringify({ error: `Invalid subscription. Must be one of: ${validSubscriptions.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Changing company ${companyId} subscription to ${newSubscription}`);

    // Get company data to determine business_type
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, name, status, business_type')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('Company not found:', companyError);
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oldStatus = company.status;
    const newStatus = newSubscription === 'premium' ? 'premium' : 'active';
    const isAcademy = company.business_type === 'academy';

    // Determine the new role for members based on subscription and business_type
    let newMemberRole: string;
    if (newSubscription === 'premium') {
      newMemberRole = isAcademy ? 'academy_premium' : 'premium_business';
    } else {
      newMemberRole = 'freemium_business';
    }

    console.log(`Company ${company.name}: ${oldStatus} -> ${newStatus}, member role: ${newMemberRole}`);

    // Update company status
    const { error: updateCompanyError } = await supabaseAdmin
      .from('companies')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', companyId);

    if (updateCompanyError) {
      console.error('Error updating company:', updateCompanyError);
      return new Response(
        JSON.stringify({ error: 'Failed to update company status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all accepted members of this company
    const { data: companyMembers, error: membersError } = await supabaseAdmin
      .from('company_user_roles')
      .select('user_id, role')
      .eq('company_id', companyId)
      .eq('status', 'accepted')
      .not('user_id', 'is', null);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch company members' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${companyMembers?.length || 0} members to update`);

    // Update each member's user_role
    const updateResults = {
      success: [] as string[],
      failed: [] as string[],
      skipped: [] as string[]
    };

    for (const member of companyMembers || []) {
      if (!member.user_id) continue;

      try {
        // Get current role
        const { data: currentRole } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', member.user_id)
          .single();

        const oldRole = currentRole?.role || 'freemium_business';

        // Skip if user is an admin (superadmin)
        if (oldRole === 'admin') {
          updateResults.skipped.push(member.user_id);
          console.log(`Skipping admin user: ${member.user_id}`);
          continue;
        }

        // Skip if already has the correct role
        if (oldRole === newMemberRole) {
          updateResults.skipped.push(member.user_id);
          continue;
        }

        // Update user role
        const { error: upsertError } = await supabaseAdmin
          .from('user_roles')
          .upsert(
            { user_id: member.user_id, role: newMemberRole },
            { onConflict: 'user_id' }
          );

        if (upsertError) {
          console.error(`Error updating role for ${member.user_id}:`, upsertError);
          updateResults.failed.push(member.user_id);
          continue;
        }

        // Record audit
        await supabaseAdmin
          .from('role_change_audit')
          .insert({
            user_id: member.user_id,
            old_role: oldRole,
            new_role: newMemberRole,
            changed_by: user.id,
            reason: `Company subscription changed to ${newSubscription}`
          });

        updateResults.success.push(member.user_id);
        console.log(`Updated ${member.user_id}: ${oldRole} -> ${newMemberRole}`);

      } catch (err) {
        console.error(`Error processing member ${member.user_id}:`, err);
        updateResults.failed.push(member.user_id);
      }
    }

    console.log(`Update complete. Success: ${updateResults.success.length}, Failed: ${updateResults.failed.length}, Skipped: ${updateResults.skipped.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        company: {
          id: companyId,
          name: company.name,
          oldStatus,
          newStatus,
          newMemberRole
        },
        membersUpdated: updateResults.success.length,
        membersFailed: updateResults.failed.length,
        membersSkipped: updateResults.skipped.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-change-company-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
