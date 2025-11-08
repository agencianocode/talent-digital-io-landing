import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
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
          const resendApiKey = Deno.env.get('RESEND_API_KEY');
          const appUrl = Deno.env.get('APP_URL') || 'https://app.talentodigital.io';
          
          const isTalent = newRole === 'premium_talent';
          const userType = isTalent ? 'Talento' : 'Empresa';
          const dashboardLink = isTalent 
            ? `${appUrl}/talent-dashboard/my-services` 
            : `${appUrl}/business-dashboard`;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'notificaciones@app.talentodigital.io',
              to: targetUser.email,
              subject: '🎉 ¡Tu solicitud Premium fue aprobada!',
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                      .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                      ul { background: white; padding: 20px 20px 20px 40px; border-radius: 5px; margin: 20px 0; }
                      li { margin: 10px 0; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>🎉 ¡Felicitaciones!</h1>
                      </div>
                      <div class="content">
                        <h2>Hola ${userProfile?.full_name || userType},</h2>
                        <p>¡Excelentes noticias! Tu solicitud para ser <strong>${userType} Premium</strong> en TalentoDigital.io ha sido aprobada.</p>
                        
                        <p><strong>Ahora puedes:</strong></p>
                        <ul>
                          ${isTalent ? `
                          <li>✅ Publicar servicios en el Marketplace</li>
                          <li>✅ Recibir más visibilidad en búsquedas</li>
                          <li>✅ Acceder a funcionalidades exclusivas Premium</li>
                          <li>✅ Conectar con más empresas y oportunidades</li>
                          ` : `
                          <li>✅ Publicar oportunidades ilimitadas</li>
                          <li>✅ Acceder a más talentos certificados</li>
                          <li>✅ Funcionalidades avanzadas de búsqueda</li>
                          <li>✅ Soporte prioritario</li>
                          `}
                        </ul>
                        
                        <p>${isTalent 
                          ? 'Empieza ahora mismo a publicar tus servicios y lleva tu carrera al siguiente nivel.' 
                          : 'Empieza a construir tu equipo con acceso completo a la plataforma.'
                        }</p>
                        
                        <center>
                          <a href="${dashboardLink}" class="button">
                            ${isTalent ? 'Ver Mis Servicios' : 'Ir al Dashboard'}
                          </a>
                        </center>
                        
                        <p style="margin-top: 30px; font-size: 12px; color: #666;">
                          Si tienes alguna pregunta, no dudes en contactarnos.
                        </p>
                      </div>
                    </div>
                  </body>
                </html>
              `
            })
          });

          console.log('Email de aprobación Premium enviado a:', targetUser.email);
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
