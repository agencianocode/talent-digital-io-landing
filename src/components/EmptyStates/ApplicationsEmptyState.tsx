import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Share2, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Target,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { InviteTalentModal } from '@/components/InviteTalentModal';

interface RecommendedTalent {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  skills: string[];
  experience: string;
  rating: number;
  location: string;
  isAvailable: boolean;
}

interface ApplicationsEmptyStateProps {
  opportunityTitle: string;
  opportunityId: string;
  companyId?: string;
  onInviteTalent?: () => void;
  onShareOpportunity?: () => void;
}

export const ApplicationsEmptyState = ({ 
  opportunityTitle, 
  opportunityId,
  companyId,
  onInviteTalent,
  onShareOpportunity 
}: ApplicationsEmptyStateProps) => {
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<any>(null);

  // Mock data para talentos recomendados
  const recommendedTalents: RecommendedTalent[] = [
    {
      id: '1',
      name: 'María González',
      title: 'Desarrolladora Full Stack',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      skills: ['React', 'Node.js', 'TypeScript'],
      experience: '3 años',
      rating: 4.8,
      location: 'Madrid, España',
      isAvailable: true
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      title: 'Diseñador UX/UI',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      experience: '2 años',
      rating: 4.6,
      location: 'Barcelona, España',
      isAvailable: true
    },
    {
      id: '3',
      name: 'Ana Martínez',
      title: 'Marketing Digital',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      skills: ['Google Ads', 'Social Media', 'Analytics'],
      experience: '4 años',
      rating: 4.9,
      location: 'Valencia, España',
      isAvailable: false
    }
  ];

  const handleCopyInviteLink = async () => {
    try {
      const inviteLink = `${window.location.origin}/opportunity/invite/${opportunityId}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('¡Enlace de invitación copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleInviteTalent = (talent: RecommendedTalent) => {
    if (companyId) {
      setSelectedTalent({
        id: talent.id,
        user_id: talent.id,
        full_name: talent.name,
        avatar_url: talent.avatar,
        title: talent.title
      });
      setShowInviteModal(true);
    } else if (onInviteTalent) {
      onInviteTalent();
    } else {
      toast.info(`Invitando a talento ${talent.id}`);
    }
  };

  const handleShareOpportunity = () => {
    if (onShareOpportunity) {
      onShareOpportunity();
    } else {
      toast.info('Compartiendo oportunidad...');
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Empty State */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no hay postulaciones
            </h3>
            
            <p className="text-gray-600 mb-6">
              Tu oportunidad <strong>"{opportunityTitle}"</strong> está publicada pero aún no ha recibido aplicaciones. 
              Te ayudamos a encontrar los mejores talentos.
            </p>

            <div className="space-y-3">
              <Button 
                onClick={handleShareOpportunity}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir en redes sociales
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCopyInviteLink}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar enlace de invitación
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Talents Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Talentos que podrían interesarte
            </h3>
            <p className="text-sm text-gray-600">
              Perfiles destacados que coinciden con tu oportunidad
            </p>
          </div>
          <Button variant="outline" size="sm">
            Ver todos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedTalents.map((talent) => (
            <Card key={talent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={talent.avatar} />
                    <AvatarFallback>
                      {talent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {talent.name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {talent.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">
                        {talent.rating} • {talent.experience}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {talent.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{talent.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    📍 {talent.location}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    disabled={!talent.isAvailable}
                    onClick={() => handleInviteTalent(talent)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {talent.isAvailable ? 'Invitar' : 'No disponible'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/business-dashboard/talent-profile/${talent.id}`, '_blank')}
                  >
                    Ver perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                💡 Consejos para recibir más aplicaciones
              </h4>
              
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Comparte tu oportunidad en LinkedIn y otras redes profesionales</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Invita directamente a talentos que conozcas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Revisa que la descripción sea clara y atractiva</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Considera ajustar el rango salarial si es necesario</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Talent Modal */}
      {companyId && (
        <InviteTalentModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedTalent(null);
          }}
          companyId={companyId}
          preselectedTalent={selectedTalent}
          preselectedOpportunity={opportunityId}
        />
      )}
    </div>
  );
};
