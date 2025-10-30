import * as React from 'react';

interface PublicProfileContactEmailProps {
  talentName: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany?: string;
  requesterRole?: string;
  message: string;
  contactType: 'proposal' | 'message' | 'general';
  replyUrl: string;
}

export const PublicProfileContactEmail = ({
  talentName,
  requesterName,
  requesterEmail,
  requesterCompany,
  requesterRole,
  message,
  contactType,
  replyUrl
}: PublicProfileContactEmailProps) => {
  const contactTypeText = contactType === 'proposal' ? 'una propuesta' : 'un mensaje';
  const companyInfo = requesterCompany ? ` de ${requesterCompany}` : '';
  const roleInfo = requesterRole ? ` (${requesterRole})` : '';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '10px' }}>
          📬 Nueva Solicitud de Contacto
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>
          Alguien quiere contactarte desde tu perfil público
        </p>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
          Hola {talentName},
        </p>

        <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
          <strong>{requesterName}</strong>{companyInfo}{roleInfo} te ha enviado {contactTypeText} desde tu perfil público:
        </p>

        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          borderLeft: '4px solid #6366f1',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '16px', color: '#333', margin: '0', whiteSpace: 'pre-wrap' }}>
            {message}
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            Información de Contacto:
          </p>
          <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
            <strong>Nombre:</strong> {requesterName}
          </p>
          <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
            <strong>Email:</strong> {requesterEmail}
          </p>
          {requesterCompany && (
            <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
              <strong>Empresa:</strong> {requesterCompany}
            </p>
          )}
          {requesterRole && (
            <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
              <strong>Cargo:</strong> {requesterRole}
            </p>
          )}
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={replyUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Responder Ahora
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
          También puedes responder directamente a este email y te llegará a {requesterEmail}.
        </p>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>💡 Consejo:</strong> Esta solicitud proviene de tu perfil público compartido. Si no deseas recibir más contactos, 
          puedes ajustar tu configuración de privacidad desde tu dashboard.
        </p>
        <p style={{ margin: '0' }}>
          Si consideras que este mensaje es spam, puedes reportarlo respondiendo a este email.
        </p>
      </div>

      <div style={{ 
        marginTop: '30px', 
        paddingTop: '20px', 
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
        fontSize: '12px',
        color: '#999'
      }}>
        <p style={{ margin: '5px 0' }}>
          Este es un email automático de TalentoDigital.io
        </p>
        <p style={{ margin: '5px 0' }}>
          © {new Date().getFullYear()} TalentoDigital.io - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};