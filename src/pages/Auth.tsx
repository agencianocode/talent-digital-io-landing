import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, isLoading, isAuthenticated, userRole } = useSupabaseAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const redirectPath = isBusinessRole(userRole) ? '/business-dashboard' : '/talent-dashboard';
      navigate(redirectPath);
    }
  }, [isAuthenticated, userRole, navigate]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas. Verifica tu email y contraseña.' 
        : 'Error al iniciar sesión. Intenta nuevamente.');
    }
    // La redirección se maneja automáticamente en useEffect
    
    setIsSubmitting(false);
  };


  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');

    const { error } = await signInWithGoogle();
    
    if (error) {
      setError('Error al iniciar sesión con Google. Intenta nuevamente.');
    }
    // La redirección se maneja automáticamente en useEffect
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Talento Digital
          </h1>
          <p className="text-muted-foreground">
            Conectando empresas con talento excepcional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tu email y contraseña para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tu contraseña"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

               <Button 
                 type="submit" 
                 className="w-full"
                 disabled={isSubmitting}
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Iniciando sesión...
                   </>
                 ) : (
                   'Iniciar Sesión'
                 )}
               </Button>

               <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-border" />
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                   <span className="bg-background px-2 text-muted-foreground">
                     O continúa con
                   </span>
                 </div>
               </div>

               <Button
                 type="button"
                 variant="outline"
                 onClick={handleGoogleSignIn}
                 disabled={isSubmitting}
                 className="w-full"
               >
                 <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                   <path
                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                     fill="#4285F4"
                   />
                   <path
                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                     fill="#34A853"
                   />
                   <path
                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                     fill="#FBBC05"
                   />
                   <path
                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                     fill="#EA4335"
                   />
                 </svg>
                 {isSubmitting ? "Conectando..." : "Continuar con Google"}
               </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-muted-foreground mb-2">¿No tienes cuenta?</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/user-selector')}
                className="text-primary hover:text-primary/80"
              >
                Crear cuenta
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;