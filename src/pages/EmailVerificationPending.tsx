import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';

const EmailVerificationPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<'business' | 'talent'>('talent');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Obtener parámetros de la URL
    const type = searchParams.get('type') as 'business' | 'talent';
    const userEmail = searchParams.get('email');
    
    if (type) {
      setUserType(type);
    }
    if (userEmail) {
      setEmail(userEmail);
    }
    
    // Si no hay parámetros, redirigir a la home
    if (!type && !userEmail) {
      navigate('/');
    }
  }, [searchParams, navigate]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              ¡Cuenta creada exitosamente!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Verifica tu email para continuar
                </h3>
                <p className="text-gray-600">
                  Te hemos enviado un email de verificación a:
                </p>
                <p className="font-medium text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                  {email || 'tu email'}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Próximos pasos:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 text-left">
                  <li>1. Revisa tu bandeja de entrada</li>
                  <li>2. Haz clic en el enlace de verificación</li>
                  <li>3. {userType === 'business' 
                    ? 'Configura tu empresa y comienza a buscar talento' 
                    : 'Completa tu perfil y explora oportunidades'
                  }</li>
                </ol>
              </div>
              
              <p className="text-xs text-gray-500">
                ¿No ves el email? Revisa tu carpeta de spam o correo no deseado
              </p>
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Si necesitas ayuda escribinos a{' '}
                  <a href="mailto:hola@talentodigital.io" className="text-primary hover:underline font-medium">
                    hola@talentodigital.io
                  </a>
                </p>
                <a 
                  href="https://www.instagram.com/talentodigital.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <svg 
                    className="h-5 w-5" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
