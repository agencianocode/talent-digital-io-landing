import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const companyId = url.pathname.split('/').pop();

    if (!companyId) {
      return new Response('Missing company ID', { status: 400, headers: corsHeaders });
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch company data
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        logo_url,
        description,
        location,
        employee_count_range,
        annual_revenue_range
      `)
      .eq('id', companyId)
      .maybeSingle();

    if (error || !company) {
      console.error('Error fetching company:', error);
      return new Response('Company not found', { status: 404, headers: corsHeaders });
    }

    const companyName = company.name || 'Empresa';
    const companyLogo = company.logo_url || '';
    const description = company.description?.substring(0, 160) || 'Conoce más sobre esta empresa';
    const appUrl = `https://app.talentodigital.io/company/${companyId}`;

    // Check if the request is from a bot/crawler (for social media previews)
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const isBot = userAgent.includes('facebookexternalhit') || 
                  userAgent.includes('twitterbot') || 
                  userAgent.includes('linkedinbot') || 
                  userAgent.includes('whatsapp') ||
                  userAgent.includes('telegrambot') ||
                  userAgent.includes('slackbot') ||
                  userAgent.includes('bot');

    // If it's a bot, return HTML with meta tags for preview
    if (isBot) {
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - TalentoDigital</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${appUrl}">
  <meta property="og:title" content="${companyName}">
  <meta property="og:description" content="${description}">
  ${companyLogo ? `<meta property="og:image" content="${companyLogo}">` : ''}
  <meta property="og:site_name" content="TalentoDigital">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${appUrl}">
  <meta name="twitter:title" content="${companyName}">
  <meta name="twitter:description" content="${description}">
  ${companyLogo ? `<meta name="twitter:image" content="${companyLogo}">` : ''}
</head>
<body>
  <h1>${companyName}</h1>
  <p>${description}</p>
  <p>Ubicación: ${company.location || 'No especificada'}</p>
  <p>Empleados: ${company.employee_count_range || 'No especificado'}</p>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // If it's a regular browser, redirect to the SPA
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': appUrl,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error in company-share function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
