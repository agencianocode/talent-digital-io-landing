import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { Loader2, Eye, EyeOff, Building2, ArrowLeft, GraduationCap } from 'lucide-react';

const RegisterBusiness = () => {
  const navigate = useNavigate();
  const { signUp, createCompany, isLoading, userRole, isAuthenticated } = useSupabaseAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    isAcademy: false,
    programType: '',
    studentsCount: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Effect to handle redirection after successful registration
  useEffect(() => {
    if (registrationComplete && isAuthenticated && isBusinessRole(userRole)) {
      navigate('/business-dashboard');
    }
  }, [registrationComplete, isAuthenticated, userRole, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    if (!formData.email || !formData.password || !formData.fullName || !formData.companyName) {
      setError('Por favor completa todos los campos');
      setIsSubmitting(false);
      return;
    }

    if (formData.isAcademy && !formData.programType) {
      setError('Por favor especifica el tipo de programa');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      user_type: 'business'
    });
    
    if (error) {
      setError(error.message === 'User already registered' 
        ? 'Este email ya está registrado. Intenta iniciar sesión.' 
        : 'Error al crear la cuenta. Intenta nuevamente.');
      setIsSubmitting(false);
    } else {
      setMessage('¡Cuenta creada exitosamente! Configurando tu empresa...');
      
      // Create company after successful signup
      const companyError = await createCompany({
        name: formData.companyName,
        business_type: formData.isAcademy ? 'academy' : 'company'
      });
      
      if (companyError.error) {
        setError('Cuenta creada pero error al configurar empresa. Puedes completar esto desde tu dashboard.');
      } else {
        setMessage('¡Cuenta y empresa creadas exitosamente! Redirigiendo...');
      }
      
      setRegistrationComplete(true);
      setIsSubmitting(false);
    }
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
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Registro para Empresas
          </h1>
          <p className="text-muted-foreground">
            Encuentra el mejor talento digital para tu empresa
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear cuenta empresarial</CardTitle>
            <CardDescription>
              Completa la información para comenzar a buscar talento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {formData.isAcademy ? 'Nombre de la institución *' : 'Nombre de la empresa *'}
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder={formData.isAcademy ? "Nombre de tu institución educativa" : "Nombre de tu empresa"}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAcademy"
                  checked={formData.isAcademy}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isAcademy: !!checked }))
                  }
                />
                <Label htmlFor="isAcademy" className="text-sm font-normal">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Soy una academia o institución educativa
                </Label>
              </div>

              {formData.isAcademy && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="space-y-2">
                    <Label htmlFor="programType">Tipo de programa *</Label>
                    <Input
                      id="programType"
                      name="programType"
                      type="text"
                      value={formData.programType}
                      onChange={handleChange}
                      placeholder="Ej: Bootcamp, Curso universitario, Certificación"
                      required={formData.isAcademy}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentsCount">Número aproximado de estudiantes</Label>
                    <Input
                      id="studentsCount"
                      name="studentsCount"
                      type="number"
                      value={formData.studentsCount}
                      onChange={handleChange}
                      placeholder="Número de estudiantes activos"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email corporativo *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@empresa.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                  required
                />
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
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta empresarial'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => navigate('/auth')}
              >
                Inicia sesión aquí
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterBusiness;