/**
 * Formats markdown-style text for opportunity descriptions and requirements
 * Converts:
 * - ### headings to bold text
 * - **text** to bold
 * - Line breaks to <br/>
 */
export function formatOpportunityText(text: string): string {
  if (!text) return '';
  
  return text
    // Convert ### headings to bold (remove ### and wrap in strong tags)
    .replace(/^###\s+(.*?)$/gm, '<strong>$1</strong>')
    // Convert **text** to bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert common labels to bold
    .replace(/(Habilidades:)/g, '<strong>$1</strong>')
    .replace(/(Herramientas:)/g, '<strong>$1</strong>')
    .replace(/(Contratistas requeridos:)/g, '<strong>$1</strong>')
    .replace(/(Zona horaria preferida:)/g, '<strong>$1</strong>')
    .replace(/(Idiomas preferidos:)/g, '<strong>$1</strong>')
    .replace(/(Responsabilidades:)/g, '<strong>$1</strong>')
    .replace(/(Requisitos:)/g, '<strong>$1</strong>')
    .replace(/(Descripción:)/g, '<strong>$1</strong>')
    // Convert line breaks to <br/>
    .replace(/\n/g, '<br/>');
}

/**
 * React component to render formatted opportunity text
 */
interface FormattedTextProps {
  text: string;
  className?: string;
}

export function FormattedOpportunityText({ text, className = '' }: FormattedTextProps) {
  const formattedText = formatOpportunityText(text);
  
  return (
    <div 
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
}
