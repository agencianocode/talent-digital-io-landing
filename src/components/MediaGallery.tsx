import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Play, 
  Image as ImageIcon, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { ImageCropper } from './ImageCropper';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

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
  const { user } = useSupabaseAuth();
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [newVideo, setNewVideo] = useState({ url: '', title: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    src: string;
    type: 'image' | 'video';
  }>({ isOpen: false, src: '', type: 'image' });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no admitido. Tipos permitidos: PNG, JPG');
      return;
    }

    // Validar tamaño del archivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo excede el tamaño permitido. Máximo: 2MB');
      return;
    }

    if (type === 'image') {
      const url = URL.createObjectURL(file);
      setCropperState({ isOpen: true, src: url, type });
    }
  };


  // Función helper para comprimir imágenes
  const compressImage = async (blob: Blob, quality: number = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar si es muy grande (máx 1600px para galería)
        let width = img.width;
        let height = img.height;
        const maxSize = 1600;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (compressedBlob) => {
            URL.revokeObjectURL(url);
            if (compressedBlob) {
              resolve(compressedBlob);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error al cargar imagen'));
      };
      
      img.src = url;
    });
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    setIsUploading(true);
    try {
      // Convertir blob URL a archivo
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      console.log('📊 Tamaño original:', (blob.size / 1024).toFixed(2), 'KB');
      
      // Comprimir la imagen antes de subir
      const compressedBlob = await compressImage(blob, 0.7); // 70% calidad
      
      console.log('📊 Tamaño comprimido:', (compressedBlob.size / 1024).toFixed(2), 'KB');
      
      // Verificar que no exceda el límite después de comprimir
      if (compressedBlob.size > 2 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande incluso después de comprimir. Usa una imagen más pequeña.');
        return;
      }
      
      // Crear archivo desde blob comprimido
      const file = new File([compressedBlob], 'company-image.jpg', { type: 'image/jpeg' });
      
      // Crear nombre único para el archivo
      const timestamp = Date.now();
      const filePath = `company-gallery/${user.id}/image-${timestamp}.jpg`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Agregar item a la galería con URL permanente
      onAddItem({
        type: 'image',
        url: data.publicUrl,
        title: 'Imagen corporativa',
        description: 'Imagen añadida a la galería'
      });

      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
      setCropperState({ isOpen: false, src: '', type: 'image' });
    }
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

  const getYouTubeThumbnail = (url: string): string | null => {
    // Extraer video ID de diferentes formatos de YouTube
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return null;
  };

  const getVimeoThumbnail = (url: string): string | null => {
    // Extraer video ID de Vimeo
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      // Para Vimeo necesitaríamos hacer una llamada a su API, por ahora retornamos null
      // y usaremos el placeholder genérico
      return null;
    }
    return null;
  };

  const getVideoThumbnail = (url: string): string | null => {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return getYouTubeThumbnail(url);
    } else if (lowerUrl.includes('vimeo.com')) {
      return getVimeoThumbnail(url);
    }
    
    return null;
  };

  const handleAddVideo = () => {
    if (newVideo.url && newVideo.title) {
      // Validar que sea una URL de video válida
      const videoUrl = newVideo.url.toLowerCase();
      const isValidVideoUrl = videoUrl.includes('youtube.com') || 
                             videoUrl.includes('youtu.be') || 
                             videoUrl.includes('loom.com') || 
                             videoUrl.includes('vimeo.com') || 
                             videoUrl.includes('dailymotion.com') ||
                             videoUrl.includes('twitch.tv');

      if (!isValidVideoUrl) {
        toast.error('Por favor ingresa una URL válida de YouTube, Loom, Vimeo, Dailymotion o Twitch');
        return;
      }

      // Obtener thumbnail si es posible
      const thumbnail = getVideoThumbnail(newVideo.url);

      onAddItem({
        type: 'video',
        url: newVideo.url,
        title: newVideo.title,
        description: 'Video de plataforma externa',
        thumbnail: thumbnail || undefined
      });
      setNewVideo({ url: '', title: '' });
      setIsAddingVideo(false);
      toast.success('Video agregado correctamente');
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Play className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
              Gestiona imágenes y videos de tu empresa ({items.length}/{maxItems})
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
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isUploading}
                  className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4 mr-2" />
                  )}
                  Subir Imagen
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG hasta 2MB
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingVideo(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                Agregar Video
              </Button>
              
              
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
                <div className="space-y-2">
                  <Label htmlFor="link-title">Título del enlace</Label>
                  <Input
                    id="link-title"
                    placeholder="Título del enlace"
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://..."
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
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

        {/* Add Video Dialog */}
        <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
          <DialogContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agregar Video</h3>
              <p className="text-sm text-muted-foreground">
                Agrega enlaces de YouTube, Loom, Vimeo, Dailymotion o Twitch
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Título del video</Label>
                  <Input
                    id="video-title"
                    placeholder="Título del video"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-url">URL del video</Label>
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=... o https://loom.com/share/..."
                    value={newVideo.url}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingVideo(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddVideo}>
                  Agregar Video
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
                      ) : item.type === 'video' ? (
                        item.thumbnail ? (
                          <div className="relative w-full h-full group">
                            <img 
                              src={item.thumbnail} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Si la miniatura falla, mostrar el placeholder
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-white bg-black bg-opacity-60 hover:bg-opacity-80"
                                onClick={() => window.open(item.url, '_blank')}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Ver Video
                              </Button>
                            </div>
                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded hidden">
                              {item.title}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                            <Play className="h-8 w-8 mb-2" />
                            <span className="text-xs text-center px-2 font-medium">
                              {item.title}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-xs"
                              onClick={() => window.open(item.url, '_blank')}
                            >
                              Ver Video
                            </Button>
                          </div>
                        )
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