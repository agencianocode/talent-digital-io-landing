import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Youtube, Facebook, MessageCircle, Plus, Share2 } from "lucide-react";
import TalentTopNavigation from "@/components/TalentTopNavigation";

const TalentMyProfile = () => {
  const { user } = useSupabaseAuth();
  
  // Profile states
  const [fullName, setFullName] = useState('Nombre Apellido');
  const [role, setRole] = useState('Closer de ventas');
  const [experience, setExperience] = useState('Senior (+4 años)');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [skills, setSkills] = useState([
    'Ventas Consultivas',
    'B2B',
    'Negocios Digitales',
    'Ventas B2B Corporativas',
    'Llamadas en frío'
  ]);
  const [bio, setBio] = useState('Experiencia de +3 años en ventas de productos financieros, seguros, inversiones para clientes p...');

  useEffect(() => {
    // Load user data from onboarding
    if (user) {
      setFullName(user.user_metadata?.full_name || user.user_metadata?.first_name + ' ' + user.user_metadata?.last_name || 'Nombre Apellido');
      setRole(user.user_metadata?.title || 'Closer de ventas');
      setExperience(user.user_metadata?.experience_level || 'Senior (+4 años)');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
      setBio(user.user_metadata?.bio || 'Experiencia de +3 años en ventas de productos financieros, seguros, inversiones para clientes p...');
      
      if (user.user_metadata?.skills) {
        setSkills(Array.isArray(user.user_metadata.skills) ? user.user_metadata.skills : []);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentTopNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8 font-['Inter']">
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Profile Card */}
            <Card className="bg-white">
              <CardContent className="p-8">
                {/* Profile Header */}
                <div className="flex items-start gap-6 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl bg-gray-100">
                      {fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 font-['Inter'] mb-1">
                      {fullName}
                    </h2>
                    <p className="text-lg text-gray-600 font-['Inter'] mb-1">
                      {role}
                    </p>
                    <p className="text-gray-500 font-['Inter'] mb-4">
                      {experience}
                    </p>
                    
                    <Button className="w-full bg-black hover:bg-gray-800 text-white font-['Inter']">
                      Editar
                    </Button>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <button className="text-blue-600 hover:text-blue-800 font-['Inter']">
                    Agregar ubicación
                  </button>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 font-['Inter']">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed font-['Inter']">
                    {bio}
                  </p>
                </div>

                {/* Social Media Links */}
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Card */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">
                      Portfolio
                    </h3>
                    <p className="text-sm text-gray-600 font-['Inter']">
                      Ve el portfolio de trabajos
                    </p>
                  </div>
                  <Button className="bg-black hover:bg-gray-800 text-white font-['Inter']">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share Profile Card */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-['Inter'] mb-2">
                    Compartir este perfil
                  </h3>
                  <p className="text-sm text-gray-600 font-['Inter']">
                    Copia el link para compartir el perfil público
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value="https://talentodigital.io/profile/usuario123"
                    readOnly
                    className="flex-1 font-['Inter']"
                  />
                  <Button variant="outline" className="font-['Inter']">
                    <Share2 className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Video de Presentación */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 font-['Inter'] mb-4">
                  Video de Presentación
                </h3>
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-['Inter']">
                    Video placeholder
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Experiencia */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">
                    Experiencia
                  </h3>
                  <Button className="bg-black hover:bg-gray-800 text-white font-['Inter']">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Experiencia
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-full h-16 bg-gray-100 rounded-lg"></div>
                  <div className="w-full h-16 bg-gray-100 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>

            {/* Educación */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">
                    Educación
                  </h3>
                  <Button className="bg-black hover:bg-gray-800 text-white font-['Inter']">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Educación
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-full h-16 bg-gray-100 rounded-lg"></div>
                  <div className="w-full h-16 bg-gray-100 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>

            {/* Servicios Publicados */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 font-['Inter'] mb-4">
                  Servicios Publicados
                </h3>
                <div className="text-center py-8">
                  <span className="text-gray-500 font-['Inter']">
                    No hay servicios publicados
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TalentMyProfile;