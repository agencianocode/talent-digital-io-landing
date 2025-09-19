import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import TalentTopNavigation from '@/components/TalentTopNavigation';

const TalentMarketplace = () => {
  const { user, userRole } = useSupabaseAuth();
  const { 
    isLoading, 
    applyToOpportunity, 
    hasApplied
  } = useSupabaseOpportunities();

  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  // Mock data for demo - replace with real data
  const mockOpportunities = [
    {
      id: '1',
      title: 'Closer de Ventas B2B para nicho Fitness',
      company: 'SalesXcelerator',
      logo: '🟣', // Purple icon
      daysAgo: 'Hace 2 días',
      compensation: 'A Comisión',
      applicants: '11 Postulantes',
      badge: 'Exclusiva',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: '2',
      title: 'Closer de Ventas B2B para nicho Fitness',
      company: 'SalesXcelerator',
      logo: '🔵', // Discord blue
      daysAgo: 'Hace 2 días',
      compensation: 'A Comisión',
      applicants: '11 Postulantes'
    },
    {
      id: '3',
      title: 'Closer de Ventas B2B para nicho Fitness',
      company: 'SalesXcelerator',
      logo: '🍔', // Burger King
      daysAgo: 'Hace 2 días',
      compensation: 'A Comisión',
      applicants: '11 Postulantes'
    },
    {
      id: '4',
      title: 'Closer de Ventas B2B para nicho Fitness',
      company: 'SalesXcelerator',
      logo: '🟣', // Purple icon
      daysAgo: 'Hace 2 días',
      compensation: 'A Comisión',
      applicants: '11 Postulantes'
    },
    {
      id: '5',
      title: 'Closer de Ventas B2B para nicho Fitness',
      company: 'SalesXcelerator',
      logo: '⏰', // Clock
      daysAgo: 'Hace 2 días',
      compensation: 'A Comisión',
      applicants: '11 Postulantes'
    },
    {
      id: '6',
      title: 'Closer de Ventas B2B para nicho Fitness',
      company: 'SalesXcelerator',
      logo: '❌', // X
      daysAgo: 'Hace 2 días',
      compensation: 'A Comisión',
      applicants: '11 Postulantes'
    }
  ];

  const handleApply = async (opportunityId: string) => {
    if (!user || !isTalentRole(userRole)) {
      toast.error('Solo los talentos pueden aplicar a oportunidades');
      return;
    }

    if (hasApplied(opportunityId)) {
      toast.error('Ya has aplicado a esta oportunidad');
      return;
    }

    setApplying(opportunityId);
    try {
      await applyToOpportunity(opportunityId, '');
      toast.success('¡Aplicación enviada exitosamente!');
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Error al enviar la aplicación');
    } finally {
      setApplying(null);
    }
  };

  if (!isTalentRole(userRole)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los talentos pueden acceder a esta página.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TalentTopNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentTopNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="bg-white mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 font-['Inter'] mb-2">
                Busca
              </h1>
            </div>
            
            <div className="flex gap-4">
              <Input
                placeholder="Busca"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-12 text-lg font-['Inter']"
              />
              <Button 
                className="bg-black hover:bg-gray-800 text-white h-12 px-8 font-['Inter']"
              >
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          {mockOpportunities.map((job) => (
            <Card key={job.id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {job.logo}
                  </div>
                  
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">
                            {job.title}
                          </h3>
                          {job.badge && (
                            <Badge className={`${job.badgeColor} border-0 text-xs font-['Inter']`}>
                              {job.badge}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 font-['Inter'] mb-2">
                          {job.company} ({job.daysAgo})
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-['Inter']">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {job.compensation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.applicants}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white font-['Inter']"
                          onClick={() => handleApply(job.id)}
                          disabled={applying === job.id}
                        >
                          {applying === job.id ? 'Aplicando...' : 'Aplicar'}
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TalentMarketplace;