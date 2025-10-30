import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Mail,
  GraduationCap
} from 'lucide-react';

interface ShareAcademyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academyId: string;
  academySlug?: string;
  academyName: string;
}

export const ShareAcademyModal: React.FC<ShareAcademyModalProps> = ({
  open,
  onOpenChange,
  academyId,
  academySlug,
  academyName,
}) => {
  const [copiedDirectory, setCopiedDirectory] = useState(false);
  const [copiedActive, setCopiedActive] = useState(false);
  const [copiedGraduated, setCopiedGraduated] = useState(false);

  // Generate URLs
  const directoryUrl = academySlug 
    ? `${window.location.origin}/academy/${academySlug}`
    : `${window.location.origin}/academy/${academyId}`;
  
  const activeInviteUrl = `${window.location.origin}/accept-academy-invitation?academy=${academyId}&status=enrolled`;
  const graduatedInviteUrl = `${window.location.origin}/accept-academy-invitation?academy=${academyId}&status=graduated`;

  const copyToClipboard = async (text: string, type: 'directory' | 'active' | 'graduated') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'directory') {
        setCopiedDirectory(true);
        setTimeout(() => setCopiedDirectory(false), 2000);
      } else if (type === 'active') {
        setCopiedActive(true);
        setTimeout(() => setCopiedActive(false), 2000);
      } else {
        setCopiedGraduated(true);
        setTimeout(() => setCopiedGraduated(false), 2000);
      }
      
      toast.success('Link copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir {academyName}
          </DialogTitle>
          <DialogDescription>
            Comparte tu academia y enlaces de invitación con estudiantes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="directory" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Directorio
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Activos
            </TabsTrigger>
            <TabsTrigger value="graduated" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Graduados
            </TabsTrigger>
          </TabsList>

          {/* Directory Tab */}
          <TabsContent value="directory" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Directorio Público de Graduados
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Comparte este enlace para mostrar el directorio público de tus graduados
              </p>
              <div className="flex gap-2">
                <Input 
                  value={directoryUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(directoryUrl, 'directory')}
                  className="flex-shrink-0"
                >
                  {copiedDirectory ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(directoryUrl, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en nueva pestaña
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Active Students Tab */}
          <TabsContent value="active" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Link de Invitación - Estudiantes Activos
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Comparte este enlace con estudiantes que están cursando actualmente
              </p>
              <div className="flex gap-2">
                <Input 
                  value={activeInviteUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(activeInviteUrl, 'active')}
                  className="flex-shrink-0"
                >
                  {copiedActive ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Los estudiantes que usen este link serán registrados con el estado "Activo" en tu academia
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Graduated Students Tab */}
          <TabsContent value="graduated" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Link de Invitación - Graduados
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Comparte este enlace con estudiantes que ya se graduaron
              </p>
              <div className="flex gap-2">
                <Input 
                  value={graduatedInviteUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(graduatedInviteUrl, 'graduated')}
                  className="flex-shrink-0"
                >
                  {copiedGraduated ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-green-800">
                  <strong>Nota:</strong> Los estudiantes que usen este link serán registrados con el estado "Graduado" y aparecerán en el directorio público
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
