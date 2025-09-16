import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Play, 
  Image as ImageIcon, 
  FileText,
  ExternalLink
} from 'lucide-react';
import { ImageCropper } from './ImageCropper';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  onAddItem: (item: Omit<MediaItem, 'id'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<MediaItem>) => void;
  maxItems?: number;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  maxItems = 12
}) => {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    src: string;
    type: 'image' | 'video' | 'document';
  }>({ isOpen: false, src: '', type: 'image' });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    if (type === 'image') {
      setCropperState({ isOpen: true, src: url, type });
    } else {
      onAddItem({
        type,
        url,
        title: file.name,
        description: `${type === 'video' ? 'Video' : 'Documento'} subido: ${file.name}`
      });
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    onAddItem({
      type: 'image',
      url: croppedImageUrl,
      title: 'Imagen corporativa',
      description: 'Imagen añadida a la galería'
    });
    setCropperState({ isOpen: false, src: '', type: 'image' });
  };

  const handleAddLink = () => {
    if (newLink.url && newLink.title) {
      onAddItem({
        type: 'link',
        url: newLink.url,
        title: newLink.title,
        description: 'Enlace externo'
      });
      setNewLink({ url: '', title: '' });
      setIsAddingLink(false);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Play className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'document': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'link': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Galería Multimedia</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestiona imágenes, videos y documentos de tu empresa ({items.length}/{maxItems})
            </p>
          </div>
          <Badge variant="outline">{items.length} elementos</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Controls */}
        {items.length < maxItems && (
          <div className="border-2 border-dashed border-muted rounded-lg p-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Subir Imagen
                </Button>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Subir Video
                </Button>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleFileUpload(e, 'document')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Subir Documento
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingLink(true)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Agregar Enlace
              </Button>
            </div>
          </div>
        )}

        {/* Add Link Dialog */}
        <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
          <DialogContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agregar Enlace</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Título del enlace"
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingLink(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddLink}>
                  Agregar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Gallery Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    {/* Media Preview */}
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {item.type === 'image' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <img 
                              src={item.url} 
                              alt={item.title}
                              className="w-full h-full object-cover cursor-pointer"
                            />
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <img 
                              src={item.url} 
                              alt={item.title}
                              className="w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          {getMediaIcon(item.type)}
                          <span className="text-xs mt-2 text-center px-2">
                            {item.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {/* Type Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTypeColor(item.type)}`}
                      >
                        {getMediaIcon(item.type)}
                        <span className="ml-1 capitalize">{item.type}</span>
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay elementos en la galería</p>
            <p className="text-sm">Sube imágenes, videos o agrega enlaces para comenzar</p>
          </div>
        )}
      </CardContent>

      {/* Image Cropper */}
      <ImageCropper
        src={cropperState.src}
        isOpen={cropperState.isOpen}
        onClose={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
        onCropComplete={handleCropComplete}
        aspect={16/9}
      />
    </Card>
  );
};