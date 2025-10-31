import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseAuth, isBusinessRole, isAdminRole } from '@/contexts/SupabaseAuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import AuthDebugInfo from '@/components/AuthDebugInfo';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signInWithGoogle, resetPassword, updatePassword, isLoading, isAuthenticated, userRole, user, hasCompletedTalentOnboarding, hasCompletedBusinessOnboarding } = useSupabaseAuth();
  
  // Check for invitation parameters
  const invitationId = searchParams.get('invitation');
  const invitedEmail = searchParams.get('email');
  const isInvitationFlow = !!(invitationId && invitedEmail);
  
  // Track if redirect has happened to prevent multiple redirects
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Tab state for invitation flow
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Derive initial reset state synchronously to avoid race conditions
  const initialResetRoute = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('reset') === 'true';
  const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
  const initialRecoveryIntent = initialResetRoute || (initialHash && (initialHash.includes('type=recovery') || initialHash.includes('error=') || initialHash.includes('error_code=')));
  
  // Check if we're in password reset mode
  const [isPasswordReset, setIsPasswordReset] = useState(initialRecoveryIntent);
  const [isVerifyingRecovery, setIsVerifyingRecovery] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isResetRoute, setIsResetRoute] = useState(initialResetRoute);
  
  // Allow submission if session is ready OR user is authenticated (token-based sign-in)
  const canSubmitReset = isAuthenticated || isSessionReady;
  
  // Keep reset flags in sync if query params change
  useEffect(() => {
    const isReset = searchParams.get('reset') === 'true';
    setIsResetRoute(isReset);
    if (isReset) {
      setIsPasswordReset(true);
    }
  }, [searchParams]);

  // Detect Supabase recovery links in URL hash and handle errors
  useEffect(() => {
    const hash = window.location.hash;
    
    // Parse hash parameters for errors
    const parseHashParams = (hash: string) => {
      const params = new URLSearchParams(hash.substring(1));
      return {
        errorCode: params.get('error_code'),
        error: params.get('error'),
        errorDescription: params.get('error_description'),
        type: params.get('type')
      };
    };

    if (hash) {
      const hashParams = parseHashParams(hash);
      
      // Check for errors first
      if (hashParams.error || hashParams.errorCode) {
        console.log('Auth.tsx: Hash error detected:', hashParams);
        setIsPasswordReset(true);
        setIsVerifyingRecovery(false);
        setIsSessionReady(false);
        
        if (hashParams.errorCode === 'otp_expired') {
          setRecoveryError('El enlace de recuperación ha expirado. Solicita un nuevo enlace.');
        } else if (hashParams.error === 'access_denied') {
          setRecoveryError('El enlace de recuperación es inválido o ha expirado. Solicita un nuevo enlace.');
        } else {
          setRecoveryError('Hubo un problema con el enlace de recuperación. Solicita un nuevo enlace.');
        }
        
        // Clear the hash but persist ?reset=true to block auto-redirects
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('reset', 'true');
          window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
        } catch {}
        return;
      }
      
      // Check for valid recovery type
      if (hashParams.type === 'recovery') {
        console.log('Auth.tsx: Valid recovery link detected');
        setIsPasswordReset(true);
        setIsVerifyingRecovery(true);
        setRecoveryError(null);
        
        supabase.auth.getSession().then(({ data: { session } }) => {
          console.log('Auth.tsx: Recovery session check:', !!session);
          setIsSessionReady(!!session);
          if (!session) {
            setRecoveryError('No se pudo validar la sesión de recuperación. Solicita un nuevo enlace.');
          }
        }).catch((error) => {
          console.error('Auth.tsx: Session check error:', error);
          setRecoveryError('Error al validar la sesión. Solicita un nuevo enlace.');
        }).finally(() => {
          setIsVerifyingRecovery(false);
          // Clear the hash after processing but persist ?reset=true to block auto-redirects
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('reset', 'true');
            window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
          } catch {}
        });
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth.tsx: Auth state change:', event, !!session);
      const inResetFlow = (typeof window !== 'undefined') && (
        isResetRoute ||
        window.location.search.includes('reset=true') ||
        window.location.hash.includes('type=recovery')
      );
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && inResetFlow) {
        setIsPasswordReset(true);
        setIsSessionReady(!!session);
        setRecoveryError(null);
      }
    });

    // If we land here with ?reset=true and a valid session, enable the form
    if ((typeof window !== 'undefined') && (isResetRoute || window.location.search.includes('reset=true'))) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsSessionReady(!!session);
      }).catch(() => {});
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect if already authenticated - with race condition protection
  useEffect(() => {
    // Block redirect entirely when handling password recovery
    const urlHasReset = (typeof window !== 'undefined') && (window.location.search.includes('reset=true') || window.location.hash.includes('type=recovery'));
    const shouldBlockRedirect = isPasswordReset || isVerifyingRecovery || isResetRoute || !!recoveryError || urlHasReset;
    if (isAuthenticated && userRole && !hasRedirected && !isLoading && !shouldBlockRedirect) {
      console.log('Auth.tsx: Redirecting user with role:', userRole);
      setHasRedirected(true);
      
      // Check for invitation parameter
      const invitationId = searchParams.get('invitation');
      let redirectPath = '/talent-dashboard'; // default
      
      if (isAdminRole(userRole)) {
        redirectPath = '/admin';
        console.log('Auth.tsx: Redirecting admin to:', redirectPath);
      } else if (isBusinessRole(userRole)) {
        // Check if onboarding is already complete
        const checkBusinessOnboarding = async () => {
          if (user?.id) {
            const onboardingComplete = await hasCompletedBusinessOnboarding(user.id);
            console.log('Auth.tsx: Business onboarding complete?', onboardingComplete);
            
            if (onboardingComplete) {
              redirectPath = '/business-dashboard';
              console.log('Auth.tsx: Redirecting business to dashboard:', redirectPath);
            } else if (invitationId) {
              redirectPath = `/company-onboarding?invitation=${invitationId}`;
              console.log('Auth.tsx: Redirecting business to onboarding with invitation:', redirectPath);
            } else {
              redirectPath = '/company-onboarding';
              console.log('Auth.tsx: Redirecting business to onboarding:', redirectPath);
            }
            
            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 100);
          }
        };
        checkBusinessOnboarding();
        return; // Exit early to avoid the setTimeout below
      } else {
        // For talent users, check if they need onboarding first
        const checkTalentOnboarding = async () => {
          if (user?.id) {
            const isOnboardingComplete = await hasCompletedTalentOnboarding(user.id);
            console.log('Auth.tsx: Talent onboarding complete?', isOnboardingComplete);
            if (isOnboardingComplete) {
              redirectPath = '/talent-dashboard';
              console.log('Auth.tsx: Redirecting talent to dashboard:', redirectPath);
            } else {
              redirectPath = '/talent-onboarding';
              console.log('Auth.tsx: Redirecting talent to onboarding:', redirectPath);
            }
            navigate(redirectPath, { replace: true });
          }
        };
        checkTalentOnboarding();
        return; // Exit early to avoid the setTimeout below
      }
      
      // Add a small delay to ensure the auth context is fully loaded
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, userRole, hasRedirected, isLoading, navigate, isPasswordReset, isVerifyingRecovery, isResetRoute, recoveryError, user, hasCompletedTalentOnboarding, searchParams]);
  
  // Ensure the reset form is usable if the user is already authenticated via the recovery token
  useEffect(() => {
    if (isPasswordReset && isAuthenticated && !isSessionReady) {
      setIsSessionReady(true);
    }
  }, [isAuthenticated, isPasswordReset, isSessionReady]);
  
  const [formData, setFormData] = useState({
    email: invitedEmail || '',
    password: '',
    fullName: ''
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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

    console.log('Auth.tsx: Starting sign in process...');
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      console.error('Auth.tsx: Sign in error:', error);
      setError(error.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas. Verifica tu email y contraseña.' 
        : 'Error al iniciar sesión. Intenta nuevamente.');
    } else {
      console.log('Auth.tsx: Sign in successful, waiting for auth state update...');
      
      // Don't link invitation here - it will be handled in the onboarding flow
      if (invitationId) {
        console.log('Invitation detected, will be processed in onboarding:', invitationId);
      }
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
    } else {
      // If there's an invitation, the linking will happen after redirect
      // We'll store invitation info in session storage for later use
      if (invitationId && invitedEmail) {
        sessionStorage.setItem('pending_invitation', JSON.stringify({ invitationId, invitedEmail }));
      }
    }
    // La redirección se maneja automáticamente en useEffect
    
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    if (!resetEmail) {
      setError('Por favor ingresa tu email');
      setIsSubmitting(false);
      return;
    }

    // Add timeout protection (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.')), 30000)
    });

    try {
      await Promise.race([
        resetPassword(resetEmail),
        timeoutPromise
      ]);
      
      setMessage('Se ha enviado un email con las instrucciones para restablecer tu contraseña.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Error al enviar el email de recuperación. Intenta nuevamente.');
    }
    
    setIsSubmitting(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    const { error } = await updatePassword(newPassword);
    
    if (error) {
      console.error('Auth.tsx: Update password error:', error);
      setError(error.message || 'Error al actualizar la contraseña. Intenta nuevamente.');
      setIsSubmitting(false);
      return;
    }
    
    // Redirect after successful password update
    if (userRole) {
      if (isAdminRole(userRole)) {
        navigate('/admin', { replace: true });
      } else if (isBusinessRole(userRole)) {
        navigate('/business-dashboard', { replace: true });
      } else {
        navigate('/talent-dashboard', { replace: true });
      }
    } else {
      navigate('/talent-dashboard', { replace: true });
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    try {
      // Set redirect URL based on invitation flow
      const redirectUrl = isInvitationFlow && invitationId
        ? `${window.location.origin}/company-onboarding?invitation=${invitationId}`
        : `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            ...(isInvitationFlow && invitationId ? {
              pending_invitation: invitationId,
              invited_to_company: true
            } : {})
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: formData.fullName,
            email: formData.email
          });

        if (profileError) console.error('Error creating profile:', profileError);

        // Link invitation to user_id if this is an invitation flow
        if (isInvitationFlow && invitationId) {
          const { error: invitationLinkError } = await supabase
            .from('company_user_roles')
            .update({ user_id: data.user.id })
            .eq('id', invitationId)
            .eq('invited_email', formData.email)
            .eq('status', 'pending');

          if (invitationLinkError) {
            console.error('Error linking invitation to user:', invitationLinkError);
          } else {
            console.log('✅ Invitation linked to user_id');
          }
        }

        // Only assign business role if NOT an invitation flow
        // Invited users will get their role assigned when they complete onboarding
        if (!isInvitationFlow) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: 'business'
            });

          if (roleError) console.error('Error assigning role:', roleError);
        }

        toast.success('¡Cuenta creada exitosamente!');
        
        // Redirect to onboarding with invitation
        if (isInvitationFlow) {
          navigate(`/company-onboarding?invitation=${invitationId}`);
        } else {
          navigate('/company-onboarding');
        }
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message || 'Error al crear la cuenta. Por favor, intente nuevamente.');
    } finally {
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

  if (isPasswordReset && isVerifyingRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Validando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  // If in password reset mode, show password reset form
  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Talento Digital
            </h1>
            <p className="text-muted-foreground">
              {recoveryError ? 'Enlace de recuperación' : 'Establece tu nueva contraseña'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{recoveryError ? 'Error de Recuperación' : 'Nueva Contraseña'}</CardTitle>
              <CardDescription>
                {recoveryError 
                  ? 'Hubo un problema con el enlace de recuperación'
                  : 'Introduce tu nueva contraseña para completar el proceso'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recoveryError ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertDescription>{recoveryError}</AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => {
                      setRecoveryError(null);
                      setIsPasswordReset(false);
                      setIsResetRoute(false);
                      setShowForgotPassword(true);
                    }}
                    className="w-full"
                  >
                    Solicitar nuevo enlace
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {!canSubmitReset && (
                    <Alert>
                      <AlertDescription>
                        Validando sesión de recuperación...
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Introduce tu nueva contraseña"
                        required
                        disabled={!canSubmitReset}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                         disabled={!canSubmitReset}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        required
                         disabled={!canSubmitReset}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={!canSubmitReset}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting || !canSubmitReset}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando contraseña...
                      </>
                    ) : (
                      'Actualizar contraseña'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground"
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Invitation flow with tabs
  if (isInvitationFlow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Talento Digital
            </h1>
            <p className="text-muted-foreground">
              Has sido invitado a unirte a una empresa
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invitación a Empresa</CardTitle>
              <CardDescription>
                Por favor, inicia sesión o crea una cuenta para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as 'login' | 'register')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email de la invitación (no editable)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-login">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password-login"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          disabled={isSubmitting}
                          placeholder="Ingresa tu contraseña"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline w-full text-center"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="fullname-register">Nombre Completo</Label>
                      <Input
                        id="fullname-register"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        disabled={isSubmitting}
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input
                        id="email-register"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email de la invitación (no editable)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-register">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password-register"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={6}
                          disabled={isSubmitting}
                          placeholder="Mínimo 6 caracteres"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password-register">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password-register"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          disabled={isSubmitting}
                          placeholder="Repite tu contraseña"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        'Crear Cuenta y Aceptar Invitación'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
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
              {invitationId && invitedEmail ? (
                <>Has sido invitado a unirte a una empresa. Inicia sesión con <strong>{invitedEmail}</strong> o crea una cuenta con ese correo en la página de inicio.</>
              ) : (
                'Ingresa tu email y contraseña para continuar'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationId && invitedEmail && (
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>Invitación pendiente:</strong> Si no tienes cuenta, crea una en la página de inicio con el email <strong>{invitedEmail}</strong>
                </AlertDescription>
              </Alert>
            )}
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
                  readOnly={!!invitedEmail}
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
                
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                  >
                    ¿Olvidaste tu contraseña?
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
                onClick={() => navigate('/')}
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

      {/* Modal de recuperación de contraseña */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Recuperar contraseña</CardTitle>
              <CardDescription>
                Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar instrucciones'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                      setError('');
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <AuthDebugInfo />
    </div>
  );
};

export default Auth;