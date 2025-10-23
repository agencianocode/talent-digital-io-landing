import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmailRequest {
  to: string;
  userName: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, userName, type, title, message, actionUrl, actionText }: NotificationEmailRequest =
      await req.json();

    console.log('Sending notification email to:', to);

    const emailResponse = await resend.emails.send({
      from: 'TalentoDigital Notificaciones <notificaciones@app.talentodigital.io>',
      to: [to],
      subject: title,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                border-bottom: 2px solid #f0f0f0;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              h1 {
                color: #1a1a1a;
                font-size: 24px;
                margin: 0 0 10px 0;
              }
              .badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
              }
              .badge-opportunity { background-color: #e3f2fd; color: #1976d2; }
              .badge-application { background-color: #e8f5e9; color: #388e3c; }
              .badge-message { background-color: #fff3e0; color: #f57c00; }
              .badge-team { background-color: #f3e5f5; color: #7b1fa2; }
              .badge-marketplace { background-color: #fce4ec; color: #c2185b; }
              .content {
                margin: 20px 0;
                color: #555;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #1976d2;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .button:hover {
                background-color: #1565c0;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #f0f0f0;
                font-size: 12px;
                color: #999;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <span class="badge badge-${type}">${type}</span>
                <h1>${title}</h1>
              </div>
              
              <div class="content">
                <p>Hola ${userName},</p>
                <p>${message}</p>
              </div>
              
              ${
                actionUrl
                  ? `
                <a href="${actionUrl}" class="button">
                  ${actionText || 'Ver detalles'}
                </a>
              `
                  : ''
              }
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>Si no solicitaste esta notificación, puedes ignorar este correo.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-notification-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
