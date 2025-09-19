import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User } from "lucide-react";
import TalentTopNavigation from "@/components/TalentTopNavigation";

const TalentMyProfile = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  
  // Form states
  const [fullName, setFullName] = useState('Usuario');
  const [email, setEmail] = useState('usuario@email.com');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Try to get user from context first
    if (user) {
      setFullName(user.user_metadata?.full_name || user.user_metadata?.first_name + ' ' + user.user_metadata?.last_name || 'Usuario');
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone || '');
      setCountry(user.user_metadata?.country || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    } else {
      // Fallback: try to get user from session
      const getUserFromSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const currentUser = session.user;
            setFullName(currentUser.user_metadata?.full_name || currentUser.user_metadata?.first_name + ' ' + currentUser.user_metadata?.last_name || 'Usuario');
            setEmail(currentUser.email || '');
            setPhone(currentUser.user_metadata?.phone || '');
            setCountry(currentUser.user_metadata?.country || '');
            setAvatarUrl(currentUser.user_metadata?.avatar_url || null);
          }
        } catch (error) {
          console.error('Error getting user from session:', error);
        }
      };
      getUserFromSession();
    }
  }, [user]);

  // Always show profile - data will be populated from session if needed

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentTopNavigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/talent-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          </div>

          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-lg">
                    {fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{fullName}</p>
                  <p className="text-sm text-gray-500">Foto de perfil</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Colombia"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Cambiar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TalentMyProfile;