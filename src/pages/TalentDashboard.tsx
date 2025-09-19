import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Search,
  DollarSign,
  Users,
  Clock,
  MapPin,
  Building
} from 'lucide-react';
import TalentTopNavigation from '@/components/TalentTopNavigation';

const TalentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Show dashboard directly - onboarding check is handled by Auth.tsx

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/talent-dashboard/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentTopNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Profile Completion Section */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 font-['Inter']">
                Tu perfil está al 60%
              </CardTitle>
              <p className="text-gray-600 font-['Inter']">
                Complétalo para atraer más talento y generar confianza.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={60} className="h-2" />
              
              <div className="space-y-3">
                {/* Onboarding Completado */}
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 font-['Inter']">Onboarding Completado</span>
                </div>
                
                {/* Agregar Experiencia y Educación */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 font-['Inter']">Agrega Experiencia y Educación</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 font-['Inter']"
                    onClick={() => navigate('/talent-dashboard/profile')}
                  >
                    Completar Perfil ahora <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                {/* Agregar Video de Presentación */}
                <div className="flex items-center gap-3">
                  <Circle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 font-['Inter']">Agrega un Video de Presentación</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 font-['Inter']">
                Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                <Button variant="outline" size="sm" className="font-['Inter']">
                  Categoría
                </Button>
                <Button variant="outline" size="sm" className="font-['Inter']">
                  Skills
                </Button>
                <Button variant="outline" size="sm" className="font-['Inter']">
                  Tipo de Contrato
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Input
                  placeholder="Busca"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 font-['Inter']"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-black hover:bg-gray-800 text-white font-['Inter']"
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">
              Oportunidades Recientes
            </h2>
            
            {/* Job Card 1 */}
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo Placeholder */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">
                            Closer de Ventas B2B para nicho Fitness
                          </h3>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Activa
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 font-['Inter'] mb-2">
                          SalesXcelerator
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-['Inter']">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            A Comisión
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            11 Postulantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Hace 2 días
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white font-['Inter']"
                        >
                          Aplicar
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-4 bg-gray-400 rounded-full mx-1"></div>
                          <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Card 2 */}
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo Placeholder */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">
                            Closer de Ventas B2B para nicho Fitness
                          </h3>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Activa
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 font-['Inter'] mb-2">
                          SalesXcelerator
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-['Inter']">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            A Comisión
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            11 Postulantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Hace 2 días
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white font-['Inter']"
                        >
                          Aplicar
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-4 bg-gray-400 rounded-full mx-1"></div>
                          <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TalentDashboard;
