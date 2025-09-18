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
    
    // Si no hay parámetros, redirigir al selector de usuario
    if (!type && !userEmail) {
      navigate('/user-selector');
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
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
