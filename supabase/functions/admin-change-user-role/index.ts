import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const validRoles = ['admin', 'business', 'talent', 'premium_business', 'freemium_business', 'premium_talent', 'freemium_talent', 'academy_premium'];
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

    // Enviar email de aprobación si cambió de freemium a premium (Talento o Empresa)
    const oldRole = currentRole?.role;
    const isPremiumUpgrade = 
      (oldRole === 'freemium_talent' && newRole === 'premium_talent') ||
      (oldRole === 'freemium_business' && newRole === 'premium_business');

    if (isPremiumUpgrade) {
      try {
        // Obtener datos del usuario
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('user_id', userId)
          .single();

        const { data: { user: targetUser } } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (targetUser?.email) {
          const appUrl = Deno.env.get('APP_URL') || 'https://app.talentodigital.io';
          
          const isTalent = newRole === 'premium_talent';
          const userType = isTalent ? 'Talento' : 'Empresa';
          const dashboardLink = isTalent 
            ? `${appUrl}/talent-dashboard/my-services` 
            : `${appUrl}/business-dashboard`;

          // Usar el sistema unificado de emails con plantilla editable
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: targetUser.email,
              userName: userProfile?.full_name || userType,
              type: 'premium-approved',
              title: '🎉 ¡Tu solicitud Premium fue aprobada!',
              message: `Tu solicitud para ser ${userType} Premium ha sido aprobada.`,
              actionUrl: dashboardLink,
              actionText: isTalent ? 'Ver Mis Servicios' : 'Ir al Dashboard',
              data: {
                user_type: userType,
                is_talent: isTalent,
              }
            })
          });

          if (emailResponse.ok) {
            console.log('Email de aprobación Premium enviado a:', targetUser.email);
          } else {
            console.error('Error en respuesta de send-notification-email:', await emailResponse.text());
          }
        }
      } catch (emailError) {
        console.error('Error enviando email de aprobación:', emailError);
        // No fallar la operación si el email falla
      }
    }

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
