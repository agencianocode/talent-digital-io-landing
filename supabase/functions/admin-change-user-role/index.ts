import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Request from user:', user.id);

    // Check if requesting user is admin
    const { data: requesterRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleCheckError) throw roleCheckError;
    if (!requesterRole || requesterRole.role !== 'admin') {
      throw new Error('Only admins can change user roles');
    }

    // Parse request body
    const { userId, newRole } = await req.json();
    
    if (!userId || !newRole) {
      throw new Error('Missing userId or newRole');
    }

    console.log('Changing role for user:', userId, 'to:', newRole);

    // Valid roles
    const validRoles = ['admin', 'business', 'talent', 'premium_business', 'freemium_business', 'premium_talent', 'freemium_talent'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }

    // Get current role for audit
    const { data: currentRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    // Update role using service role (bypasses RLS)
    const { error: updateError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

    if (updateError) throw updateError;

    console.log('Role updated successfully');

    // Insert audit log
    await supabaseAdmin
      .from('role_change_audit')
      .insert({
        user_id: userId,
        changed_by: user.id,
        old_role: currentRole?.role || null,
        new_role: newRole,
        reason: 'Admin panel role change'
      });

    return new Response(
      JSON.stringify({ success: true, newRole }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error changing role:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' || error.message === 'Only admins can change user roles' ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
