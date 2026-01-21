import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerRequest {
  trigger_type: string;
  recipient_id: string;
  company_id?: string;
  opportunity_id?: string;
  message_id?: string; // Optional: specific automated message to use
  is_test?: boolean;   // For test mode
}

interface AutomatedMessage {
  id: string;
  trigger_type: string;
  sender_id: string;
  message_content: string;
  is_active: boolean;
}

// Substitute variables in message content
function substituteVariables(
  template: string,
  context: {
    firstName?: string;
    fullName?: string;
    companyName?: string;
    opportunityTitle?: string;
  }
): string {
  return template
    .replace(/\{\{first_name\}\}/gi, context.firstName || '')
    .replace(/\{\{full_name\}\}/gi, context.fullName || '')
    .replace(/\{\{company_name\}\}/gi, context.companyName || '')
    .replace(/\{\{opportunity_title\}\}/gi, context.opportunityTitle || '');
}

// Extract first name from full name
function getFirstName(fullName: string | null): string {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: TriggerRequest = await req.json();
    const { trigger_type, recipient_id, company_id, opportunity_id, message_id, is_test } = body;

    console.log('Trigger automated message request:', { trigger_type, recipient_id, company_id, opportunity_id, message_id, is_test });

    if (!trigger_type || !recipient_id) {
      return new Response(
        JSON.stringify({ error: 'trigger_type and recipient_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get automated message configuration
    let query = supabase
      .from('automated_messages')
      .select('*')
      .eq('trigger_type', trigger_type)
      .eq('is_active', true);

    if (message_id) {
      query = supabase
        .from('automated_messages')
        .select('*')
        .eq('id', message_id);
    }

    const { data: automatedMessages, error: msgError } = await query;

    if (msgError) {
      console.error('Error fetching automated messages:', msgError);
      throw msgError;
    }

    if (!automatedMessages || automatedMessages.length === 0) {
      console.log('No active automated message found for trigger:', trigger_type);
      return new Response(
        JSON.stringify({ success: false, message: 'No active automated message for this trigger' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recipient profile data
    const { data: recipientProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, user_id')
      .eq('user_id', recipient_id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching recipient profile:', profileError);
    }

    const fullName = recipientProfile?.full_name || '';
    const firstName = getFirstName(fullName);

    // Get company name if applicable
    let companyName = '';
    if (company_id) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', company_id)
        .single();

      if (!companyError && companyData) {
        companyName = companyData.name;
      }
    } else if (['new_company', 'new_academy', 'first_opportunity', 'new_opportunity'].includes(trigger_type)) {
      // Try to get company where user is owner
      const { data: ownedCompany } = await supabase
        .from('companies')
        .select('name')
        .eq('user_id', recipient_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (ownedCompany) {
        companyName = ownedCompany.name;
      }
    }

    // Get opportunity title if applicable
    let opportunityTitle = '';
    if (opportunity_id) {
      const { data: opportunityData, error: oppError } = await supabase
        .from('opportunities')
        .select('title')
        .eq('id', opportunity_id)
        .single();

      if (!oppError && opportunityData) {
        opportunityTitle = opportunityData.title;
      }
    }

    const context = {
      firstName,
      fullName,
      companyName,
      opportunityTitle,
    };

    console.log('Variable context:', context);

    const sentMessages = [];

    for (const automatedMsg of automatedMessages) {
      // Substitute variables in message content
      const processedContent = substituteVariables(automatedMsg.message_content, context);

      console.log('Processed message content:', processedContent);

      // Create conversation ID
      const conversationId = `automated_${automatedMsg.trigger_type}_${recipient_id}_${Date.now()}`;

      // First, create or get a conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', recipient_id)
        .eq('admin_id', automatedMsg.sender_id)
        .maybeSingle();

      let conversationUuid: string;

      if (existingConv) {
        conversationUuid = existingConv.id;
        // Update last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', existingConv.id);
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: recipient_id,
            admin_id: automatedMsg.sender_id,
            subject: is_test ? '[TEST] Mensaje Automatizado' : 'Mensaje Automatizado',
            status: 'active',
            priority: 'low',
            tags: is_test ? ['automated', 'test'] : ['automated'],
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          throw convError;
        }

        conversationUuid = newConv.id;
      }

      // Insert the message
      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: automatedMsg.sender_id,
          recipient_id: recipient_id,
          conversation_id: conversationId,
          conversation_uuid: conversationUuid,
          content: processedContent,
          message_type: 'text',
          is_read: false,
          delivered_at: new Date().toISOString(),
        })
        .select('id, content')
        .single();

      if (insertError) {
        console.error('Error inserting message:', insertError);
        throw insertError;
      }

      console.log('Message sent successfully:', insertedMessage.id);

      sentMessages.push({
        message_id: insertedMessage.id,
        automated_message_id: automatedMsg.id,
        trigger_type: automatedMsg.trigger_type,
        recipient_id,
        content_preview: processedContent.substring(0, 100) + (processedContent.length > 100 ? '...' : ''),
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messages_sent: sentMessages.length,
        details: sentMessages,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in trigger-automated-message:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
