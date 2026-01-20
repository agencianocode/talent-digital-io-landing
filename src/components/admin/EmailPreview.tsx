import React from 'react';

interface EmailPreviewProps {
  subject: string;
  headerEnabled: boolean;
  headerTitle: string;
  headerColor1: string;
  headerColor2: string;
  bodyContent: string;
  buttonEnabled: boolean;
  buttonText: string;
  buttonLink: string;
  secondaryEnabled: boolean;
  secondaryContent: string;
  footerText: string;
  footerLink: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  subject,
  headerEnabled,
  headerTitle,
  headerColor1,
  headerColor2,
  bodyContent,
  buttonEnabled,
  buttonText,
  buttonLink,
  secondaryEnabled,
  secondaryContent,
  footerText,
  footerLink,
}) => {
  // Convert HTML content to email-safe HTML
  const processHtmlContent = (html: string) => {
    // Replace Tiptap classes with inline styles
    return html
      .replace(/<strong>/g, '<strong style="font-weight: 600;">')
      .replace(/<em>/g, '<em style="font-style: italic;">')
      .replace(/<a /g, '<a style="color: #2563eb; text-decoration: underline;" ')
      .replace(/<p>/g, '<p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">')
      .replace(/<p><\/p>/g, '<p style="margin: 0 0 16px 0;">&nbsp;</p>');
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
      <div 
        className="bg-white max-w-xl mx-auto rounded-lg shadow-lg overflow-hidden"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif" }}
      >
        {/* Header with gradient */}
        {headerEnabled && (
          <div 
            style={{ 
              background: `linear-gradient(135deg, ${headerColor1} 0%, ${headerColor2} 100%)`,
              padding: '40px 30px',
              textAlign: 'center',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {/* Logo placeholder */}
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <h1 style={{ color: 'white', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                {headerTitle || 'TalentoDigital'}
              </h1>
            </div>
          </div>
        )}

        {/* Main Title from Subject */}
        <div style={{ padding: '30px 30px 0 30px', textAlign: 'center' }}>
          <h2 style={{ 
            color: '#1a1a1a', 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '0 0 20px 0' 
          }}>
            {subject || 'Asunto del email'}
          </h2>
        </div>

        {/* Body Content */}
        <div style={{ padding: '0 30px 30px 30px' }}>
          <div 
            dangerouslySetInnerHTML={{ __html: processHtmlContent(bodyContent) || '<p style="color: #555;">Contenido del email...</p>' }}
          />
        </div>

        {/* CTA Button */}
        {buttonEnabled && buttonText && (
          <div style={{ padding: '0 30px 30px 30px', textAlign: 'center' }}>
            <a 
              href={buttonLink || '#'}
              style={{
                display: 'inline-block',
                backgroundColor: headerEnabled ? headerColor1 : '#4f46e5',
                color: 'white',
                padding: '14px 30px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {buttonText}
            </a>
          </div>
        )}

        {/* Secondary Content */}
        {secondaryEnabled && secondaryContent && (
          <div style={{ padding: '0 30px 30px 30px' }}>
            <div 
              dangerouslySetInnerHTML={{ __html: processHtmlContent(secondaryContent) }}
            />
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          padding: '20px 30px', 
          textAlign: 'center' 
        }}>
          <p style={{ 
            color: '#888', 
            fontSize: '12px', 
            margin: '0 0 8px 0' 
          }}>
            {footerText || '© 2025 TalentoDigital - Conectamos talento con oportunidades'}
          </p>
          {footerLink && (
            <a 
              href={footerLink}
              style={{ 
                color: '#6366f1', 
                fontSize: '12px', 
                textDecoration: 'none' 
              }}
            >
              Visita nuestra plataforma
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
