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
    const opportunityId = url.pathname.split('/').pop();

    if (!opportunityId) {
      return new Response('Missing opportunity ID', { status: 400, headers: corsHeaders });
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch opportunity data
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        description,
        type,
        location,
        companies (
          name,
          logo_url,
          description
        )
      `)
      .eq('id', opportunityId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !opportunity) {
      console.error('Error fetching opportunity:', error);
      return new Response('Opportunity not found', { status: 404, headers: corsHeaders });
    }

    const company = opportunity.companies as any;
    const companyName = company?.name || 'Empresa';
    const companyLogo = company?.logo_url || '';
    const description = opportunity.description?.substring(0, 160) || 'Nueva oportunidad laboral disponible';
    const appUrl = `https://app.talentodigital.io/opportunity/${opportunityId}`;

    // Generate HTML with Open Graph and Twitter meta tags
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opportunity.title} - ${companyName}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${appUrl}">
  <meta property="og:title" content="${opportunity.title} en ${companyName}">
  <meta property="og:description" content="${description}">
  ${companyLogo ? `<meta property="og:image" content="${companyLogo}">` : ''}
  <meta property="og:site_name" content="TalentoDigital">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${appUrl}">
  <meta name="twitter:title" content="${opportunity.title} en ${companyName}">
  <meta name="twitter:description" content="${description}">
  ${companyLogo ? `<meta name="twitter:image" content="${companyLogo}">` : ''}
  
  <!-- Redirect to SPA -->
  <meta http-equiv="refresh" content="0;url=${appUrl}">
  
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1.5rem;
      opacity: 0.9;
    }
    a {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: transform 0.2s;
    }
    a:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${opportunity.title}</h1>
    <p>${companyName} • ${opportunity.type} ${opportunity.location ? `• ${opportunity.location}` : ''}</p>
    <a href="${appUrl}">Ver oportunidad completa</a>
  </div>
  <script>
    // Redirect immediately
    window.location.href = "${appUrl}";
  </script>
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
  } catch (error) {
    console.error('Error in opportunity-share function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
