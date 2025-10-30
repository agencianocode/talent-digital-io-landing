import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactRequest {
  talentUserId: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany?: string;
  requesterRole?: string;
  message: string;
  contactType: 'proposal' | 'message' | 'general';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      talentUserId, 
      requesterName, 
      requesterEmail, 
      requesterCompany,
      requesterRole,
      message, 
      contactType 
    }: ContactRequest = await req.json();

    // Validate required fields
    if (!talentUserId || !requesterName || !requesterEmail || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requesterEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Anti-spam check: limit 3 requests per email per day
    const { data: recentRequests } = await supabase
      .from('public_contact_requests')
      .select('id')
      .eq('requester_email', requesterEmail)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (recentRequests && recentRequests.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Daily contact limit reached. Please try again tomorrow.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get talent's profile information
    const { data: talentProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', talentUserId)
      .single();

    if (!talentProfile) {
      return new Response(
        JSON.stringify({ error: 'Talent profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert contact request
    const { data: contactRequest, error: insertError } = await supabase
      .from('public_contact_requests')
      .insert({
        talent_user_id: talentUserId,
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_company: requesterCompany || null,
        requester_role: requesterRole || null,
        message: message,
        contact_type: contactType,
        status: 'pending',
        metadata: {
          user_agent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting contact request:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save contact request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create in-app notification for talent
    await supabase.from('notifications').insert({
      user_id: talentUserId,
      type: 'message',
      title: '📬 Nueva solicitud de contacto',
      message: `${requesterName}${requesterCompany ? ` de ${requesterCompany}` : ''} quiere contactarte desde tu perfil público`,
      action_url: '/talent-dashboard/messages',
      data: {
        contact_request_id: contactRequest.id,
        requester_email: requesterEmail,
        requester_name: requesterName
      },
      read: false
    });

    // Send email notification to talent
    try {
      await supabase.functions.invoke('send-notification-email', {
        body: {
          to: talentProfile.email,
          type: 'public_profile_contact',
          data: {
            talentName: talentProfile.full_name,
            requesterName,
            requesterEmail,
            requesterCompany,
            requesterRole,
            message,
            contactType,
            replyUrl: `mailto:${requesterEmail}`
          }
        }
      });
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Contact request sent successfully',
        contactRequestId: contactRequest.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handle-public-contact:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});