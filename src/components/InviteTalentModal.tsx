import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, 
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useInvitations } from '@/hooks/useInvitations';
import { supabase } from '@/integrations/supabase/client';

interface Talent {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  title?: string;
  skills?: string[];
  experience_level?: string;
}

interface Opportunity {
  id: string;
  title: string;
  company_id: string;
}

interface InviteTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  opportunities?: Opportunity[];
  preselectedTalent?: Talent;
  preselectedOpportunity?: string;
}

export const InviteTalentModal = ({
  isOpen,
  onClose,
  companyId,
  opportunities = [],
  preselectedTalent,
  preselectedOpportunity
}: InviteTalentModalProps) => {
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(preselectedTalent || null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>(preselectedOpportunity || '');
  const [invitationType, setInvitationType] = useState<'general' | 'opportunity_specific'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Talent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { createInvitation, isLoading, hasUserBeenInvited } = useInvitations();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTalent(preselectedTalent || null);
      setSelectedOpportunity(preselectedOpportunity || '');
      setInvitationType(preselectedOpportunity ? 'opportunity_specific' : 'general');
      setSubject('');
      setMessage('');
      setExpiresAt('');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, preselectedTalent, preselectedOpportunity]);

  // Update invitation type when opportunity is selected
  useEffect(() => {
    if (selectedOpportunity) {
      setInvitationType('opportunity_specific');
    }
  }, [selectedOpportunity]);

  // Search for talents
  const searchTalents = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          talent_profiles!inner(
            title,
            skills,
            experience_level
          )
        `)
        .ilike('full_name', `%${query}%`)
        .limit(10);

      if (error) throw error;

      const talents = (data || []).map((profile: any) => ({
        id: profile.user_id,
        user_id: profile.user_id,
        full_name: profile.full_name || 'Usuario',
        avatar_url: profile.avatar_url || undefined,
        title: profile.talent_profiles?.title,
        skills: profile.talent_profiles?.skills || [],
        experience_level: profile.talent_profiles?.experience_level
      }));

      setSearchResults(talents);
    } catch (error) {
      console.error('Error searching talents:', error);
      toast.error('Error al buscar talentos');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchTalents(value);
  };

  const handleTalentSelect = (talent: Talent) => {
    setSelectedTalent(talent);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedTalent) {
      toast.error('Por favor selecciona un talento');
      return;
    }

    if (!subject.trim()) {
      toast.error('Por favor ingresa un asunto');
      return;
    }

    if (!message.trim()) {
      toast.error('Por favor ingresa un mensaje');
      return;
    }

    if (invitationType === 'opportunity_specific' && !selectedOpportunity) {
      toast.error('Por favor selecciona una oportunidad');
      return;
    }

    // Check if user has already been invited to this opportunity
    if (invitationType === 'opportunity_specific' && selectedOpportunity) {
      const alreadyInvited = await hasUserBeenInvited(selectedTalent.user_id, selectedOpportunity);
      if (alreadyInvited) {
        toast.error('Este talento ya ha sido invitado a esta oportunidad');
        return;
      }
    }

    try {
      const invitationData = {
        company_id: companyId,
        talent_user_id: selectedTalent.user_id,
        opportunity_id: invitationType === 'opportunity_specific' ? selectedOpportunity : undefined,
        invitation_type: invitationType,
        subject: subject.trim(),
        message: message.trim(),
        expires_at: expiresAt || undefined,
      };

      const result = await createInvitation(invitationData);
      
      if (result) {
        toast.success('Invitación enviada exitosamente');
        onClose();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar la invitación');
    }
  };

  const generateDefaultSubject = () => {
    if (invitationType === 'opportunity_specific' && selectedOpportunity) {
      const opportunity = opportunities.find(opp => opp.id === selectedOpportunity);
      return `Invitación para ${opportunity?.title || 'nuestra oportunidad'}`;
    }
    return 'Invitación para colaborar con nosotros';
  };

  const generateDefaultMessage = () => {
    if (invitationType === 'opportunity_specific' && selectedOpportunity) {
      const opportunity = opportunities.find(opp => opp.id === selectedOpportunity);
      return `Hola ${selectedTalent?.full_name || 'talento'},

Nos gustaría invitarte a postularte para nuestra oportunidad "${opportunity?.title || 'oportunidad'}".

Creemos que tu perfil y experiencia serían una excelente adición a nuestro equipo.

¿Te interesaría conocer más detalles?

Saludos cordiales.`;
    }
    
    return `Hola ${selectedTalent?.full_name || 'talento'},

Nos gustaría invitarte a colaborar con nosotros.

Creemos que tu perfil y experiencia serían una excelente adición a nuestro equipo.

¿Te interesaría conocer más detalles?

Saludos cordiales.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Invitar Talento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Talent Selection */}
          <div>
            <Label htmlFor="talent-search">Buscar Talento</Label>
            <div className="relative mt-1">
              <Input
                id="talent-search"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                {searchResults.map((talent) => (
                  <div
                    key={talent.id}
                    onClick={() => handleTalentSelect(talent)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={talent.avatar_url} />
                        <AvatarFallback>
                          {talent.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{talent.full_name}</h4>
                        {talent.title && (
                          <p className="text-sm text-muted-foreground">{talent.title}</p>
                        )}
                        {talent.skills && talent.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {talent.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {talent.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{talent.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Talent */}
            {selectedTalent && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedTalent.avatar_url} />
                        <AvatarFallback>
                          {selectedTalent.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{selectedTalent.full_name}</h4>
                        {selectedTalent.title && (
                          <p className="text-sm text-muted-foreground">{selectedTalent.title}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTalent(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Opportunity Selection */}
          {opportunities.length > 0 && (
            <div>
              <Label htmlFor="opportunity">Oportunidad (Opcional)</Label>
              <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una oportunidad específica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Invitación general</SelectItem>
                  {opportunities.map((opportunity) => (
                    <SelectItem key={opportunity.id} value={opportunity.id}>
                      {opportunity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={generateDefaultSubject()}
              className="mt-1"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={generateDefaultMessage()}
              rows={6}
              className="mt-1"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <Label htmlFor="expires-at">Fecha de Expiración (Opcional)</Label>
            <Input
              id="expires-at"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedTalent || !subject.trim() || !message.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
