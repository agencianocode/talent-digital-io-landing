import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Users } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { toast } from 'sonner';
import { UnifiedTalentCard } from '@/components/talent/UnifiedTalentCard';

interface RecommendedTalent {
  id: string;
  full_name: string;
  avatar_url: string | null;
  title: string;
  bio?: string;
  skills: string[];
  experience_level: string | null;
  location: string;
  score: number;
}

interface OpportunityRecommendedTalentsProps {
  opportunityId: string;
}

export default function OpportunityRecommendedTalents({ opportunityId }: OpportunityRecommendedTalentsProps) {
  const navigate = useNavigate();
  const { getOrCreateConversation, sendMessage: sendMessageToConversation } = useMessages();
  const [talents, setTalents] = useState<RecommendedTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [opportunitySkills, setOpportunitySkills] = useState<string[]>([]);
  const [opportunityCategory, setOpportunityCategory] = useState<string>('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<RecommendedTalent | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchRecommendedTalents = async () => {
      try {
        setLoading(true);

        // Fetch opportunity details
        const { data: opportunity, error: oppError } = await supabase
          .from('opportunities')
          .select('skills, experience_levels, category')
          .eq('id', opportunityId)
          .single();

        if (oppError) throw oppError;

        const skills = opportunity?.skills || [];
        const experienceLevels = opportunity?.experience_levels || [];
        const category = opportunity?.category || '';

        setOpportunitySkills(skills);
        setOpportunityCategory(category);

        // Fetch talent profiles
        const { data: talentProfiles, error: profileError } = await supabase
          .from('talent_profiles')
          .select(`
            user_id,
            title,
            bio,
            skills,
            experience_level,
            availability,
            city,
            country,
            location
          `)
          .limit(100);

        if (profileError) throw profileError;

        if (!talentProfiles || talentProfiles.length === 0) {
          setTalents([]);
          setLoading(false);
          return;
        }

        // Get user IDs
        const userIds = talentProfiles.map(tp => tp.user_id);

        // Fetch user profiles
        const { data: userProfiles, error: userError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, city, country, profile_completeness')
          .in('user_id', userIds);

        if (userError) throw userError;

        // Normalize opportunity skills for comparison
        const normalizedOppSkills = skills.map(s => s.toLowerCase().trim());
        
        // Also extract keywords from opportunity title/category for broader matching
        const categoryKeywords = category.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);
        
        // Score and rank talents - ONLY include those with actual relevance
        const scoredTalents = talentProfiles
          .map(talent => {
            const userProfile = userProfiles?.find(up => up.user_id === talent.user_id);
            if (!userProfile) return null;

            let score = 0;
            let hasRelevance = false;

            // Count matching skills (exact or partial match)
            let matchingSkillsCount = 0;
            if (talent.skills && normalizedOppSkills.length > 0) {
              const talentSkillsNormalized = talent.skills.map((s: string) => s.toLowerCase().trim());
              
              for (const talentSkill of talentSkillsNormalized) {
                for (const oppSkill of normalizedOppSkills) {
                  // Exact match or partial match (one contains the other)
                  if (talentSkill === oppSkill || 
                      talentSkill.includes(oppSkill) || 
                      oppSkill.includes(talentSkill)) {
                    matchingSkillsCount++;
                    hasRelevance = true;
                    break;
                  }
                }
              }
              score += matchingSkillsCount * 20;
            }

            // Check if talent title matches opportunity category/keywords
            if (talent.title) {
              const titleLower = talent.title.toLowerCase();
              for (const keyword of categoryKeywords) {
                if (titleLower.includes(keyword)) {
                  score += 15;
                  hasRelevance = true;
                }
              }
              // Also check against category directly
              const firstWord = titleLower.split(' ')[0] || '';
              if (titleLower.includes(category.toLowerCase()) || 
                  (firstWord && category.toLowerCase().includes(firstWord))) {
                score += 25;
                hasRelevance = true;
              }
            }

            // +10 if experience level matches
            if (talent.experience_level && experienceLevels.includes(talent.experience_level)) {
              score += 10;
              hasRelevance = true;
            }

            // Only include talents with actual relevance to the opportunity
            if (!hasRelevance) return null;

            // Bonus for profile quality (but only if already relevant)
            if (userProfile.profile_completeness) {
              score += userProfile.profile_completeness / 10;
            }
            if (talent.title && talent.title.length > 10) score += 3;
            if (talent.bio && talent.bio.length > 50) score += 3;
            if (talent.skills && talent.skills.length >= 3) score += 2;

            return {
              id: talent.user_id,
              full_name: userProfile.full_name || 'Sin nombre',
              avatar_url: userProfile.avatar_url || null,
              title: talent.title || 'Sin título',
              bio: talent.bio,
              skills: talent.skills || [],
              experience_level: talent.experience_level || null,
              location: talent.city && talent.country
                ? `${talent.city}, ${talent.country}`
                : talent.location || userProfile.city || 'Ubicación no especificada',
              score
            };
          })
          .filter(talent => talent !== null)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6) as RecommendedTalent[];

        setTalents(scoredTalents);
      } catch (error) {
        console.error('Error fetching recommended talents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedTalents();
  }, [opportunityId]);

  const handleInvite = (talent: RecommendedTalent) => {
    setSelectedTalent(talent);
    setMessage(`Hola ${talent.full_name}, me interesa tu perfil para una oportunidad.`);
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTalent) {
      toast.error('Por favor escribe un mensaje');
      return;
    }

    setIsSending(true);
    try {
      // Crear o obtener conversación
      const conversationId = await getOrCreateConversation(selectedTalent.id, 'profile_contact');
      // Enviar mensaje
      await sendMessageToConversation(conversationId, message.trim());
      
      toast.success('Mensaje enviado correctamente');
      setMessage('');
      setShowContactModal(false);
      setSelectedTalent(null);
      
      // Navegar al chat
      navigate(`/business-dashboard/messages/${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewAll = () => {
    const query = opportunitySkills.join(' ');
    navigate(`/business-dashboard/talent-discovery?q=${encodeURIComponent(query)}&category=${encodeURIComponent(opportunityCategory)}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Talentos que podrían interesarte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (talents.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Talentos que podrían interesarte
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleViewAll}>
              Ver todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {talents.map(talent => (
              <div key={talent.id} className="relative">
                <UnifiedTalentCard
                  userId={talent.id}
                  fullName={talent.full_name}
                  title={talent.title}
                  avatarUrl={talent.avatar_url}
                  location={talent.location}
                  bio={talent.bio}
                  skills={talent.skills}
                  primaryAction={{
                    label: 'Ver Perfil',
                    onClick: () => window.open(`/business-dashboard/talent-profile/${talent.id}`, '_blank')
                  }}
                  secondaryAction={{
                    label: 'Invitar',
                    icon: <MessageSquare className="h-4 w-4 mr-2" />,
                    onClick: () => handleInvite(talent)
                  }}
                  showBio={true}
                  maxSkills={3}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de contacto */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensaje a {selectedTalent?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedTalent(null);
                  setMessage('');
                }}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button onClick={handleSendMessage} disabled={isSending}>
                {isSending ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
