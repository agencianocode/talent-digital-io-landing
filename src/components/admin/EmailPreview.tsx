import React from 'react';

interface EmailPreviewProps {
  subject: string;
  headerEnabled: boolean;
  headerTitle: string;
  headerColor1: string;
  headerColor2: string;
  headerTextColor: 'white' | 'black';
  bodyContent: string;
  buttonEnabled: boolean;
  buttonText: string;
  buttonLink: string;
  secondaryEnabled: boolean;
  secondaryContent: string;
  footerContent: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  headerEnabled,
  headerTitle,
  headerColor1,
  headerColor2,
  headerTextColor,
  bodyContent,
  buttonEnabled,
  buttonText,
  buttonLink,
  secondaryEnabled,
  secondaryContent,
  footerContent,
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

  // Process footer HTML - smaller text and links styled appropriately
  const processFooterHtml = (html: string | undefined) => {
    if (!html) return '';
    return html
      .replace(/<strong>/g, '<strong style="font-weight: 600;">')
      .replace(/<em>/g, '<em style="font-style: italic;">')
      .replace(/<a /g, '<a style="color: #6366f1; text-decoration: none;" ')
      .replace(/<p>/g, '<p style="color: #888; font-size: 12px; line-height: 1.4; margin: 0 0 8px 0;">')
      .replace(/<p><\/p>/g, '<p style="margin: 0 0 8px 0;">&nbsp;</p>');
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
            <h1 style={{ color: headerTextColor, margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
              {headerTitle || 'TalentoDigital'}
            </h1>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '30px' }}>
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

        {/* Footer with rich text */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          padding: '20px 30px', 
          textAlign: 'center' 
        }}>
          <div 
            dangerouslySetInnerHTML={{ __html: processFooterHtml(footerContent) || '<p style="color: #888; font-size: 12px;">© 2025 TalentoDigital</p>' }}
          />
        </div>
      </div>
    </div>
  );
};
