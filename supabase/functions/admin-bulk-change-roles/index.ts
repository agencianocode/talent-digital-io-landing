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
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to verify they're an admin
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
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
      console.log('Admin check failed:', { roleError, adminRole, userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Solo administradores pueden cambiar roles' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { userIds, newRole } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un array de userIds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newRole) {
      return new Response(
        JSON.stringify({ error: 'Se requiere especificar el nuevo rol' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Valid roles
    const validRoles = [
      'freemium_talent', 'premium_talent', 
      'freemium_business', 'premium_business',
      'academy_premium', 'admin'
    ];

    if (!validRoles.includes(newRole)) {
      return new Response(
        JSON.stringify({ error: `Rol inválido. Roles válidos: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.id} changing roles for ${userIds.length} users to ${newRole}`);

    const results = {
      success: [] as string[],
      failed: [] as { userId: string; error: string }[]
    };

    // Process each user
    for (const userId of userIds) {
      try {
        // Get current role for audit
        const { data: currentRoleData } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        const oldRole = currentRoleData?.role || null;

        // Update the role
        const { error: updateError } = await supabaseAdmin
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (updateError) {
          console.error(`Error updating role for ${userId}:`, updateError);
          results.failed.push({ userId, error: updateError.message });
          continue;
        }

        // Log the change in audit table
        await supabaseAdmin
          .from('role_change_audit')
          .insert({
            user_id: userId,
            old_role: oldRole,
            new_role: newRole,
            changed_by: user.id,
            reason: 'Cambio masivo desde panel de administración'
          });

        results.success.push(userId);
        console.log(`Successfully changed role for ${userId}: ${oldRole} -> ${newRole}`);

      } catch (err: any) {
        console.error(`Error processing user ${userId}:`, err);
        results.failed.push({ userId, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Roles actualizados: ${results.success.length} exitosos, ${results.failed.length} fallidos`,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in admin-bulk-change-roles:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
